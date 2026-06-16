"use client";

import React, { useEffect, useState } from "react";
import { formatRupiah } from "@/lib/utils";
import type { Order } from "@/lib/types";
import { toast } from "sonner";
import { Search, ExternalLink, Calendar, MessageCircle, Info, RefreshCw, X } from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    const token = localStorage.getItem("admin_token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

    try {
      const res = await fetch(`${apiUrl}/admin/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch orders");
      setOrders(data || []);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to load orders from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    const token = localStorage.getItem("admin_token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

    try {
      const res = await fetch(`${apiUrl}/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update order status");

      toast.success(`Order ${data.order_number} marked as ${newStatus}`);

      // Update state
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update status.");
    }
  };

  // Filter and search logic
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_phone.includes(searchTerm);

    const matchesStatus = statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-100";
      case "paid":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "confirmed":
        return "bg-pink-50 text-pink-700 border-pink-100";
      case "delivered":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "cancelled":
        return "bg-gray-50 text-gray-700 border-gray-100";
      default:
        return "bg-gray-50 text-gray-700 border-gray-100";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Row */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Order Preorders</h1>
          <p className="text-sm text-gray-500">Track and manage customer cake preorders.</p>
        </div>
        <button
          onClick={fetchOrders}
          disabled={loading}
          className="p-2.5 bg-white border border-gray-200 hover:border-pink-500 hover:text-pink-500 rounded-xl text-gray-600 transition-all flex items-center justify-center gap-2"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline font-semibold text-sm">Refresh</span>
        </button>
      </div>

      {/* Filter Options Row */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between bg-white p-4 rounded-2xl border border-pink-100 shadow-xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute inset-y-0 left-3 w-5 h-5 text-gray-400 my-auto" />
          <input
            type="text"
            placeholder="Search by code, customer name, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300 transition-shadow text-sm text-gray-900"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest hidden md:inline">
            Filter Status:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm text-gray-900"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="confirmed">Confirmed</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Main List */}
      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium text-sm">Loading orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-pink-100 p-12 text-center space-y-4 shadow-xs">
          <Info className="w-12 h-12 text-pink-300 mx-auto" />
          <h3 className="text-lg font-bold text-gray-900">No orders found</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Try adjusting your search terms or filters to find what you are looking for.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-pink-100 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold">
                  <th className="p-4">Order Code</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Preorder Date</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-pink-50/10 transition-colors">
                    <td className="p-4">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="font-mono text-pink-500 hover:underline font-bold"
                      >
                        {order.order_number}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-gray-900">{order.customer_name}</div>
                      <div className="text-xs text-gray-400 font-mono">{order.customer_phone}</div>
                    </td>
                    <td className="p-4 text-gray-600 font-medium">
                      {new Date(order.preorder_date).toLocaleDateString("id-ID", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="p-4 font-bold text-gray-900">
                      {formatRupiah(order.total_amount)}
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 flex items-center gap-2">
                      {/* View Button */}
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg text-xs font-bold border border-gray-200 transition-colors"
                      >
                        Details
                      </button>

                      {/* Confirm Order (Paid -> Confirmed) */}
                      {order.status === "paid" && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, "confirmed")}
                          className="px-3 py-1.5 bg-pink-500 hover:bg-pink-600 text-white rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer"
                        >
                          Confirm Order
                        </button>
                      )}

                      {/* Deliver Order (Confirmed -> Delivered) */}
                      {order.status === "confirmed" && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, "delivered")}
                          className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer"
                        >
                          Mark Delivered
                        </button>
                      )}

                      {/* WhatsApp Button */}
                      <a
                        href={`https://wa.me/${order.customer_phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg border border-emerald-100 transition-colors flex items-center justify-center"
                        title="Chat on WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-[80] animate-fadeIn">
          <div className="bg-white rounded-3xl border border-pink-100 shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 relative">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Title */}
            <div>
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-widest">Order Detail</span>
              <h2 className="text-xl font-bold text-gray-900 font-mono mt-1 text-pink-600">
                {selectedOrder.order_number}
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Database ID: {selectedOrder.id}
              </p>
            </div>

            {/* Contact & Status Change */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
              <div className="space-y-2 text-sm">
                <h4 className="font-bold text-gray-400 uppercase tracking-wider text-xs">Customer</h4>
                <p className="font-bold text-gray-900">{selectedOrder.customer_name}</p>
                <p className="font-mono text-gray-600">{selectedOrder.customer_phone}</p>
                {selectedOrder.customer_email && <p className="text-gray-500">{selectedOrder.customer_email}</p>}
                <p className="text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100 text-xs mt-2">
                  <strong>Address:</strong> {selectedOrder.delivery_address}
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-gray-400 uppercase tracking-wider text-xs">Preorder Schedule</h4>
                  <p className="font-bold text-gray-900 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-pink-500" />
                    {new Date(selectedOrder.preorder_date).toLocaleDateString("id-ID", {
                      weekday: "short",
                      day: "numeric",
                      month: "long",
                      year: "numeric"
                    })}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">Method: {selectedOrder.delivery_method}</p>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-gray-400 uppercase tracking-wider text-xs">Update Status</h4>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-pink-300 text-gray-900"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  {selectedOrder.status !== "cancelled" && selectedOrder.status !== "delivered" && (
                    <div className="pt-2">
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to CANCEL order ${selectedOrder.order_number}?`)) {
                            handleUpdateStatus(selectedOrder.id, "cancelled");
                          }
                        }}
                        className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold border border-rose-200 transition-colors cursor-pointer"
                      >
                        Cancel Order
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Items Summary Table */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <h4 className="font-bold text-gray-400 uppercase tracking-wider text-xs mb-2">Order Items</h4>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-3">
                {selectedOrder.order_items?.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <div className="min-w-0">
                      <span className="font-semibold text-gray-900 truncate block">{item.name}</span>
                      <span className="text-xs text-gray-400">
                        {item.quantity} x {formatRupiah(item.price)}
                      </span>
                    </div>
                    <span className="font-bold text-gray-900 whitespace-nowrap">
                      {formatRupiah(item.subtotal)}
                    </span>
                  </div>
                ))}
                
                <div className="border-t border-gray-250 my-2 pt-2 space-y-1 text-xs">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span>
                    <span>{formatRupiah(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Delivery Fee</span>
                    <span>{formatRupiah(selectedOrder.delivery_fee)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-gray-900 border-t border-gray-250 pt-2">
                    <span>Total Amount</span>
                    <span className="text-pink-600">{formatRupiah(selectedOrder.total_amount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {selectedOrder.notes && (
              <div className="space-y-2 pt-4 border-t border-gray-100 text-sm">
                <h4 className="font-bold text-gray-400 uppercase tracking-wider text-xs">Customer Notes</h4>
                <p className="text-gray-700 bg-amber-50/50 p-3 rounded-xl border border-amber-100 text-xs italic">
                  "{selectedOrder.notes}"
                </p>
              </div>
            )}

            {/* Payment Details */}
            <div className="space-y-2 pt-4 border-t border-gray-100 text-sm">
              <h4 className="font-bold text-gray-400 uppercase tracking-wider text-xs">Payment Info</h4>
              <div className="grid grid-cols-2 gap-y-2 text-xs">
                <span className="text-gray-500">Gateway Reference:</span>
                <span className="text-right font-mono text-gray-700">
                  {selectedOrder.payment?.duitku_reference || "N/A"}
                </span>
                
                <span className="text-gray-500">Method selected:</span>
                <span className="text-right font-semibold text-gray-700">
                  {selectedOrder.payment?.payment_method || "N/A"}
                </span>

                <span className="text-gray-500">Payment Link:</span>
                <span className="text-right truncate max-w-xs text-blue-500 underline">
                  {selectedOrder.payment?.payment_url ? (
                    <a href={selectedOrder.payment.payment_url} target="_blank" rel="noreferrer" className="flex items-center justify-end gap-1">
                      Link <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : "N/A"}
                </span>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
