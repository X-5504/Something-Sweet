"use client";

import React, { useEffect, useState } from "react";
import { formatRupiah } from "@/lib/utils";
import type { DeliveryZone } from "@/lib/types";
import { toast } from "sonner";
import { Calendar, Truck, Trash2, Plus, Info, Loader2, X } from "lucide-react";
import { API_BASE } from "@/lib/api";

interface BlockedDateDetail {
  id: string;
  date: string;
  reason: string;
}

export default function AdminSettingsPage() {
  const apiUrl = API_BASE;
  const [activeTab, setActiveTab] = useState<"dates" | "zones">("dates");
  const [loading, setLoading] = useState(true);

  // States
  const [blockedDates, setBlockedDates] = useState<BlockedDateDetail[]>([]);
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);

  // Modals state
  const [showDateModal, setShowDateModal] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newDateReason, setNewDateReason] = useState("Fully Booked");

  const [showZoneModal, setShowZoneModal] = useState(false);
  const [zoneMode, setZoneMode] = useState<"create" | "edit">("create");
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [zoneName, setZoneName] = useState("");
  const [zoneDesc, setZoneDesc] = useState("");
  const [zoneFee, setZoneFee] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem("admin_token");

    try {
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch blocked dates (admin details) and delivery zones
      const [datesRes, zonesRes] = await Promise.all([
        fetch(`${apiUrl}/admin/blocked-dates`, { headers }),
        fetch(`${apiUrl}/delivery-zones`)
      ]);

      const dates = await datesRes.json();
      const zones = await zonesRes.json();

      if (!datesRes.ok) throw new Error(dates.error || "Failed to load blocked dates");
      if (!zonesRes.ok) throw new Error(zones.error || "Failed to load delivery zones");

      setBlockedDates(dates || []);
      setDeliveryZones(zones || []);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to fetch settings details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Blocked Dates Handlers ---
  const handleBlockDate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newDate) return;

    const token = localStorage.getItem("admin_token");

    try {
      const res = await fetch(`${apiUrl}/admin/blocked-dates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: newDate,
          reason: newDateReason,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to block date");

      toast.success("Preorder date blocked successfully!");
      setShowDateModal(false);
      fetchData(); // Refresh list
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to block date.");
    }
  };

  const handleUnblockDate = async (id: string, dateStr: string) => {
    const formattedDate = new Date(dateStr).toLocaleDateString("id-ID");
    if (!confirm(`Are you sure you want to open preorders again for ${formattedDate}?`)) return;

    const token = localStorage.getItem("admin_token");

    try {
      const res = await fetch(`${apiUrl}/admin/blocked-dates/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Unblock failed");

      toast.success("Date opened for preorders!");
      setBlockedDates(prev => prev.filter(bd => bd.id !== id));
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to unblock date.");
    }
  };

  // --- Delivery Zones Handlers ---
  const openCreateZoneModal = () => {
    setZoneMode("create");
    setSelectedZoneId(null);
    setZoneName("");
    setZoneDesc("");
    setZoneFee("");
    setShowZoneModal(true);
  };

  const openEditZoneModal = (z: DeliveryZone) => {
    setZoneMode("edit");
    setSelectedZoneId(z.id);
    setZoneName(z.name);
    setZoneDesc(z.area_description || "");
    setZoneFee((z.delivery_fee || 0).toString());
    setShowZoneModal(true);
  };

  const handleSaveZone = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!zoneName || !zoneFee) return;

    const token = localStorage.getItem("admin_token");

    const payload = {
      name: zoneName,
      area_description: zoneDesc,
      delivery_fee: parseInt(zoneFee),
    };

    try {
      let res;
      if (zoneMode === "create") {
        res = await fetch(`${apiUrl}/admin/delivery-zones`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${apiUrl}/admin/delivery-zones/${selectedZoneId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) throw new Error("Failed to save delivery zone");

      toast.success("Delivery zone configuration saved!");
      setShowZoneModal(false);
      fetchData(); // Refresh list
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to save delivery zone details.");
    }
  };

  const handleDeleteZone = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete delivery zone: "${name}"?`)) return;

    const token = localStorage.getItem("admin_token");

    try {
      const res = await fetch(`${apiUrl}/admin/delivery-zones/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Delete failed");

      toast.success("Delivery zone deleted successfully.");
      setDeliveryZones(prev => prev.filter(dz => dz.id !== id));
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to delete delivery zone.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">System Settings</h1>
        <p className="text-sm text-gray-500">Configure preorder calendars and shipping pricing metrics.</p>
      </div>

      {/* Tabs Select */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("dates")}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-semibold text-sm transition-all ${
            activeTab === "dates"
              ? "border-pink-500 text-pink-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span>Fully Booked Dates</span>
        </button>
        <button
          onClick={() => setActiveTab("zones")}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-semibold text-sm transition-all ${
            activeTab === "zones"
              ? "border-pink-500 text-pink-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Truck className="w-5 h-5" />
          <span>Delivery Zones</span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center text-center space-y-4">
          <Loader2 className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 font-medium text-sm">Loading settings details...</p>
        </div>
      ) : activeTab === "dates" ? (
        // Blocked Dates Tab Content
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-pink-100 shadow-xs">
            <span className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
              <Info className="w-4 h-4 text-pink-400" />
              Storefront calendar blocks these dates from preorders.
            </span>
            <button
              onClick={() => {
                setNewDate("");
                setNewDateReason("Fully Booked");
                setShowDateModal(true);
              }}
              className="px-3.5 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Block Date</span>
            </button>
          </div>

          {blockedDates.length === 0 ? (
            <div className="bg-white rounded-3xl border border-pink-100 p-8 text-center text-gray-400">
              No dates currently blocked. All future slots are open!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {blockedDates.map((bd) => (
                <div
                  key={bd.id}
                  className="bg-white p-4 rounded-2xl border border-pink-100 shadow-xs flex justify-between items-center"
                >
                  <div>
                    <span className="font-bold text-gray-900 text-sm">
                      {new Date(bd.date).toLocaleDateString("id-ID", {
                        weekday: "short",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                    <span className="block text-xxs text-rose-500 font-semibold mt-1 uppercase tracking-wider">
                      {bd.reason}
                    </span>
                  </div>
                  <button
                    onClick={() => handleUnblockDate(bd.id, bd.date)}
                    className="p-2 bg-white hover:bg-rose-50 border border-gray-100 rounded-lg hover:text-rose-600 transition-all text-gray-400"
                    title="Unblock Date"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        // Delivery Zones Tab Content
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-pink-100 shadow-xs">
            <span className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
              <Info className="w-4 h-4 text-pink-400" />
              Set regional delivery tariffs. The fee matches selected zone during checkout.
            </span>
            <button
              onClick={openCreateZoneModal}
              className="px-3.5 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Zone</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-pink-100 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold">
                    <th className="p-4">Zone Name</th>
                    <th className="p-4">Area Descriptions</th>
                    <th className="p-4">Delivery Fee</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {deliveryZones.map((z) => (
                    <tr key={z.id} className="hover:bg-gray-50/50">
                      <td className="p-4 font-bold text-gray-900">{z.name}</td>
                      <td className="p-4 text-xs text-gray-400 max-w-sm truncate">
                        {z.area_description || "N/A"}
                      </td>
                      <td className="p-4 font-bold text-gray-900">
                        {formatRupiah(z.delivery_fee || 0)}
                      </td>
                      <td className="p-4 flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditZoneModal(z)}
                          className="px-3 py-1.5 border border-gray-200 bg-white hover:bg-gray-50 rounded-lg text-xs font-bold transition-all text-gray-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteZone(z.id, z.name)}
                          className="p-1.5 border border-gray-250 bg-white hover:bg-rose-50 text-gray-500 hover:text-rose-600 rounded-lg transition-all"
                          title="Delete Zone"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Date Block Modal */}
      {showDateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-[80]">
          <div className="bg-white rounded-3xl border border-pink-100 shadow-xl max-w-md w-full p-6 sm:p-8 space-y-6 relative animate-scaleIn">
            <button
              onClick={() => setShowDateModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-extrabold text-gray-900">Block Order Date</h2>

            <form onSubmit={handleBlockDate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Date *</label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Block Reason</label>
                <input
                  type="text"
                  value={newDateReason}
                  onChange={e => setNewDateReason(e.target.value)}
                  placeholder="Fully Booked"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-gray-900"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDateModal(false)}
                  className="flex-1 py-3 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl font-bold text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-bold text-sm transition-all shadow-md"
                >
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Zone CRUD Modal */}
      {showZoneModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-[80]">
          <div className="bg-white rounded-3xl border border-pink-100 shadow-xl max-w-md w-full p-6 sm:p-8 space-y-6 relative animate-scaleIn">
            <button
              onClick={() => setShowZoneModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-extrabold text-gray-900">
              {zoneMode === "create" ? "Add Delivery Zone" : "Edit Delivery Zone"}
            </h2>

            <form onSubmit={handleSaveZone} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zone Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Zone 1 (Close Range)"
                  value={zoneName}
                  onChange={e => setZoneName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Regional Fee (IDR) *</label>
                <input
                  type="number"
                  required
                  placeholder="15000"
                  value={zoneFee}
                  onChange={e => setZoneFee(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Covers Areas / Districts</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Kecamatan Regol, Lengkong, Buahbatu"
                  value={zoneDesc}
                  onChange={e => setZoneDesc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-gray-900 resize-none"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowZoneModal(false)}
                  className="flex-1 py-3 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl font-bold text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-bold text-sm transition-all shadow-md"
                >
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
