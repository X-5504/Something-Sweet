package handlers

import (
	"crypto/rand"
	"fmt"
	"math/big"
	"net/http"
	"time"

	"something-sweet/backend/internal/database"
	"something-sweet/backend/internal/models"

	"github.com/gin-gonic/gin"
)

type CartItemInput struct {
	ProductID string `json:"product_id" binding:"required"`
	Quantity  int    `json:"quantity" binding:"required,min=1"`
}

type CreateOrderInput struct {
	CustomerName    string          `json:"customer_name" binding:"required"`
	CustomerPhone   string          `json:"customer_phone" binding:"required"`
	CustomerEmail   string          `json:"customer_email"`
	DeliveryAddress string          `json:"delivery_address" binding:"required"`
	DeliveryMethod  string          `json:"delivery_method" binding:"required"` // "grab" | "gosend" | "pickup"
	DeliveryZoneID  string          `json:"delivery_zone_id"`                   // UUID of DeliveryZone, optional if pickup
	PreorderDate    string          `json:"preorder_date" binding:"required"`   // YYYY-MM-DD
	Notes           string          `json:"notes"`
	Items           []CartItemInput `json:"items" binding:"required,min=1"`
}

// GenerateRandom4Digits generates a random 4-digit number as string
func GenerateRandom4Digits() string {
	n, _ := rand.Int(rand.Reader, big.NewInt(9000))
	return fmt.Sprintf("%04d", n.Int64()+1000)
}

// CreateOrder handles creating a new order
func CreateOrder(c *gin.Context) {
	var input CreateOrderInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate Preorder Date
	preorderTime, err := time.Parse("2006-01-02", input.PreorderDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid preorder date format. Expected YYYY-MM-DD"})
		return
	}

	// Verify date is not in the past (minimum is tomorrow)
	today := time.Now().Truncate(24 * time.Hour)
	if !preorderTime.After(today) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Preorder date must be at least tomorrow"})
		return
	}

	// Verify date is not blocked
	var blockedCount int64
	database.DB.Model(&models.BlockedDate{}).Where("date = ?", preorderTime).Count(&blockedCount)
	if blockedCount > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "The selected preorder date is fully booked. Please choose another date."})
		return
	}

	// Calculate delivery fee
	var deliveryFee int64 = 0
	if input.DeliveryMethod != "pickup" {
		if input.DeliveryZoneID == "" {
			// Fallback if not specified
			deliveryFee = 20000
		} else {
			var zone models.DeliveryZone
			if err := database.DB.First(&zone, "id = ?", input.DeliveryZoneID).Error; err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid delivery zone selected"})
				return
			}
			deliveryFee = zone.DeliveryFee
		}
	}

	// Start a DB transaction
	tx := database.DB.Begin()

	// Calculate subtotal and build order items
	var subtotal int64 = 0
	var orderItems []models.OrderItem

	for _, itemInput := range input.Items {
		var product models.Product
		if err := tx.First(&product, "id = ? AND is_active = ?", itemInput.ProductID, true).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Product %s not found or inactive", itemInput.ProductID)})
			return
		}

		itemSubtotal := product.Price * int64(itemInput.Quantity)
		subtotal += itemSubtotal

		orderItems = append(orderItems, models.OrderItem{
			ProductID: product.ID,
			Name:      product.Name,
			Price:     product.Price,
			Quantity:  itemInput.Quantity,
			Subtotal:  itemSubtotal,
		})
	}

	totalAmount := subtotal + deliveryFee

	// Generate unique Order Number: SS-YYYYMMDD-XXXX
	dateStr := time.Now().Format("20060102")
	var orderNumber string
	for {
		orderNumber = fmt.Sprintf("SS-%s-%s", dateStr, GenerateRandom4Digits())
		var existsCount int64
		database.DB.Model(&models.Order{}).Where("order_number = ?", orderNumber).Count(&existsCount)
		if existsCount == 0 {
			break
		}
	}

	// Create the Order
	order := models.Order{
		OrderNumber:     orderNumber,
		CustomerName:    input.CustomerName,
		CustomerPhone:   input.CustomerPhone,
		CustomerEmail:   input.CustomerEmail,
		DeliveryAddress: input.DeliveryAddress,
		DeliveryMethod:  input.DeliveryMethod,
		PreorderDate:    preorderTime,
		Subtotal:        subtotal,
		DeliveryFee:     deliveryFee,
		TotalAmount:     totalAmount,
		Status:          "pending",
		Notes:           input.Notes,
		OrderItems:      orderItems,
	}

	if err := tx.Create(&order).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save order"})
		return
	}

	tx.Commit()

	c.JSON(http.StatusCreated, order)
}

// GetOrderByID returns order detail by ID
func GetOrderByID(c *gin.Context) {
	id := c.Param("id")
	var order models.Order
	if err := database.DB.Preload("OrderItems").Preload("Payment").First(&order, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
		return
	}
	c.JSON(http.StatusOK, order)
}

// TrackOrder returns order detail by Order Number (guest tracking)
func TrackOrder(c *gin.Context) {
	orderNumber := c.Param("orderNumber")
	var order models.Order
	if err := database.DB.Preload("OrderItems").Preload("Payment").First(&order, "order_number = ?", orderNumber).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Order not found. Please double check your order code."})
		return
	}
	c.JSON(http.StatusOK, order)
}

// --- Admin Endpoints ---

// AdminGetOrders returns all orders
func AdminGetOrders(c *gin.Context) {
	orders := []models.Order{}
	// Order by created_at desc to show newest orders first
	err := database.DB.Preload("OrderItems").Preload("Payment").Order("created_at desc").Find(&orders).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch orders"})
		return
	}
	c.JSON(http.StatusOK, orders)
}

// AdminUpdateOrderStatus updates order status manually
func AdminUpdateOrderStatus(c *gin.Context) {
	id := c.Param("id")
	var order models.Order
	if err := database.DB.First(&order, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
		return
	}

	var input struct {
		Status string `json:"status" binding:"required"` // pending | paid | confirmed | delivered | cancelled
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	validStatuses := map[string]bool{
		"pending":   true,
		"paid":      true,
		"confirmed": true,
		"delivered": true,
		"cancelled": true,
	}

	if !validStatuses[input.Status] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid order status"})
		return
	}

	order.Status = input.Status
	if err := database.DB.Save(&order).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update order status"})
		return
	}

	c.JSON(http.StatusOK, order)
}
