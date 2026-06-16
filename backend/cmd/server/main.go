package main

import (
	"fmt"
	"log"

	"something-sweet/backend/internal/config"
	"something-sweet/backend/internal/database"
	"something-sweet/backend/internal/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	log.Println("Starting Something Sweet Backend Server...")

	// 1. Load configuration
	config.LoadConfig()

	// 2. Set Gin mode
	gin.SetMode(config.AppConfig.GinMode)

	// 3. Initialize Database (Connects, Runs AutoMigrate, and Seeds Default Data)
	database.InitDB()

	// 4. Setup Router
	r := routes.SetupRouter()

	// 5. Start Server
	port := config.AppConfig.Port
	log.Printf("Server running on port %s", port)
	err := r.Run(fmt.Sprintf(":%s", port))
	if err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
