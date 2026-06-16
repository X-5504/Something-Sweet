"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Loader2, FolderKanban, X } from "lucide-react";
import { API_BASE } from "@/lib/api";

interface Category {
  id: string;
  name: string;
  description: string;
  sort_order: number;
}

export default function AdminCategoriesPage() {
  const apiUrl = API_BASE;
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState("0");

  const fetchCategories = async () => {
    setLoading(true);

    try {
      const res = await fetch(`${apiUrl}/categories`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch categories");
      setCategories(data || []);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedCategoryId(null);
    setName("");
    setDescription("");
    setSortOrder("0");
    setShowModal(true);
  };

  const openEditModal = (cat: Category) => {
    setModalMode("edit");
    setSelectedCategoryId(cat.id);
    setName(cat.name);
    setDescription(cat.description || "");
    setSortOrder((cat.sort_order || 0).toString());
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please fill in the category name.");
      return;
    }

    const token = localStorage.getItem("admin_token");

    const payload = {
      name: name.trim(),
      description: description.trim(),
      sort_order: parseInt(sortOrder) || 0,
    };

    try {
      let res;
      if (modalMode === "create") {
        res = await fetch(`${apiUrl}/admin/categories`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${apiUrl}/admin/categories/${selectedCategoryId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save category");

      toast.success(
        modalMode === "create"
          ? "Category created successfully!"
          : "Category updated successfully!"
      );
      setShowModal(false);
      fetchCategories();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save category.");
    }
  };

  const handleDeleteCategory = async (id: string, catName: string) => {
    if (!confirm(`Are you sure you want to delete category: "${catName}"?\nThis cannot be undone.`)) {
      return;
    }

    const token = localStorage.getItem("admin_token");

    try {
      const res = await fetch(`${apiUrl}/admin/categories/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete operation failed");

      toast.success("Category deleted successfully!");
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to delete category. Check if there are active products using it.");
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner Row */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <FolderKanban className="w-8 h-8 text-pink-500" />
            Categories
          </h1>
          <p className="text-sm text-gray-500">
            Create and manage categories to structure your storefront menu catalog.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-pink-100 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Main content table */}
      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center text-center space-y-4">
          <Loader2 className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 font-medium text-sm">Loading categories...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white rounded-3xl border border-pink-100 p-12 text-center space-y-4 shadow-xs">
          <p className="text-gray-500">No categories found. Click "Add Category" to create one!</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-pink-100 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold">
                  <th className="p-4 w-1/4">Name</th>
                  <th className="p-4 w-1/2">Description</th>
                  <th className="p-4 w-1/8 text-center">Sort Order</th>
                  <th className="p-4 w-1/8 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-pink-50/10 transition-colors">
                    <td className="p-4 font-bold text-gray-900">{cat.name}</td>
                    <td className="p-4 text-gray-500">{cat.description || <span className="text-gray-300 italic">No description</span>}</td>
                    <td className="p-4 text-center">
                      <span className="inline-block px-2.5 py-1 bg-gray-100 rounded-md font-mono text-xs font-semibold text-gray-600">
                        {cat.sort_order}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="p-2 bg-white hover:bg-gray-100 border border-gray-200 text-gray-600 rounded-lg hover:text-pink-500 transition-all"
                          title="Edit Category"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat.id, cat.name)}
                          className="p-2 bg-white hover:bg-rose-50 border border-gray-200 text-gray-600 rounded-lg hover:text-rose-600 transition-all"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-[80] animate-fadeIn">
          <div className="bg-white rounded-3xl border border-pink-100 shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 relative animate-scaleIn">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-extrabold text-gray-900">
              {modalMode === "create" ? "Add New Category" : "Edit Category"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Signature Chiffon Cakes"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Cloud-like, airy perfection in three irresistible flavors."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-gray-900 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                <input
                  type="number"
                  placeholder="0"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-gray-900"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Determines the rendering sequence of categories in navigation filters.
                </p>
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
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
