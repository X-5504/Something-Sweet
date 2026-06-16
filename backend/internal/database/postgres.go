package database

import (
	"log"
	"time"

	"something-sweet/backend/internal/config"
	"something-sweet/backend/internal/models"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func InitDB() {
	dsn := config.AppConfig.DatabaseURL

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})

	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	log.Println("Database connection established successfully")

	// Run Migrations only if the database is fresh (e.g. table 'admins' does not exist)
	if !DB.Migrator().HasTable(&models.Admin{}) {
		log.Println("Database is fresh, running migrations...")
		err = DB.AutoMigrate(
			&models.Category{},
			&models.Product{},
			&models.Order{},
			&models.OrderItem{},
			&models.Payment{},
			&models.BlockedDate{},
			&models.DeliveryZone{},
			&models.Admin{},
		)
		if err != nil {
			log.Fatalf("Failed to run database migrations: %v", err)
		}
		log.Println("Database migrations completed successfully")

		// Seed Data
		SeedData()
	} else {
		log.Println("Database schema is already initialized. Skipping migrations and seeding.")
	}
}

func SeedData() {
	// 1. Seed Admin
	var adminCount int64
	DB.Model(&models.Admin{}).Count(&adminCount)
	if adminCount == 0 {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(config.AppConfig.AdminPassword), bcrypt.DefaultCost)
		if err != nil {
			log.Printf("Failed to hash admin password: %v", err)
		} else {
			admin := models.Admin{
				Username:     config.AppConfig.AdminUsername,
				PasswordHash: string(hashedPassword),
				CreatedAt:    time.Now(),
			}
			if err := DB.Create(&admin).Error; err != nil {
				log.Printf("Failed to seed admin: %v", err)
			} else {
				log.Println("Default admin account seeded successfully")
			}
		}
	}

	// 2. Seed Delivery Zones
	var zoneCount int64
	DB.Model(&models.DeliveryZone{}).Count(&zoneCount)
	if zoneCount == 0 {
		zones := []models.DeliveryZone{
			{Name: "Self Pickup", AreaDescription: "Ambil langsung di toko", DeliveryFee: 0},
			{Name: "Zone 1 (Close Range)", AreaDescription: "Regol, Lengkong, Astanaanyar", DeliveryFee: 10000},
			{Name: "Zone 2 (Medium Range)", AreaDescription: "Sumur Bandung, Cibeunying Kidul, Bojongloa Kaler, Coblong", DeliveryFee: 20000},
			{Name: "Zone 3 (Far Range)", AreaDescription: "Cibiru, Gede Bage, Sukasari, Antapani, Arcamanik", DeliveryFee: 35000},
		}
		for _, z := range zones {
			DB.Create(&z)
		}
		log.Println("Default delivery zones seeded successfully")
	}

	// 3. Seed Categories and Products
	var catCount int64
	DB.Model(&models.Category{}).Count(&catCount)
	if catCount == 0 {
		// Category 1: Signature Chiffon Cakes
		cat1 := models.Category{
			Name:        "Signature Chiffon Cakes",
			Description: "Cloud-like, airy perfection in three irresistible flavors.",
			SortOrder:   1,
		}
		DB.Create(&cat1)

		products1 := []models.Product{
			{
				CategoryID:  cat1.ID,
				Name:        "Pandan Chiffon",
				Description: "Infused with real pandan leaves for an aromatic, lightly sweet bite.",
				Price:       240000,
				Unit:        "",
				ImageURL:    "https://images.unsplash.com/photo-1759324351433-c5a1063f8ac6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlbiUyMHNwb25nZSUyMGNha2UlMjBzbGljZXxlbnwxfHx8fDE3NzY1NjAyNzB8MA&ixlib=rb-4.1.0&q=80&w=1080",
				SortOrder:   1,
			},
			{
				CategoryID:  cat1.ID,
				Name:        "Chocolate Chiffon",
				Description: "Airy cocoa goodness that melts perfectly in your mouth.",
				Price:       260000,
				Unit:        "",
				ImageURL:    "https://images.unsplash.com/photo-1574344069030-b2926f1b3d06?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaG9jb2xhdGUlMjBzcG9uZ2UlMjBjYWtlfGVufDF8fHx8MTc3NjU2MDI3MHww&ixlib=rb-4.1.0&q=80&w=1080",
				SortOrder:   2,
			},
			{
				CategoryID:  cat1.ID,
				Name:        "Cheese Chiffon",
				Description: "Sweet meets savory in this impossibly soft cheese-topped sponge.",
				Price:       280000,
				Unit:        "",
				ImageURL:    "https://images.unsplash.com/photo-1731045102967-6e97132a7245?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGVlc2UlMjBzcG9uZ2UlMjBjYWtlJTIwc2xpY2V8ZW58MXx8fHwxNzc2NTYwMjc3fDA&ixlib=rb-4.1.0&q=80&w=1080",
				SortOrder:   3,
			},
		}
		for _, p := range products1 {
			DB.Create(&p)
		}

		// Category 2: Classic Rolls & Bakes
		cat2 := models.Category{
			Name:        "Classic Rolls & Bakes",
			Description: "Our beloved staples that you can never go wrong with.",
			SortOrder:   2,
		}
		DB.Create(&cat2)

		products2 := []models.Product{
			{
				CategoryID:  cat2.ID,
				Name:        "Strawberry Cake Roll",
				Description: "Fresh strawberries and light cream hugged by a delicate, pillowy sponge.",
				Price:       320000,
				Unit:        "",
				ImageURL:    "https://images.unsplash.com/photo-1724805054535-90caaeb76102?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHJhd2JlcnJ5JTIwc3dpc3MlMjByb2xsJTIwY2FrZXxlbnwxfHx8fDE3NzY1NjAyNzB8MA&ixlib=rb-4.1.0&q=80&w=1080",
				SortOrder:   1,
			},
			{
				CategoryID:  cat2.ID,
				Name:        "Fudgy Chocolate Brownies",
				Description: "Intensely chocolatey and dense with that irresistible crinkly top.",
				Price:       200000,
				Unit:        "",
				ImageURL:    "https://images.unsplash.com/photo-1608732220898-9e419b03d71f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmdWRneSUyMGNob2NvbGF0ZSUyMGJyb3duaWVzfGVufDF8fHx8MTc3NjU2MDI3MHww&ixlib=rb-4.1.0&q=80&w=1080",
				SortOrder:   2,
			},
		}
		for _, p := range products2 {
			DB.Create(&p)
		}

		// Category 3: Other Sweets
		cat3 := models.Category{
			Name:        "Other Sweets",
			Description: "Little treats for the moments when you just need a quick bite of joy.",
			SortOrder:   3,
		}
		DB.Create(&cat3)

		products3 := []models.Product{
			{
				CategoryID:  cat3.ID,
				Name:        "Rose Vanilla Cupcakes",
				Description: "Delicate vanilla cake crowned with our signature whipped pink frosting.",
				Price:       180000,
				Unit:        " / half-dozen",
				ImageURL:    "https://images.unsplash.com/photo-1622995706580-a332aed41cdf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwcGluayUyMGZyb3N0ZWQlMjBjdXBjYWtlc3xlbnwxfHx8fDE3NzY1NjAyNzF8MA&ixlib=rb-4.1.0&q=80&w=1080",
				SortOrder:   1,
			},
			{
				CategoryID:  cat3.ID,
				Name:        "Fresh Berry Tart",
				Description: "Crisp buttery crust filled with rich custard and topped with seasonal fruits.",
				Price:       350000,
				Unit:        "",
				ImageURL:    "https://images.unsplash.com/photo-1773907889788-ed2a37755d76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGZydWl0JTIwdGFydCUyMGJha2VyeXxlbnwxfHx8fDE3NzY1NjAyNzF8MA&ixlib=rb-4.1.0&q=80&w=1080",
				SortOrder:   2,
			},
			{
				CategoryID:  cat3.ID,
				Name:        "Pastel Macarons",
				Description: "Chewy almond shells with ganache fillings in a variety of delightful flavors.",
				Price:       220000,
				Unit:        " / box",
				ImageURL:    "https://images.unsplash.com/photo-1652555286866-1bef20014bc0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXN0ZWwlMjBmcmVuY2glMjBtYWNhcm9uc3xlbnwxfHx8fDE3NzY1NjAyNzF8MA&ixlib=rb-4.1.0&q=80&w=1080",
				SortOrder:   3,
			},
		}
		for _, p := range products3 {
			DB.Create(&p)
		}
		log.Println("Default categories and products seeded successfully")
	}
}
