// Product types
export interface Category {
  id: string;
  name: string;
  description: string;
  sort_order: number;
}

export interface Product {
  id: string;
  category_id: string;
  category?: Category;
  name: string;
  description: string;
  price: number;
  unit: string;
  image_url: string;
  is_active: boolean;
  is_best_seller?: boolean;
  sort_order: number;
}

export interface ProductsByCategory {
  category: string;
  description: string;
  items: Product[];
}

// Cart types
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  img: string;
  unit?: string;
}

// Order types
export interface CreateOrderRequest {
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  delivery_address: string;
  delivery_method: "grab" | "gosend" | "pickup";
  delivery_zone_id: string;
  preorder_date: string;
  items: OrderItemRequest[];
  notes?: string;
}

export interface OrderItemRequest {
  product_id: string;
  quantity: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  delivery_address: string;
  delivery_method: string;
  preorder_date: string;
  subtotal: number;
  delivery_fee: number;
  total_amount: number;
  status: string;
  notes: string;
  order_items: OrderItem[];
  payment?: Payment;
  created_at: string;
}

export interface OrderItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

// Payment types
export interface CreatePaymentRequest {
  order_id: string;
  payment_method: string;
}

export interface Payment {
  id: string;
  order_id: string;
  merchant_order_id: string;
  duitku_reference: string;
  payment_method: string;
  payment_url: string;
  va_number: string;
  amount: number;
  status: string;
  paid_at: string | null;
  expired_at: string | null;
  created_at: string;
}

// Delivery zone types
export interface DeliveryZone {
  id: string;
  name: string;
  delivery_fee: number;
  area_description: string;
}

// Blocked date types
export interface BlockedDate {
  date: string;
  reason: string;
}

// API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Payment method from Duitku
export interface PaymentMethod {
  paymentMethod: string;
  paymentName: string;
  paymentImage: string;
  totalFee: string;
}
