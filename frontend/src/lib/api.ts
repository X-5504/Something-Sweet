import type {
  ProductsByCategory,
  CreateOrderRequest,
  Order,
  CreatePaymentRequest,
  Payment,
  DeliveryZone,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Network error" }));
    throw new Error(error.error || `API Error: ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Products
  getProducts: () => fetchApi<ProductsByCategory[]>("/products"),

  // Blocked dates
  getBlockedDates: () => fetchApi<string[]>("/blocked-dates"),

  // Delivery zones
  getDeliveryZones: () => fetchApi<DeliveryZone[]>("/delivery-zones"),

  // Orders
  createOrder: (data: CreateOrderRequest) =>
    fetchApi<Order>("/orders", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getOrderStatus: (id: string) => fetchApi<Order>(`/orders/${id}`),

  trackOrder: (code: string) => fetchApi<Order>(`/orders/track/${code}`),

  // Payments
  createPayment: (data: CreatePaymentRequest) =>
    fetchApi<Payment>("/payments/create", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getPaymentStatus: (orderId: string) =>
    fetchApi<Payment>(`/payments/${orderId}/status`),
};
