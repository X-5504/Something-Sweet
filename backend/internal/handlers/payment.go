package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"something-sweet/backend/internal/config"
	"something-sweet/backend/internal/database"
	"something-sweet/backend/internal/models"
	"something-sweet/backend/internal/services"

	"github.com/gin-gonic/gin"
)

type CreatePaymentInput struct {
	OrderID       string `json:"order_id" binding:"required"`
	PaymentMethod string `json:"payment_method" binding:"required"` // e.g. "BCA VA" -> code for Duitku
}

// CreatePayment handles initiating a transaction with Duitku
func CreatePayment(c *gin.Context) {
	var input CreatePaymentInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Fetch the order
	var order models.Order
	if err := database.DB.Preload("OrderItems").First(&order, "id = ?", input.OrderID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
		return
	}

	// If order is already paid, return existing payment if any
	if order.Status == "paid" {
		var existingPayment models.Payment
		if err := database.DB.Where("order_id = ?", order.ID).First(&existingPayment).Error; err == nil {
			c.JSON(http.StatusOK, existingPayment)
			return
		}
	}

	// Request inquiry from Duitku
	inquiryResp, err := services.RequestDuitkuInquiry(order, input.PaymentMethod)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Duitku inquiry failed: %v", err)})
		return
	}

	// Check if a payment record already exists for this order, if so update it, otherwise create
	var payment models.Payment
	err = database.DB.Where("order_id = ?", order.ID).First(&payment).Error

	isNew := err != nil

	payment.OrderID = order.ID
	payment.MerchantOrderID = order.OrderNumber
	payment.DuitkuReference = inquiryResp.Reference
	payment.PaymentMethod = input.PaymentMethod
	payment.PaymentURL = inquiryResp.PaymentUrl
	payment.VANumber = inquiryResp.VANumber
	payment.Amount = order.TotalAmount
	payment.Status = "pending"

	if isNew {
		if err := database.DB.Create(&payment).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create payment record"})
			return
		}
	} else {
		if err := database.DB.Save(&payment).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update payment record"})
			return
		}
	}

	c.JSON(http.StatusOK, payment)
}

// DuitkuCallbackRequest represents the payload Duitku sends to callback URL
type DuitkuCallbackRequest struct {
	MerchantCode    string `form:"merchantCode" json:"merchantCode"`
	Amount          int64  `form:"amount" json:"amount"`
	MerchantOrderID string `form:"merchantOrderId" json:"merchantOrderId"`
	ProductDetails  string `form:"productDetails" json:"productDetails"`
	AdditionalParam string `form:"additionalParam" json:"additionalParam"`
	PaymentMethod   string `form:"paymentCode" json:"paymentCode"` // Duitku sends paymentCode
	ResultCode      string `form:"resultCode" json:"resultCode"`   // "00" is success
	Reference       string `form:"reference" json:"reference"`
	Signature       string `form:"signature" json:"signature"`
}

// DuitkuCallback handles Duitku server-to-server webhook callback
func DuitkuCallback(c *gin.Context) {
	// Duitku can send callback as multipart-form or JSON. Let's handle both.
	var req DuitkuCallbackRequest

	// Try JSON first, fallback to Bind/Form
	if err := c.ShouldBind(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid callback data"})
		return
	}

	// Logging callback received
	log.Printf("[Duitku Callback] Received webhook for order %s. ResultCode: %s, Signature: %s", 
		req.MerchantOrderID, req.ResultCode, req.Signature)

	// Verify callback signature: md5(merchantCode + amount + merchantOrderId + apiKey)
	isValid := services.VerifyCallbackSignature(req.MerchantCode, req.Amount, req.MerchantOrderID, req.Signature)
	if !isValid {
		log.Printf("[Duitku Callback] Signature mismatch for order %s", req.MerchantOrderID)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid signature"})
		return
	}

	// Update Payment and Order status in DB
	err := processPaymentStatusUpdate(req.MerchantOrderID, req.ResultCode, req.Reference, &req)
	if err != nil {
		log.Printf("[Duitku Callback] Failed to process status update: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Duitku expects a HTTP 200 response with "OK" or similar success string
	c.String(http.StatusOK, "OK")
}

// Helper to update DB statuses
func processPaymentStatusUpdate(orderNumber string, resultCode string, reference string, rawData interface{}) error {
	tx := database.DB.Begin()

	// Find the order
	var order models.Order
	if err := tx.First(&order, "order_number = ?", orderNumber).Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("order %s not found", orderNumber)
	}

	// Find the payment
	var payment models.Payment
	if err := tx.First(&payment, "order_id = ?", order.ID).Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("payment record for order %s not found", order.ID)
	}

	// Map Duitku resultCode: "00" = success, others = failed/expired
	var paymentStatus string
	var orderStatus string
	now := time.Now()

	if resultCode == "00" {
		paymentStatus = "success"
		orderStatus = "paid"
		payment.PaidAt = &now
	} else if resultCode == "01" {
		paymentStatus = "failed"
		orderStatus = "pending" // Let user try again
	} else {
		paymentStatus = "expired"
		orderStatus = "cancelled"
	}

	// Store raw callback data
	rawJson, _ := json.Marshal(rawData)
	payment.CallbackData = string(rawJson)
	payment.Status = paymentStatus
	payment.DuitkuReference = reference

	if err := tx.Save(&payment).Error; err != nil {
		tx.Rollback()
		return err
	}

	order.Status = orderStatus
	if err := tx.Save(&order).Error; err != nil {
		tx.Rollback()
		return err
	}

	tx.Commit()
	log.Printf("[Duitku Callback] Successfully updated Order %s status to %s", orderNumber, orderStatus)
	return nil
}

// GetPaymentStatus returns the status of a payment for polling
func GetPaymentStatus(c *gin.Context) {
	orderID := c.Param("orderId")
	var payment models.Payment
	if err := database.DB.First(&payment, "order_id = ?", orderID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Payment record not found"})
		return
	}
	c.JSON(http.StatusOK, payment)
}

// LocalMockTrigger triggers payment simulation locally (Success or Failure)
func LocalMockTrigger(c *gin.Context) {
	var input struct {
		OrderID string `json:"order_id" binding:"required"`
		Success bool   `json:"success"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var order models.Order
	if err := database.DB.First(&order, "id = ?", input.OrderID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
		return
	}

	resultCode := "00"
	if !input.Success {
		resultCode = "01"
	}

	// Build a mock callback request
	req := DuitkuCallbackRequest{
		MerchantCode:    config.AppConfig.DuitkuMerchantCode,
		Amount:          order.TotalAmount,
		MerchantOrderID: order.OrderNumber,
		ProductDetails:  "Mock Payment Session",
		ResultCode:      resultCode,
		Reference:       "MOCK-REF-" + order.OrderNumber,
	}

	// Generate standard signature to be consistent
	sigStr := fmt.Sprintf("%s%d%s%s", req.MerchantCode, req.Amount, req.MerchantOrderID, config.AppConfig.DuitkuApiKey)
	req.Signature = services.ComputeMD5(sigStr)

	err := processPaymentStatusUpdate(order.OrderNumber, resultCode, req.Reference, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Mock processing failed: %v", err)})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Payment simulation processed successfully",
		"status":  order.Status,
	})
}
