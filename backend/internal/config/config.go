package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port               string
	GinMode            string
	JWTSecret          string
	AdminUsername      string
	AdminPassword      string
	DatabaseURL        string
	DuitkuMerchantCode string
	DuitkuApiKey       string
	DuitkuBaseUrl      string
	DuitkuCallbackUrl  string
	DuitkuReturnUrl    string
	FrontendUrl        string
}

var AppConfig *Config

func LoadConfig() {
	// Load environment variables from .env file
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: No .env file found, loading from system environment variables")
	}

	AppConfig = &Config{
		Port:               getEnv("PORT", "8080"),
		GinMode:            getEnv("GIN_MODE", "debug"),
		JWTSecret:          getEnv("JWT_SECRET", "supersecretjwtkey123!@#"),
		AdminUsername:      getEnv("ADMIN_USERNAME", "admin"),
		AdminPassword:      getEnv("ADMIN_PASSWORD", "adminpassword123"),
		DatabaseURL:        getEnv("DATABASE_URL", ""),
		DuitkuMerchantCode: getEnv("DUITKU_MERCHANT_CODE", "DS19176"),
		DuitkuApiKey:       getEnv("DUITKU_API_KEY", "895786c5ea3e9c4f923e16b9b3e1a0b3"),
		DuitkuBaseUrl:      getEnv("DUITKU_BASE_URL", "https://sandbox.duitku.com/webapi"),
		DuitkuCallbackUrl:  getEnv("DUITKU_CALLBACK_URL", "http://localhost:8080/api/v1/payments/callback"),
		DuitkuReturnUrl:    getEnv("DUITKU_RETURN_URL", "http://localhost:3000/order"),
		FrontendUrl:        getEnv("FRONTEND_URL", "http://localhost:3000"),
	}
}

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
