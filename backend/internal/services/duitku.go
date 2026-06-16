package services

import (
	"bytes"
	"crypto/md5"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"something-sweet/backend/internal/config"
	"something-sweet/backend/internal/models"
)

type DuitkuItem struct {
	Name     string `json:"name"`
	Price    int    `json:"price"`
	Quantity int    `json:"quantity"`
}

type DuitkuCustomerDetail struct {
	FirstName   string `json:"firstName"`
	LastName    string `json:"lastName"`
	Email       string `json:"email"`
	PhoneNumber string `json:"phoneNumber"`
}

type DuitkuInquiryRequest struct {
	MerchantCode     string                `json:"merchantCode"`
	PaymentAmount    int64                 `json:"paymentAmount"`
	MerchantOrderID  string                `json:"merchantOrderId"`
	ProductDetails   string                `json:"productDetails"`
	AdditionalParam  string                `json:"additionalParam"`
	PaymentMethod    string                `json:"paymentMethod"`
	Email            string                `json:"email"`
	PhoneNumber      string                `json:"phoneNumber"`
	ItemDetails      []DuitkuItem          `json:"itemDetails"`
	CustomerDetail   DuitkuCustomerDetail  `json:"customerDetail"`
	CallbackUrl      string                `json:"callbackUrl"`
	ReturnUrl        string                `json:"returnUrl"`
	Signature        string                `json:"signature"`
	ExpiryPeriod     int                   `json:"expiryPeriod"` // in minutes
}

type DuitkuInquiryResponse struct {
	MerchantCode    string `json:"merchantCode"`
	Reference       string `json:"reference"`
	PaymentUrl      string `json:"paymentUrl"`
	StatusCode      string `json:"statusCode"`
	StatusMessage   string `json:"statusMessage"`
	VANumber        string `json:"vaNumber"`
	MerchantOrderID string `json:"-"` // Helper field to track the generated ID sent to Duitku
}

// ComputeMD5 computes the MD5 hash of a string
func ComputeMD5(input string) string {
	h := md5.New()
	h.Write([]byte(input))
	return hex.EncodeToString(h.Sum(nil))
}

// mapPaymentMethod maps frontend payment method names to Duitku payment codes.
func mapPaymentMethod(method string) string {
	switch method {
	case "QRIS":
		return "SP" // ShopeePay QRIS (standard in Duitku Sandbox)
	case "BCA VA":
		return "BC"
	case "Mandiri VA":
		return "M2"
	default:
		return method
	}
}

