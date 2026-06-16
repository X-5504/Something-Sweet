"use client";

import React, { useEffect, useState, use } from "react";
import { api } from "@/lib/api";
import { formatRupiah } from "@/lib/utils";
import type { Order } from "@/lib/types";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Clock, ShoppingBag, MapPin, Phone, HelpCircle, Copy } from "lucide-react";

export default function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  
  // Unwrap params using React.use()
  const { id } = use(params);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // Poll status when order is pending
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const fetchOrder = () => {
      api.getOrderStatus(id)
        .then((data) => {
          setOrder(data);
          setLoading(false);

          // If payment/order is paid or cancelled, stop polling
          if (data.status !== "pending" && intervalId) {
            clearInterval(intervalId);
          }
        })
        .catch((err) => {
          console.error(err);
          toast.error("Failed to load order details.");
          setLoading(false);
          if (intervalId) clearInterval(intervalId);
        });
    };

    fetchOrder();

    // Set polling interval every 5 seconds if order is pending
    intervalId = setInterval(() => {
      if (order && order.status === "pending") {
        api.getOrderStatus(id).then((data) => {
          if (data.status !== order.status) {
            setOrder(data);
            if (data.status === "paid") {
              toast.success("We received your payment! Thank you.");
            }
          }
        });
      }
    }, 5000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [id, order?.status]);

  if (loading) {
    return (
      <div className="min-h-screen bg-rose-50/10 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-pink-600 font-medium">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-rose-50/10 flex items-center justify-center">
        <div className="max-w-md p-6 bg-white rounded-3xl border border-pink-100 text-center shadow-sm">
          <XCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Order Not Found</h1>
          <p className="text-gray-500 text-sm mb-6">
            We couldn't find an order matching that ID.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2.5 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-all font-semibold"
          >
            Browse Cakes
          </button>
        </div>
      </div>
    );
  }

  // Determine stage active classes
  const getStatusStage = () => {
    switch (order.status) {
      case "pending":
        return 1;
      case "paid":
        return 2;
      case "confirmed":
        return 3;
      case "delivered":
        return 4;
      default:
        return 0; // cancelled or invalid
    }
  };

  const currentStage = getStatusStage();
  const isCancelled = order.status === "cancelled";

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl border border-pink-100 shadow-sm p-6 sm:p-8 space-y-8">
        
        {/* Status Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-gray-100">
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest">Order Details</p>
            <h1 className="text-2xl font-extrabold text-gray-900 mt-1 flex items-center gap-2">
              <span>Code:</span>
              <span className="font-mono text-pink-600 flex items-center gap-1.5">
                {order.order_number}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(order.order_number);
                    toast.success("Order code copied!");
                  }}
                  className="p-1 text-gray-400 hover:text-pink-500 hover:bg-pink-50 rounded-lg transition-colors cursor-pointer"
                  title="Copy Order Code"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Placed on {new Date(order.created_at || "").toLocaleString("id-ID")}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest">Preorder Date</p>
            <p className="text-lg font-bold text-gray-900 mt-1">
              {new Date(order.preorder_date).toLocaleDateString("id-ID", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Status Tracker Flow */}
        {!isCancelled ? (
          <div className="py-4">
            <div className="relative flex justify-between items-center w-full max-w-2xl mx-auto">
              {/* Progress Line Bar */}
              <div className="absolute left-0 right-0 top-5 -translate-y-1/2 h-1 bg-gray-100 -z-0">
                <div
                  className="h-full bg-pink-500 transition-all duration-500"
                  style={{
                    width: `${((currentStage - 1) / 3) * 100}%`,
                  }}
                ></div>
              </div>

              {/* Status Points */}
              {[
                { stage: 1, label: "Pending", icon: Clock },
                { stage: 2, label: "Paid", icon: CheckCircle2 },
                { stage: 3, label: "Confirmed", icon: ShoppingBag },
                { stage: 4, label: "Delivered", icon: MapPin },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = currentStage >= item.stage;
                const isCurrent = currentStage === item.stage;

                return (
                  <div key={item.stage} className="flex flex-col items-center relative z-10">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border-2 ${
                        isActive
                          ? "bg-pink-500 border-pink-500 text-white shadow-md"
                          : "bg-white border-gray-200 text-gray-400"
                      } ${isCurrent ? "ring-4 ring-pink-100" : ""}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-xs font-bold mt-2 ${
                        isActive ? "text-pink-600" : "text-gray-400"
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-2xl flex items-center gap-3">
            <XCircle className="w-6 h-6 flex-shrink-0 text-red-500" />
            <div>
              <h4 className="font-bold">Order Cancelled</h4>
              <p className="text-sm">This order has been cancelled by the bakery or payment session has expired.</p>
            </div>
          </div>
        )}

        {/* Action Callout for Pending */}
        {order.status === "pending" && order.payment && (
          <div className="bg-pink-50/30 border border-pink-100 p-6 rounded-3xl space-y-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-pink-500 animate-pulse" />
              Awaiting Payment
            </h3>
            <p className="text-sm text-gray-600">
              Please complete your payment to lock in your preorder slot. Slot is held for 24 hours.
            </p>
            {order.payment.va_number && (
              <div className="bg-white p-4 rounded-xl border border-pink-100 flex justify-between items-center">
                <div>
                  <span className="text-xs text-gray-400 font-semibold block uppercase">
                    Virtual Account ({order.payment.payment_method})
                  </span>
                  <span className="text-xl font-mono font-bold text-gray-900 tracking-wider">
                    {order.payment.va_number}
                  </span>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(order.payment?.va_number || "");
                    toast.success("VA number copied!");
                  }}
                  className="px-3 py-1.5 bg-pink-50 text-pink-600 hover:bg-pink-100 rounded-lg text-xs font-bold transition-all"
                >
                  Copy Number
                </button>
              </div>
            )}
            
            <a
              href={order.payment.payment_url}
              className="w-full block text-center py-3.5 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-pink-100"
            >
              Pay Now ({formatRupiah(order.total_amount)})
            </a>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          {/* Customer Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Customer Details</h3>
            <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100 space-y-3 text-sm text-gray-700">
              <div className="flex gap-2">
                <span className="font-bold text-gray-900 w-20 flex-shrink-0">Name:</span>
                <span>{order.customer_name}</span>
              </div>
              <div className="flex gap-2 items-center">
                <span className="font-bold text-gray-900 w-20 flex-shrink-0">WhatsApp:</span>
                <span className="flex items-center gap-1 font-mono">
                  <Phone className="w-3.5 h-3.5 text-pink-500" />
                  {order.customer_phone}
                </span>
              </div>
              {order.customer_email && (
                <div className="flex gap-2">
                  <span className="font-bold text-gray-900 w-20 flex-shrink-0">Email:</span>
                  <span className="truncate">{order.customer_email}</span>
                </div>
              )}
              <div className="flex gap-2">
                <span className="font-bold text-gray-900 w-20 flex-shrink-0">Courier:</span>
                <span className="capitalize">{order.delivery_method}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold text-gray-900 w-20 flex-shrink-0">Address:</span>
                <span>{order.delivery_address}</span>
              </div>
            </div>
          </div>

          {/* Payment Invoice Breakdown */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Order Items</h3>
            <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100 space-y-3">
              {order.order_items?.map((item) => (
                <div key={item.id} className="flex justify-between items-start text-sm">
                  <div>
                    <h4 className="font-semibold text-gray-900">{item.name}</h4>
                    <p className="text-xs text-gray-400">
                      {item.quantity} x {formatRupiah(item.price)}
                    </p>
                  </div>
                  <span className="font-bold text-gray-900">
                    {formatRupiah(item.subtotal)}
                  </span>
                </div>
              ))}

              <div className="border-t border-gray-200/50 my-2 pt-2 space-y-2 text-xs">
                <div className="flex justify-between text-gray-500">
                  <span>Cart Subtotal</span>
                  <span>{formatRupiah(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Delivery Fee</span>
                  <span>{formatRupiah(order.delivery_fee)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-gray-900 border-t border-gray-200/50 pt-2">
                  <span>Total Paid</span>
                  <span className="text-pink-600 text-base">{formatRupiah(order.total_amount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Need Help WhatsApp CTA */}
        <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <HelpCircle className="w-4 h-4 text-gray-300" />
            <span>Questions about your preorder?</span>
          </div>
          <a
            href={`https://wa.me/1234567890?text=Hi!%20I'd%20like%20to%20ask%20about%20my%20order%20${order.order_number}`}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 bg-white border border-gray-200 hover:border-pink-500 hover:text-pink-600 rounded-full font-bold transition-all text-gray-600"
          >
            Chat with Bakery Admin
          </a>
        </div>

      </div>
    </div>
  );
}
