"use client";

import React, { useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Search, Info, Clock, CheckCircle2, ChevronRight } from "lucide-react";

export default function TrackOrderPage() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orderNumber.trim()) {
      toast.error("Please enter your order code.");
      return;
    }

    setLoading(true);
    try {
      // Duitku / Orders API call to track order by code
      const order = await api.trackOrder(orderNumber.trim());
      if (order && order.id) {
        toast.success("Order found!");
        router.push(`/order/${order.id}`);
      } else {
        toast.error("No order found with that code.");
        setLoading(false);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Order code not found. Please double check the code.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-rose-50/10 py-16 px-4">
      <div className="max-w-md mx-auto bg-white rounded-3xl border border-pink-100 shadow-sm p-6 sm:p-8 space-y-6">
        
        {/* Track header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-500 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Track Your Order</h1>
          <p className="text-sm text-gray-500 max-w-xs mx-auto">
            Enter your order number code from your checkout receipt or invoice page.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleTrack} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 pl-1">
              Order Code Number
            </label>
            <input
              type="text"
              required
              placeholder="e.g. SS-20260616-1234"
              value={orderNumber}
              onChange={e => setOrderNumber(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 focus:outline-none transition-shadow text-gray-900 font-mono tracking-wide placeholder:font-sans"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-base shadow-lg hover:shadow-pink-200 transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Search Order</span>
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="border-t border-gray-100 my-4"></div>

        {/* Guide Notice */}
        <div className="bg-pink-50/20 border border-pink-100 p-4 rounded-xl flex gap-3 text-xs text-pink-800">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-pink-500" />
          <div className="space-y-1">
            <p className="font-bold">Where can I find the code?</p>
            <p>
              Your order code has the format <strong>SS-YYYYMMDD-XXXX</strong>. It was displayed on the screen after you placed your preorder. If you specified an email address, you can also find it in the invoice details.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
