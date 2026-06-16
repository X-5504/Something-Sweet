package handlers

import (
	"net/http"

	"something-sweet/backend/internal/database"
	"something-sweet/backend/internal/models"

	"github.com/gin-gonic/gin"
)

type CategoryProductsResponse struct {
	CategoryID  string           `json:"category_id"`
	Category    string           `json:"category"`
	Description string           `json:"description"`
	Items       []models.Product `json:"items"`
}

// GetProducts returns active products grouped by category for storefront catalog
func GetProducts(c *gin.Context) {
	categories := []models.Category{}
	err := database.DB.Order("sort_order asc, name asc").Find(&categories).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch categories"})
		return
	}

	response := []CategoryProductsResponse{}

	for _, cat := range categories {
		products := []models.Product{}
		err := database.DB.Where("category_id = ? AND is_active = ?", cat.ID, true).Order("sort_order asc, name asc").Find(&products).Error
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch products for " + cat.Name})
			return
		}

		// Only include categories that have active products (or all, but standard is all/active ones)
		response = append(response, CategoryProductsResponse{
			CategoryID:  cat.ID,
			Category:    cat.Name,
			Description: cat.Description,
			Items:       products,
		})
	}

	c.JSON(http.StatusOK, response)
}

// GetProductByID returns details of a single product
func GetProductByID(c *gin.Context) {
	id := c.Param("id")
	var product models.Product
	if err := database.DB.Preload("Category").First(&product, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}
	c.JSON(http.StatusOK, product)
}

// Storefront get simple flat list of categories
func GetCategories(c *gin.Context) {
	categories := []models.Category{}
	if err := database.DB.Order("sort_order asc, name asc").Find(&categories).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch categories"})
		return
	}
	c.JSON(http.StatusOK, categories)
}

// GetBestSellers returns active products marked as best sellers
func GetBestSellers(c *gin.Context) {
	products := []models.Product{}
	err := database.DB.Where("is_active = ? AND is_best_seller = ?", true, true).Order("sort_order asc, name asc").Find(&products).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch best sellers"})
		return
	}
	c.JSON(http.StatusOK, products)
}

// --- Admin Endpoints ---

// AdminGetProducts returns all products (active or inactive)
func AdminGetProducts(c *gin.Context) {
	products := []models.Product{}
	if err := database.DB.Preload("Category").Order("created_at desc").Find(&products).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch products"})
		return
	}
	c.JSON(http.StatusOK, products)
}

// AdminCreateProduct creates a new product
func AdminCreateProduct(c *gin.Context) {
	var input struct {
		CategoryID   string `json:"category_id" binding:"required"`
		Name         string `json:"name" binding:"required"`
		Description  string `json:"description"`
		Price        int64  `json:"price" binding:"required,min=0"`
		Unit         string `json:"unit"`
		ImageURL     string `json:"image_url"`
		IsActive     *bool  `json:"is_active"`
		IsBestSeller *bool  `json:"is_best_seller"`
		SortOrder    int    `json:"sort_order"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	isActive := true
	if input.IsActive != nil {
		isActive = *input.IsActive
	}

	isBestSeller := false
	if input.IsBestSeller != nil {
		isBestSeller = *input.IsBestSeller
	}

	product := models.Product{
		CategoryID:   input.CategoryID,
		Name:         input.Name,
		Description:  input.Description,
		Price:        input.Price,
		Unit:         input.Unit,
		ImageURL:     input.ImageURL,
		IsActive:     isActive,
		IsBestSeller: isBestSeller,
		SortOrder:    input.SortOrder,
	}

	if err := database.DB.Create(&product).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create product"})
		return
	}

	c.JSON(http.StatusCreated, product)
}

// AdminUpdateProduct updates an existing product
func AdminUpdateProduct(c *gin.Context) {
	id := c.Param("id")
	var product models.Product
	if err := database.DB.First(&product, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	var input struct {
		CategoryID   string `json:"category_id"`
		Name         string `json:"name"`
		Description  string `json:"description"`
		Price        *int64 `json:"price" binding:"omitempty,min=0"`
		Unit         string `json:"unit"`
		ImageURL     string `json:"image_url"`
		IsActive     *bool  `json:"is_active"`
		IsBestSeller *bool  `json:"is_best_seller"`
		SortOrder    *int   `json:"sort_order"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.CategoryID != "" {
		product.CategoryID = input.CategoryID
	}
	if input.Name != "" {
		product.Name = input.Name
	}
	if input.Description != "" {
		product.Description = input.Description
	}
	if input.Price != nil {
		product.Price = *input.Price
	}
	if input.Unit != "" {
		product.Unit = input.Unit
	}
	if input.ImageURL != "" {
		product.ImageURL = input.ImageURL
	}
	if input.IsActive != nil {
		product.IsActive = *input.IsActive
	}
	if input.IsBestSeller != nil {
		product.IsBestSeller = *input.IsBestSeller
	}
	if input.SortOrder != nil {
		product.SortOrder = *input.SortOrder
	}

	if err := database.DB.Save(&product).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update product"})
		return
	}

	c.JSON(http.StatusOK, product)
}

// AdminDeleteProduct deletes a product (soft delete)
func AdminDeleteProduct(c *gin.Context) {
	id := c.Param("id")
	var product models.Product
	if err := database.DB.First(&product, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	if err := database.DB.Delete(&product).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete product"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Product deleted successfully"})
}

// AdminCreateCategory creates a new category
func AdminCreateCategory(c *gin.Context) {
	var input struct {
		Name        string `json:"name" binding:"required"`
		Description string `json:"description"`
		SortOrder   int    `json:"sort_order"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	category := models.Category{
		Name:        input.Name,
		Description: input.Description,
		SortOrder:   input.SortOrder,
	}

	if err := database.DB.Create(&category).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create category"})
		return
	}

	c.JSON(http.StatusCreated, category)
}

// AdminUpdateCategory updates an existing category
func AdminUpdateCategory(c *gin.Context) {
	id := c.Param("id")
	var category models.Category
	if err := database.DB.First(&category, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Category not found"})
		return
	}

	var input struct {
		Name        string `json:"name"`
		Description string `json:"description"`
		SortOrder   *int   `json:"sort_order"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.Name != "" {
		category.Name = input.Name
	}
	if input.Description != "" {
		category.Description = input.Description
	}
	if input.SortOrder != nil {
		category.SortOrder = *input.SortOrder
	}

	if err := database.DB.Save(&category).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update category"})
		return
	}

	c.JSON(http.StatusOK, category)
}

// AdminDeleteCategory deletes a category
func AdminDeleteCategory(c *gin.Context) {
	id := c.Param("id")
	var category models.Category
	if err := database.DB.First(&category, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Category not found"})
		return
	}

	// Check if there are any products attached to this category
	var productCount int64
	database.DB.Model(&models.Product{}).Where("category_id = ?", id).Count(&productCount)
	if productCount > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot delete category with associated products"})
		return
	}

	if err := database.DB.Delete(&category).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete category"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Category deleted successfully"})
}
