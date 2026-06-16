"use client";

import React, { useEffect, useState } from "react";
import { formatRupiah } from "@/lib/utils";
import type { Product, Category } from "@/lib/types";
import { toast } from "sonner";
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, Loader2, Upload, X } from "lucide-react";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [sortOrder, setSortOrder] = useState("0");

  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem("admin_token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

    try {
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch products and categories in parallel
      const [prodRes, catRes] = await Promise.all([
        fetch(`${apiUrl}/admin/products`, { headers }),
        fetch(`${apiUrl}/categories`)
      ]);

      const prods = await prodRes.json();
      const cats = await catRes.json();

      if (!prodRes.ok) throw new Error(prods.error || "Failed to load products");
      if (!catRes.ok) throw new Error(cats.error || "Failed to load categories");

      setProducts(prods || []);
      setCategories(cats || []);

      const catsArr = cats || [];
      if (catsArr.length > 0 && !categoryId) {
        setCategoryId(catsArr[0].id);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to retrieve products data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedProductId(null);
    setName("");
    setDescription("");
    setPrice("");
    setUnit("");
    setImageUrl("");
    setIsActive(true);
    setIsBestSeller(false);
    setSortOrder("0");
    if (categories.length > 0) {
      setCategoryId(categories[0].id);
    }
    setShowModal(true);
  };

  const openEditModal = (p: Product) => {
    setModalMode("edit");
    setSelectedProductId(p.id);
    setName(p.name);
    setDescription(p.description);
    setPrice(p.price.toString());
    setUnit(p.unit || "");
    setCategoryId(p.category_id);
    setImageUrl(p.image_url || "");
    setIsActive(p.is_active);
    setIsBestSeller(p.is_best_seller || false);
    setSortOrder((p.sort_order || 0).toString());
    setShowModal(true);
  };

  // Image Upload helper
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const formData = new FormData();
    formData.append("file", file);

    setUploadingImage(true);
    const token = localStorage.getItem("admin_token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

    try {
      const res = await fetch(`${apiUrl}/admin/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Image upload failed");

      // Store relative path returned: e.g. /uploads/filename.jpg
      // Prefix with backend host URL so it renders properly in frontend
      const backendUrl = apiUrl.replace("/api/v1", "");
      setImageUrl(backendUrl + data.image_url);
      toast.success("Image uploaded successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to upload image.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !price || !categoryId) {
      toast.error("Please fill in all required product fields.");
      return;
    }

    const token = localStorage.getItem("admin_token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

    const payload = {
      name,
      description,
      price: parseInt(price),
      unit,
      category_id: categoryId,
      image_url: imageUrl,
      is_active: isActive,
      is_best_seller: isBestSeller,
      sort_order: parseInt(sortOrder),
    };

    try {
      let res;
      if (modalMode === "create") {
        res = await fetch(`${apiUrl}/admin/products`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${apiUrl}/admin/products/${selectedProductId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save product");

      toast.success(modalMode === "create" ? "Product created successfully!" : "Product updated successfully!");
      setShowModal(false);
      fetchData(); // Refresh grid
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save product details.");
    }
  };

  const handleToggleActive = async (p: Product) => {
    const token = localStorage.getItem("admin_token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

    try {
      const res = await fetch(`${apiUrl}/admin/products/${p.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: !p.is_active }),
      });

      if (!res.ok) throw new Error("Failed to toggle status");

      toast.success(`Product ${p.name} marked as ${!p.is_active ? "active" : "inactive"}`);
      setProducts(prev => prev.map(item => item.id === p.id ? { ...item, is_active: !item.is_active } : item));
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to toggle product status.");
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete product: "${name}"?`)) return;

    const token = localStorage.getItem("admin_token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

    try {
      const res = await fetch(`${apiUrl}/admin/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Delete failed");
      toast.success("Product deleted successfully!");
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to delete product.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Cake Catalog</h1>
          <p className="text-sm text-gray-500">Manage products, pricing, and category structures.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-pink-100 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center text-center space-y-4">
          <Loader2 className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 font-medium text-sm">Loading products catalog...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-3xl border border-pink-100 p-12 text-center space-y-4">
          <p className="text-gray-500">No products created yet. Click "Add Product" to create your first cake!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <div
              key={p.id}
              className={`bg-white rounded-3xl overflow-hidden border border-pink-100 shadow-xs flex flex-col justify-between transition-all ${
                !p.is_active ? "opacity-65" : ""
              }`}
            >
              <div>
                <div className="aspect-[4/3] bg-gray-50 relative overflow-hidden">
                  <ImageWithFallback src={p.image_url || ""} alt={p.name} className="w-full h-full object-cover" />
                  {p.is_best_seller && (
                    <span className="absolute top-3 left-3 bg-pink-500 text-xs font-bold text-white px-3 py-1 rounded-full shadow-md z-10 animate-pulse">
                      Best Seller
                    </span>
                  )}
                  <span className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs text-xs font-bold text-gray-700 px-3 py-1 rounded-full border border-gray-100 shadow-xs">
                    {p.category?.name || "Uncategorized"}
                  </span>
                </div>
                
                <div className="p-5 space-y-2">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="font-bold text-gray-900 text-lg leading-snug">{p.name}</h3>
                    <span className="font-bold text-pink-600 shrink-0">
                      {formatRupiah(p.price)}
                      <span className="text-xs text-gray-400 font-normal">{p.unit}</span>
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs line-clamp-2 h-8">{p.description}</p>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="px-5 py-4 border-t border-gray-50 bg-gray-50/50 flex items-center justify-between">
                <button
                  onClick={() => handleToggleActive(p)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors"
                  title={p.is_active ? "Click to Deactivate" : "Click to Activate"}
                >
                  {p.is_active ? (
                    <>
                      <ToggleRight className="w-6 h-6 text-pink-500" />
                      <span className="text-pink-600">Active</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-6 h-6 text-gray-300" />
                      <span>Inactive</span>
                    </>
                  )}
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(p)}
                    className="p-2 bg-white hover:bg-gray-100 border border-gray-200 text-gray-600 rounded-lg hover:text-pink-500 transition-all"
                    title="Edit Product"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(p.id, p.name)}
                    className="p-2 bg-white hover:bg-rose-50 border border-gray-200 text-gray-600 rounded-lg hover:text-rose-600 transition-all"
                    title="Delete Product"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-[80]">
          <div className="bg-white rounded-3xl border border-pink-100 shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 relative animate-scaleIn">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-extrabold text-gray-900">
              {modalMode === "create" ? "Add New Product" : "Edit Product"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Strawberry Roll Cake"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-pink-300 text-gray-900"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (IDR) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    placeholder="250000"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit Description</label>
                  <input
                    type="text"
                    placeholder="e.g. / box, / half-dozen"
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Description</label>
                <textarea
                  rows={2}
                  placeholder="Tell customers about the taste, texture, and ingredients..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-gray-900 resize-none"
                />
              </div>

              {/* Image Upload Row */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-xl border border-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {imageUrl ? (
                      <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <Upload className="w-6 h-6 text-gray-300" />
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      placeholder="Or enter image URL link..."
                      value={imageUrl}
                      onChange={e => setImageUrl(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-xs text-gray-900"
                    />
                    
                    <label className="inline-flex items-center justify-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs font-bold transition-all cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingImage ? "Uploading..." : "Upload local image"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={e => setSortOrder(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-gray-900"
                  />
                </div>
                <div className="flex flex-col gap-3 pt-6 pl-2 sm:flex-row sm:items-center sm:gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={e => setIsActive(e.target.checked)}
                      className="accent-pink-500 h-4 w-4"
                    />
                    <span className="text-sm font-medium text-gray-700">Display in Catalog</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isBestSeller}
                      onChange={e => setIsBestSeller(e.target.checked)}
                      className="accent-pink-500 h-4 w-4"
                    />
                    <span className="text-sm font-medium text-gray-700">Best Seller ⭐</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl font-bold text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-bold text-sm transition-all shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