// RequestDuitkuInquiry initiates a transaction with Duitku
func RequestDuitkuInquiry(order models.Order, paymentMethod string) (*DuitkuInquiryResponse, error) {
	cfg := config.AppConfig

	mappedPaymentMethod := mapPaymentMethod(paymentMethod)

	// Generate unique Merchant Order ID using a Unix timestamp suffix to avoid 409 Conflict in Duitku Sandbox
	merchantOrderID := fmt.Sprintf("%s-%d", order.OrderNumber, time.Now().Unix())

	// Prepare signature: md5(merchantCode + merchantOrderId + paymentAmount + apiKey)
	sigStr := fmt.Sprintf("%s%s%d%s", cfg.DuitkuMerchantCode, merchantOrderID, order.TotalAmount, cfg.DuitkuApiKey)
	signature := ComputeMD5(sigStr)

	// Build items details
	var items []DuitkuItem
	productDetails := ""
	for idx, item := range order.OrderItems {
		items = append(items, DuitkuItem{
			Name:     item.Name,
			Price:    int(item.Price),
			Quantity: item.Quantity,
		})
		if idx == 0 {
			productDetails = item.Name
		} else if idx < 3 {
			productDetails += ", " + item.Name
		}
	}
	if len(order.OrderItems) > 3 {
		productDetails += "..."
	}

	// Delivery fee as item if dynamic
	if order.DeliveryFee > 0 {
		items = append(items, DuitkuItem{
			Name:     "Delivery Fee (" + order.DeliveryMethod + ")",
			Price:    int(order.DeliveryFee),
			Quantity: 1,
		})
	}

	reqBody := DuitkuInquiryRequest{
		MerchantCode:    cfg.DuitkuMerchantCode,
		PaymentAmount:   order.TotalAmount,
		MerchantOrderID: merchantOrderID,
		ProductDetails:  productDetails,
		AdditionalParam: "",
		PaymentMethod:   mappedPaymentMethod,
		Email:           order.CustomerEmail,
		PhoneNumber:     order.CustomerPhone,
		ItemDetails:     items,
		CustomerDetail: DuitkuCustomerDetail{
			FirstName:   order.CustomerName,
			LastName:    "",
			Email:       order.CustomerEmail,
			PhoneNumber: order.CustomerPhone,
		},
		CallbackUrl:  cfg.DuitkuCallbackUrl,
		ReturnUrl:    fmt.Sprintf("%s/%s", cfg.DuitkuReturnUrl, order.ID),
		Signature:    signature,
		ExpiryPeriod: 1440, // 24 hours
	}

	// Marshall JSON request
	jsonReq, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request body: %v", err)
	}

	// If MerchantCode is default or sandbox credentials are standard placeholders,
	// check if we want to run mock payment flow
	isMockMode := cfg.DuitkuMerchantCode == "DS19176" || cfg.DuitkuMerchantCode == "DXXXX" || cfg.DuitkuApiKey == "your_api_key"

	if isMockMode {
		log.Println("[Duitku Service] Mock Mode active for sandbox testing")
		return createMockInquiryResponse(order, paymentMethod)
	}

	// Make HTTP call to Duitku Sandbox
	url := fmt.Sprintf("%s/api/merchant/v2/inquiry", cfg.DuitkuBaseUrl)
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonReq))
	if err != nil {
		return nil, fmt.Errorf("failed to create http request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 15 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("[Duitku Service] API call failed: %v", err)
		return nil, fmt.Errorf("Duitku API call failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Printf("[Duitku Service] API returned non-OK status: %d", resp.StatusCode)
		return nil, fmt.Errorf("Duitku API returned HTTP status %d", resp.StatusCode)
	}

	var inquiryResp DuitkuInquiryResponse
	if err := json.NewDecoder(resp.Body).Decode(&inquiryResp); err != nil {
		return nil, fmt.Errorf("failed to decode response: %v", err)
	}

	if inquiryResp.StatusCode != "00" {
		log.Printf("[Duitku Service] Inquiry failed with statusCode: %s, message: %s", 
			inquiryResp.StatusCode, inquiryResp.StatusMessage)
		return nil, fmt.Errorf("Duitku error: %s (code: %s)", inquiryResp.StatusMessage, inquiryResp.StatusCode)
	}

	inquiryResp.MerchantOrderID = merchantOrderID
	return &inquiryResp, nil
}

func createMockInquiryResponse(order models.Order, paymentMethod string) (*DuitkuInquiryResponse, error) {
	// Generate local mock payment URL that the frontend can load to click "Simulate Success"
	mockPaymentUrl := fmt.Sprintf("%s/payment/mock/%s", config.AppConfig.FrontendUrl, order.ID)
	
	// Predefine VA number format depending on method
	vaNumber := "8810" + order.CustomerPhone
	if len(vaNumber) > 16 {
		vaNumber = vaNumber[:16]
	}

	return &DuitkuInquiryResponse{
		MerchantCode:    config.AppConfig.DuitkuMerchantCode,
		Reference:       "MOCK-REF-" + order.OrderNumber,
		PaymentUrl:      mockPaymentUrl,
		StatusCode:      "00",
		StatusMessage:   "SUCCESS",
		VANumber:        vaNumber,
		MerchantOrderID: order.OrderNumber,
	}, nil
}

// VerifyCallbackSignature validates callback signature from Duitku:
// signature = md5(merchantCode + amount + merchantOrderId + apiKey)
func VerifyCallbackSignature(merchantCode string, amount int64, merchantOrderId, signature string) bool {
	cfg := config.AppConfig
	sigStr := fmt.Sprintf("%s%d%s%s", merchantCode, amount, merchantOrderId, cfg.DuitkuApiKey)
	calculatedSignature := ComputeMD5(sigStr)
	return calculatedSignature == signature
}
