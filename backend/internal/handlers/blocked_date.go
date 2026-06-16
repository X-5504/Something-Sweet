package handlers

import (
	"net/http"
	"time"

	"something-sweet/backend/internal/database"
	"something-sweet/backend/internal/models"

	"github.com/gin-gonic/gin"
)

// GetBlockedDates returns all blocked dates
func GetBlockedDates(c *gin.Context) {
	blockedDates := []models.BlockedDate{}
	// Only fetch future blocked dates or recent ones
	today := time.Now().Truncate(24 * time.Hour)
	err := database.DB.Where("date >= ?", today).Order("date asc").Find(&blockedDates).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch blocked dates"})
		return
	}

	// Format response as a flat array of date strings for easy consumption by the frontend ReactDayPicker
	dates := []string{}
	for _, bd := range blockedDates {
		dates = append(dates, bd.Date.Format("2006-01-02"))
	}

	c.JSON(http.StatusOK, dates)
}

// AdminGetBlockedDates returns all blocked dates with detailed reasons
func AdminGetBlockedDates(c *gin.Context) {
	blockedDates := []models.BlockedDate{}
	err := database.DB.Order("date asc").Find(&blockedDates).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch blocked dates"})
		return
	}
	c.JSON(http.StatusOK, blockedDates)
}

// AdminCreateBlockedDate blocks a specific date
func AdminCreateBlockedDate(c *gin.Context) {
	var input struct {
		Date   string `json:"date" binding:"required"` // Format: YYYY-MM-DD
		Reason string `json:"reason"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	parsedDate, err := time.Parse("2006-01-02", input.Date)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format. Expected YYYY-MM-DD"})
		return
	}

	reason := input.Reason
	if reason == "" {
		reason = "Fully Booked"
	}

	blockedDate := models.BlockedDate{
		Date:   parsedDate,
		Reason: reason,
	}

	if err := database.DB.Create(&blockedDate).Error; err != nil {
		// Check for duplicate key violation
		c.JSON(http.StatusConflict, gin.H{"error": "This date is already blocked"})
		return
	}

	c.JSON(http.StatusCreated, blockedDate)
}

// AdminDeleteBlockedDate unblocks a date
func AdminDeleteBlockedDate(c *gin.Context) {
	id := c.Param("id")
	var blockedDate models.BlockedDate
	if err := database.DB.First(&blockedDate, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Blocked date not found"})
		return
	}

	if err := database.DB.Delete(&blockedDate).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete blocked date"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Date unblocked successfully"})
}
