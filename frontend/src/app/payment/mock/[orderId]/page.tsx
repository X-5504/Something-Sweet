"use client";

import React, { useEffect, useState, use } from "react";
import { api } from "@/lib/api";
import { formatRupiah } from "@/lib/utils";
import type { Order } from "@/lib/types";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Info, ShieldAlert, CreditCard } from "lucide-react";

export default function MockPaymentPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const router = useRouter();
  
  // Unwrapping params using React.use()
  const { orderId } = use(params);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    api.getOrderStatus(orderId)
      .then((data) => {
        setOrder(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load order details.");
        setLoading(false);
      });
  }, [orderId]);

  const handleSimulatePayment = async (success: boolean) => {
    setProcessing(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1"}/payments/mock-trigger`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: orderId,
          success: success
        })
      });

      if (!res.ok) {
        throw new Error("Simulation request failed");
      }

      if (success) {
        toast.success("Payment success simulated! Redirecting...");
      } else {
        toast.error("Payment failure simulated! Redirecting...");
      }

      // Redirect to order details page after a small delay
      setTimeout(() => {
        router.push(`/order/${orderId}`);
      }, 1500);

    } catch (error) {
      console.error(error);
      toast.error("Failed to trigger mock payment status update.");
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-zinc-400 font-medium">Loading Duitku Simulator...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
        <div className="max-w-md p-6 bg-zinc-900 rounded-3xl border border-zinc-800 text-center">
          <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto mb-4 animate-bounce" />
          <h1 className="text-xl font-bold mb-2">Order Not Found</h1>
          <p className="text-zinc-500 text-sm mb-6">
            The order ID does not exist or has expired.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-all"
          >
            Go back to Store
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      {/* Simulation Banner */}
      <div className="w-full max-w-lg mb-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex gap-3 text-amber-500">
        <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="text-xs">
          <p className="font-bold">Local Development Mode</p>
          <p className="mt-1">
            This is a mock payment screen simulating the Duitku Payment Gateway.
            Since you are testing locally, clicking a button below will simulate a server-to-server webhook callback.
          </p>
        </div>
      </div>

      {/* Simulator Terminal Card */}
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
        {/* Gateway Branded Header */}
        <div className="bg-zinc-800 px-6 py-5 flex items-center justify-between border-b border-zinc-700/50">
          <div className="flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-emerald-500" />
            <span className="font-bold text-white tracking-wide text-sm">DUITKU SIMULATOR</span>
          </div>
          <span className="bg-zinc-700/50 text-emerald-400 font-mono text-xxs px-2.5 py-1 rounded-full uppercase border border-emerald-500/10">
            Sandbox Active
          </span>
        </div>

        {/* Invoice Area */}
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <p className="text-xs text-zinc-500 uppercase tracking-widest">Transaction Invoice</p>
            <div className="grid grid-cols-2 gap-y-3 text-sm">
              <div className="text-zinc-500">Order Number:</div>
              <div className="text-white font-mono text-right">{order.order_number}</div>

              <div className="text-zinc-500">Customer Name:</div>
              <div className="text-white text-right">{order.customer_name}</div>

              <div className="text-zinc-500">Payment Method:</div>
              <div className="text-white text-right font-semibold">
                {order.payment?.payment_method || "QRIS"}
              </div>

              <div className="text-zinc-500">Total Amount:</div>
              <div className="text-emerald-400 font-bold text-lg text-right">
                {formatRupiah(order.total_amount)}
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-800/80 my-4"></div>

          {/* Action Simulation Buttons */}
          <div className="space-y-3">
            <p className="text-xs text-zinc-500 uppercase tracking-widest text-center mb-2">
              Select Simulated Result
            </p>
            
            <button
              onClick={() => handleSimulatePayment(true)}
              disabled={processing}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold rounded-xl transition-all shadow-lg hover:shadow-emerald-950 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {processing ? (
                <div className="w-5 h-5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Simulate Payment SUCCESS</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleSimulatePayment(false)}
              disabled={processing}
              className="w-full py-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {processing ? (
                <div className="w-5 h-5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <XCircle className="w-5 h-5" />
                  <span>Simulate Payment FAILURE</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-zinc-950/40 p-4 border-t border-zinc-800 text-center">
          <p className="text-[10px] text-zinc-600 font-mono">
            Gateway simulation only. No actual money will be charged.
          </p>
        </div>
      </div>
    </div>
  );
}
