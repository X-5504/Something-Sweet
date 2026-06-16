package routes

import (
	"something-sweet/backend/internal/handlers"
	"something-sweet/backend/internal/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	// Enable CORS
	r.Use(middleware.CORSMiddleware())

	// Serve static files for uploaded product images
	r.Static("/uploads", "./uploads")

	// API Group
	api := r.Group("/api/v1")
	{
		// Storefront (Public) Routes
		api.GET("/products", handlers.GetProducts)
		api.GET("/products/best-sellers", handlers.GetBestSellers)
		api.GET("/products/:id", handlers.GetProductByID)
		api.GET("/categories", handlers.GetCategories)
		api.GET("/blocked-dates", handlers.GetBlockedDates)
		api.GET("/delivery-zones", handlers.GetDeliveryZones)
		
		api.POST("/orders", handlers.CreateOrder)
		api.GET("/orders/:id", handlers.GetOrderByID)
		api.GET("/orders/track/:orderNumber", handlers.TrackOrder)

		api.POST("/payments/create", handlers.CreatePayment)
		api.GET("/payments/:orderId/status", handlers.GetPaymentStatus)
		api.POST("/payments/callback", handlers.DuitkuCallback)
		api.POST("/payments/mock-trigger", handlers.LocalMockTrigger) // for local frontend simulation

		// Admin Auth (Public)
		api.POST("/admin/login", handlers.AdminLogin)

		// Admin Protected Routes
		admin := api.Group("/admin")
		admin.Use(middleware.AuthMiddleware())
		{
			admin.GET("/me", handlers.GetAdminMe)
			
			// Product Management
			admin.GET("/products", handlers.AdminGetProducts)
			admin.POST("/products", handlers.AdminCreateProduct)
			admin.PUT("/products/:id", handlers.AdminUpdateProduct)
			admin.DELETE("/products/:id", handlers.AdminDeleteProduct)

			// Category Management
			admin.POST("/categories", handlers.AdminCreateCategory)
			admin.PUT("/categories/:id", handlers.AdminUpdateCategory)
			admin.DELETE("/categories/:id", handlers.AdminDeleteCategory)

			// Blocked Dates Management
			admin.GET("/blocked-dates", handlers.AdminGetBlockedDates)
			admin.POST("/blocked-dates", handlers.AdminCreateBlockedDate)
			admin.DELETE("/blocked-dates/:id", handlers.AdminDeleteBlockedDate)

			// Delivery Zone Management
			admin.POST("/delivery-zones", handlers.AdminCreateDeliveryZone)
			admin.PUT("/delivery-zones/:id", handlers.AdminUpdateDeliveryZone)
			admin.DELETE("/delivery-zones/:id", handlers.AdminDeleteDeliveryZone)

			// Order Management
			admin.GET("/orders", handlers.AdminGetOrders)
			admin.PUT("/orders/:id/status", handlers.AdminUpdateOrderStatus)

			// Image Upload
			admin.POST("/upload", handlers.UploadImage)
		}
	}

	return r
}
