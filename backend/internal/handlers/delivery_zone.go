package handlers

import (
	"net/http"

	"something-sweet/backend/internal/database"
	"something-sweet/backend/internal/models"

	"github.com/gin-gonic/gin"
)

// GetDeliveryZones returns all delivery zones
func GetDeliveryZones(c *gin.Context) {
	zones := []models.DeliveryZone{}
	err := database.DB.Order("delivery_fee asc").Find(&zones).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch delivery zones"})
		return
	}
	c.JSON(http.StatusOK, zones)
}

// AdminCreateDeliveryZone creates a new delivery zone
func AdminCreateDeliveryZone(c *gin.Context) {
	var input struct {
		Name            string `json:"name" binding:"required"`
		AreaDescription string `json:"area_description"`
		DeliveryFee     int64  `json:"delivery_fee" binding:"required,min=0"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	zone := models.DeliveryZone{
		Name:            input.Name,
		AreaDescription: input.AreaDescription,
		DeliveryFee:     input.DeliveryFee,
	}

	if err := database.DB.Create(&zone).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create delivery zone"})
		return
	}

	c.JSON(http.StatusCreated, zone)
}

// AdminUpdateDeliveryZone updates an existing delivery zone
func AdminUpdateDeliveryZone(c *gin.Context) {
	id := c.Param("id")
	var zone models.DeliveryZone
	if err := database.DB.First(&zone, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Delivery zone not found"})
		return
	}

	var input struct {
		Name            string `json:"name"`
		AreaDescription string `json:"area_description"`
		DeliveryFee     *int64 `json:"delivery_fee" binding:"omitempty,min=0"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.Name != "" {
		zone.Name = input.Name
	}
	if input.AreaDescription != "" {
		zone.AreaDescription = input.AreaDescription
	}
	if input.DeliveryFee != nil {
		zone.DeliveryFee = *input.DeliveryFee
	}

	if err := database.DB.Save(&zone).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update delivery zone"})
		return
	}

	c.JSON(http.StatusOK, zone)
}

// AdminDeleteDeliveryZone deletes a delivery zone
func AdminDeleteDeliveryZone(c *gin.Context) {
	id := c.Param("id")
	var zone models.DeliveryZone
	if err := database.DB.First(&zone, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Delivery zone not found"})
		return
	}

	if err := database.DB.Delete(&zone).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete delivery zone"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Delivery zone deleted successfully"})
}
