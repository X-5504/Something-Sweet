package models

import (
	"crypto/rand"
	"fmt"
	"time"

	"gorm.io/gorm"
)

// GenerateUUID generates a random UUID (v4) as a string.
func GenerateUUID() string {
	b := make([]byte, 16)
	_, _ = rand.Read(b)
	b[6] = (b[6] & 0x0f) | 0x40 // Version 4
	b[8] = (b[8] & 0x3f) | 0x80 // Variant is 10
	return fmt.Sprintf("%x-%x-%x-%x-%x", b[0:4], b[4:6], b[6:8], b[8:10], b[10:])
}

type Category struct {
	ID          string         `gorm:"primaryKey;type:uuid" json:"id"`
	Name        string         `gorm:"not null" json:"name"`
	Description string         `json:"description"`
	SortOrder   int            `gorm:"default:0" json:"sort_order"`
	Products    []Product      `gorm:"foreignKey:CategoryID" json:"products,omitempty"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

func (c *Category) BeforeCreate(tx *gorm.DB) (err error) {
	if c.ID == "" {
		c.ID = GenerateUUID()
	}
	return
}

type Product struct {
	ID          string         `gorm:"primaryKey;type:uuid" json:"id"`
	CategoryID  string         `gorm:"type:uuid;not null" json:"category_id"`
	Category    *Category      `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
	Name        string         `gorm:"not null" json:"name"`
	Description string         `json:"description"`
	Price       int64          `gorm:"not null" json:"price"` // in IDR
	Unit        string         `gorm:"default:''" json:"unit"` // e.g. "/ box", "/ piece"
	ImageURL     string         `json:"image_url"`
	IsActive     bool           `gorm:"default:true" json:"is_active"`
	IsBestSeller bool           `gorm:"default:false" json:"is_best_seller"`
	SortOrder    int            `gorm:"default:0" json:"sort_order"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

func (p *Product) BeforeCreate(tx *gorm.DB) (err error) {
	if p.ID == "" {
		p.ID = GenerateUUID()
	}
	return
}

type Order struct {
	ID              string         `gorm:"primaryKey;type:uuid" json:"id"`
	OrderNumber     string         `gorm:"uniqueIndex;not null" json:"order_number"` // e.g. "SS-20260616-001"
	CustomerName    string         `gorm:"not null" json:"customer_name"`
	CustomerPhone   string         `gorm:"not null" json:"customer_phone"`
	CustomerEmail   string         `json:"customer_email"`
	DeliveryAddress string         `gorm:"not null" json:"delivery_address"`
	DeliveryMethod  string         `gorm:"not null" json:"delivery_method"` // "grab" | "gosend" | "pickup"
	PreorderDate    time.Time      `gorm:"type:date;not null" json:"preorder_date"`
	Subtotal        int64          `gorm:"not null" json:"subtotal"`
	DeliveryFee     int64          `json:"delivery_fee"`
	TotalAmount     int64          `gorm:"not null" json:"total_amount"`
	Status          string         `gorm:"default:'pending'" json:"status"` // pending | paid | confirmed | delivered | cancelled
	Notes           string         `json:"notes"`
	OrderItems      []OrderItem    `gorm:"foreignKey:OrderID" json:"order_items"`
	Payment         *Payment       `gorm:"foreignKey:OrderID" json:"payment,omitempty"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"-"`
}

func (o *Order) BeforeCreate(tx *gorm.DB) (err error) {
	if o.ID == "" {
		o.ID = GenerateUUID()
	}
	return
}

type OrderItem struct {
	ID        string   `gorm:"primaryKey;type:uuid" json:"id"`
	OrderID   string   `gorm:"type:uuid;not null" json:"order_id"`
	ProductID string   `gorm:"type:uuid;not null" json:"product_id"`
	Product   *Product `gorm:"foreignKey:ProductID" json:"product,omitempty"`
	Name      string   `gorm:"not null" json:"name"`
	Price     int64    `gorm:"not null" json:"price"`
	Quantity  int      `gorm:"not null" json:"quantity"`
	Subtotal  int64    `gorm:"not null" json:"subtotal"`
}

func (oi *OrderItem) BeforeCreate(tx *gorm.DB) (err error) {
	if oi.ID == "" {
		oi.ID = GenerateUUID()
	}
	return
}

type Payment struct {
	ID              string     `gorm:"primaryKey;type:uuid" json:"id"`
	OrderID         string     `gorm:"type:uuid;not null" json:"order_id"`
	MerchantOrderID string     `gorm:"uniqueIndex;not null" json:"merchant_order_id"`
	DuitkuReference string     `json:"duitku_reference"`
	PaymentMethod   string     `json:"payment_method"` // VA, BT, OV, SP, etc.
	PaymentURL      string     `json:"payment_url"`
	VANumber        string     `json:"va_number"`
	Amount          int64      `gorm:"not null" json:"amount"`
	Status          string     `gorm:"default:'pending'" json:"status"` // pending | success | failed | expired
	PaidAt          *time.Time `json:"paid_at,omitempty"`
	ExpiredAt       *time.Time `json:"expired_at,omitempty"`
	CallbackData    string     `gorm:"type:text" json:"callback_data,omitempty"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
}

func (p *Payment) BeforeCreate(tx *gorm.DB) (err error) {
	if p.ID == "" {
		p.ID = GenerateUUID()
	}
	return
}

type BlockedDate struct {
	ID        string    `gorm:"primaryKey;type:uuid" json:"id"`
	Date      time.Time `gorm:"type:date;uniqueIndex;not null" json:"date"`
	Reason    string    `gorm:"default:'Fully Booked'" json:"reason"`
	CreatedAt time.Time `json:"created_at"`
}

func (bd *BlockedDate) BeforeCreate(tx *gorm.DB) (err error) {
	if bd.ID == "" {
		bd.ID = GenerateUUID()
	}
	return
}

type DeliveryZone struct {
	ID              string    `gorm:"primaryKey;type:uuid" json:"id"`
	Name            string    `gorm:"not null" json:"name"` // Zone Name (e.g. Zone A, Zone B)
	AreaDescription string    `json:"area_description"`     // e.g. "Kecamatan Regol, Lengkong"
	DeliveryFee     int64     `gorm:"not null" json:"delivery_fee"`
	CreatedAt       time.Time `json:"created_at"`
}

func (dz *DeliveryZone) BeforeCreate(tx *gorm.DB) (err error) {
	if dz.ID == "" {
		dz.ID = GenerateUUID()
	}
	return
}

type Admin struct {
	ID           string    `gorm:"primaryKey;type:uuid" json:"id"`
	Username     string    `gorm:"uniqueIndex;not null" json:"username"`
	PasswordHash string    `gorm:"not null" json:"-"`
	CreatedAt    time.Time `json:"created_at"`
}

func (a *Admin) BeforeCreate(tx *gorm.DB) (err error) {
	if a.ID == "" {
		a.ID = GenerateUUID()
	}
	return
}
