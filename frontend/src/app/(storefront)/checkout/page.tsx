"use client";

import React, { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { api } from "@/lib/api";
import { formatRupiah } from "@/lib/utils";
import type { DeliveryZone } from "@/lib/types";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Calendar as CalendarIcon, Info, ArrowLeft, CreditCard, Truck, User } from "lucide-react";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const router = useRouter();

  // Loading States
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Lists from backend
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [blockedDates, setBlockedDates] = useState<string[]>([]); // Array of YYYY-MM-DD

  // Form Fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "grab" | "gosend">("pickup");
  const [selectedZoneID, setSelectedZoneID] = useState("");
  const [address, setAddress] = useState("");
  const [preorderDate, setPreorderDate] = useState("");
  const [notes, setNotes] = useState("");

  // Payment Options
  const [paymentMethod, setPaymentMethod] = useState("QRIS"); // Default payment method

  useEffect(() => {
    // If cart is empty, redirect back to menu
    if (items.length === 0) {
      toast.info("Your cart is empty. Please add items before checking out.");
      router.push("/");
      return;
    }

    // Fetch delivery zones and blocked dates from API
    Promise.all([api.getDeliveryZones(), api.getBlockedDates()])
      .then(([zones, dates]) => {
        const zonesArr = zones || [];
        const datesArr = dates || [];
        
        setDeliveryZones(zonesArr);
        setBlockedDates(datesArr);
        
        // Auto-select first pickup/delivery zone if available
        const defaultZone = zonesArr.find(z => z.delivery_fee === 0);
        if (defaultZone) {
          setSelectedZoneID(defaultZone.id);
        } else if (zonesArr.length > 0) {
          setSelectedZoneID(zonesArr[0].id);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load checkout details:", err);
        toast.error("Failed to load delivery options from server. Running in offline/fallback mode.");
        setLoading(false);
      });
  }, [items, router]);

  // Handle delivery method change
  const handleDeliveryMethodChange = (method: "pickup" | "grab" | "gosend") => {
    setDeliveryMethod(method);
    if (method === "pickup") {
      // Find the pickup zone (free)
      const pickupZone = deliveryZones.find(z => z.delivery_fee === 0);
      if (pickupZone) {
        setSelectedZoneID(pickupZone.id);
      }
    } else {
      // Find the first delivery zone that has a fee > 0
      const delZone = deliveryZones.find(z => z.delivery_fee > 0);
      if (delZone) {
        setSelectedZoneID(delZone.id);
      }
    }
  };

  // Calculate delivery fee
  const selectedZone = deliveryZones.find(z => z.id === selectedZoneID);
  const deliveryFee = deliveryMethod === "pickup" ? 0 : (selectedZone ? selectedZone.delivery_fee : 20000);
  const finalTotal = totalPrice + deliveryFee;

  // Validate selected date
  const isDateBlocked = (dateStr: string) => {
    return blockedDates.includes(dateStr);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (isDateBlocked(val)) {
      toast.error("The selected preorder date is fully booked. Please choose another date.");
      setPreorderDate("");
      return;
    }
    setPreorderDate(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !phone || !preorderDate) {
      toast.error("Please fill in all required contact and preorder details.");
      return;
    }

    if (deliveryMethod !== "pickup" && !address) {
      toast.error("Please fill in your delivery address.");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Create order in backend
      const orderReq = {
        customer_name: name,
        customer_phone: phone,
        customer_email: email,
        delivery_address: deliveryMethod === "pickup" ? "Self Pickup at Shop" : address,
        delivery_method: deliveryMethod,
        delivery_zone_id: deliveryMethod === "pickup" ? "" : selectedZoneID,
        preorder_date: preorderDate,
        notes: notes,
        items: items.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        }))
      };

      const orderResp = await api.createOrder(orderReq);
      if (!orderResp || !orderResp.id) {
        throw new Error("Failed to place order.");
      }

      toast.success("Order placed successfully! Preparing payment link...");

      // 2. Initiate payment session
      const paymentReq = {
        order_id: orderResp.id,
        payment_method: paymentMethod
      };

      const paymentResp = await api.createPayment(paymentReq);
      if (!paymentResp || !paymentResp.payment_url) {
        throw new Error("Failed to generate payment url.");
      }

      // Clear local cart
      clearCart();

      // 3. Redirect to Payment Gateway (Sandbox or Mock Simulator)
      window.location.href = paymentResp.payment_url;
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to complete checkout. Please try again.");
      setSubmitting(false);
    }
  };

  // Get tomorrow's date format for min date in HTML datepicker
  const getTomorrowString = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-rose-50/10 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-pink-600 font-medium">Loading checkout options...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-rose-50/10 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-pink-600 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to menu</span>
        </button>

        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 tracking-tight">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Checkout Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-8">
            {/* Section 1: Customer Info */}
            <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 pb-3 border-b border-pink-50">
                <User className="w-5 h-5 text-pink-500" />
                Contact Information
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 08123456789"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 focus:outline-none transition-shadow text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 focus:outline-none transition-shadow text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address (Optional)</label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 focus:outline-none transition-shadow text-gray-900"
                />
                <p className="text-xs text-gray-400 mt-1">To receive transaction invoices.</p>
              </div>
            </div>

            {/* Section 2: Delivery Details */}
            <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm space-y-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 pb-3 border-b border-pink-50">
                <Truck className="w-5 h-5 text-pink-500" />
                Delivery Details
              </h2>

              {/* Delivery Radios */}
              <div className="grid grid-cols-3 gap-3">
                {(["pickup", "grab", "gosend"] as const).map((method) => (
                  <label
                    key={method}
                    onClick={() => handleDeliveryMethodChange(method)}
                    className={`cursor-pointer rounded-xl border-2 p-3 text-center flex flex-col items-center justify-center transition-all ${
                      deliveryMethod === method
                        ? "border-pink-500 bg-pink-50/30 text-pink-600 shadow-sm"
                        : "border-gray-100 bg-gray-50 hover:bg-gray-100 text-gray-500"
                    }`}
                  >
                    <span className="font-bold text-xs capitalize">
                      {method === "pickup" ? "Self Pickup" : method === "grab" ? "Grab Instant" : "GoSend"}
                    </span>
                  </label>
                ))}
              </div>

              {deliveryMethod !== "pickup" && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Zone *</label>
                    <select
                      value={selectedZoneID}
                      onChange={e => setSelectedZoneID(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 focus:outline-none transition-shadow text-gray-900 bg-white"
                    >
                      {deliveryZones
                        .filter(z => z.delivery_fee > 0)
                        .map(zone => (
                          <option key={zone.id} value={zone.id}>
                            {zone.name} - {formatRupiah(zone.delivery_fee)}
                          </option>
                        ))}
                    </select>
                    {selectedZone && (
                      <p className="text-xs text-gray-400 mt-1">
                        Covers: {selectedZone.area_description}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Delivery Address *</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Street name, building, unit, cluster details..."
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 focus:outline-none transition-shadow text-gray-900 resize-none"
                    />
                  </div>
                </div>
              )}

              {deliveryMethod === "pickup" && (
                <div className="bg-pink-50/20 border border-pink-100 p-4 rounded-2xl text-sm text-pink-700 flex gap-2">
                  <Info className="w-5 h-5 flex-shrink-0 mt-0.5 text-pink-500" />
                  <p>
                    <strong>Pickup Store Location:</strong> Jl. Sweet Bakery No. 123, Bandung. You can pick up your order starting at 09:00 AM on your selected preorder date.
                  </p>
                </div>
              )}
            </div>

            {/* Section 3: Pre-order Date & Notes */}
            <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 pb-3 border-b border-pink-50">
                <CalendarIcon className="w-5 h-5 text-pink-500" />
                Pre-order Date & Notes
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Preorder Date *</label>
                <input
                  type="date"
                  required
                  min={getTomorrowString()}
                  value={preorderDate}
                  onChange={handleDateChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 focus:outline-none transition-shadow text-gray-900 bg-white"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Orders must be placed at least 1 day in advance. Days crossed out or invalid are fully booked.
                </p>
                
                {blockedDates.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2 items-center text-xs text-gray-500">
                    <span className="font-semibold text-rose-500">Fully Booked Dates:</span>
                    {blockedDates.map(date => (
                      <span key={date} className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded-md border border-rose-100">
                        {date}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order Notes (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Write 'Happy Birthday Sarah!' on the cake card"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 focus:outline-none transition-shadow text-gray-900 resize-none"
                />
              </div>
            </div>

            {/* Section 4: Payment Method */}
            <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 pb-3 border-b border-pink-50">
                <CreditCard className="w-5 h-5 text-pink-500" />
                Payment Method
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { name: "QRIS", desc: "GoPay, OVO, ShopeePay, Dana" },
                  { name: "BCA VA", desc: "BCA Virtual Account" },
                  { name: "Mandiri VA", desc: "Mandiri Virtual Account" }
                ].map(pm => (
                  <label
                    key={pm.name}
                    onClick={() => setPaymentMethod(pm.name)}
                    className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col justify-between transition-all ${
                      paymentMethod === pm.name
                        ? "border-pink-500 bg-pink-50/30 text-pink-600 shadow-sm"
                        : "border-gray-100 bg-gray-50 hover:bg-gray-100 text-gray-500"
                    }`}
                  >
                    <span className="font-bold text-sm">{pm.name}</span>
                    <span className="text-xxs text-gray-400 mt-1 block">{pm.desc}</span>
                  </label>
                ))}
              </div>
            </div>
          </form>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-100">Order Summary</h2>

              {/* Items List */}
              <div className="space-y-4 max-h-80 overflow-y-auto mb-6 pr-2">
                {items.map(item => (
                  <div key={item.id} className="flex gap-3 items-center">
                    <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                      <ImageWithFallback src={item.img} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm truncate">{item.name}</h4>
                      <p className="text-xs text-gray-400">
                        {item.quantity} x {formatRupiah(item.price)}
                      </p>
                    </div>
                    <span className="font-semibold text-gray-900 text-sm whitespace-nowrap">
                      {formatRupiah(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 pt-4 border-t border-gray-100 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Cart Subtotal</span>
                  <span>{formatRupiah(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee ({deliveryMethod === "pickup" ? "Pickup" : "Courier"})</span>
                  <span>{formatRupiah(deliveryFee)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-100">
                  <span>Total Amount</span>
                  <span className="text-pink-600">{formatRupiah(finalTotal)}</span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full mt-6 py-4 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-lg shadow-lg hover:shadow-pink-200 transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Pay Now</span>
                  </>
                )}
              </button>
              
              <div className="mt-4 flex gap-2 items-center text-xs text-gray-400 justify-center">
                <Info className="w-4 h-4 flex-shrink-0 text-gray-300" />
                <p>Secured by Duitku Payment Gateway</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
