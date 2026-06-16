"use client";

import React, { useState, useEffect } from "react";
import { Search, ShoppingBag, Plus, Minus, Info } from "lucide-react";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { formatRupiah } from "@/lib/utils";
import { API_BASE } from "@/lib/api";
import type { Product, ProductsByCategory } from "@/lib/types";

// Fallback data when API is not available
const fallbackMenuItems: ProductsByCategory[] = [
  {
    category: "Signature Chiffon Cakes",
    description: "Cloud-like, airy perfection in three irresistible flavors.",
    items: [
      {
        id: "c1",
        category_id: "cat1",
        name: "Pandan Chiffon",
        description: "Infused with real pandan leaves for an aromatic, lightly sweet bite.",
        price: 240000,
        unit: "",
        image_url:
          "https://images.unsplash.com/photo-1759324351433-c5a1063f8ac6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlbiUyMHNwb25nZSUyMGNha2UlMjBzbGljZXxlbnwxfHx8fDE3NzY1NjAyNzB8MA&ixlib=rb-4.1.0&q=80&w=1080",
        is_active: true,
        sort_order: 0,
      },
      {
        id: "c2",
        category_id: "cat1",
        name: "Chocolate Chiffon",
        description: "Airy cocoa goodness that melts perfectly in your mouth.",
        price: 260000,
        unit: "",
        image_url:
          "https://images.unsplash.com/photo-1574344069030-b2926f1b3d06?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaG9jb2xhdGUlMjBzcG9uZ2UlMjBjYWtlfGVufDF8fHx8MTc3NjU2MDI3MHww&ixlib=rb-4.1.0&q=80&w=1080",
        is_active: true,
        sort_order: 1,
      },
      {
        id: "c3",
        category_id: "cat1",
        name: "Cheese Chiffon",
        description: "Sweet meets savory in this impossibly soft cheese-topped sponge.",
        price: 280000,
        unit: "",
        image_url:
          "https://images.unsplash.com/photo-1731045102967-6e97132a7245?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGVlc2UlMjBzcG9uZ2UlMjBjYWtlJTIwc2xpY2V8ZW58MXx8fHwxNzc2NTYwMjc3fDA&ixlib=rb-4.1.0&q=80&w=1080",
        is_active: true,
        sort_order: 2,
      },
    ],
  },
  {
    category: "Classic Rolls & Bakes",
    description: "Our beloved staples that you can never go wrong with.",
    items: [
      {
        id: "r1",
        category_id: "cat2",
        name: "Strawberry Cake Roll",
        description: "Fresh strawberries and light cream hugged by a delicate, pillowy sponge.",
        price: 320000,
        unit: "",
        image_url:
          "https://images.unsplash.com/photo-1724805054535-90caaeb76102?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHJhd2JlcnJ5JTIwc3dpc3MlMjByb2xsJTIwY2FrZXxlbnwxfHx8fDE3NzY1NjAyNzB8MA&ixlib=rb-4.1.0&q=80&w=1080",
        is_active: true,
        sort_order: 0,
      },
      {
        id: "r2",
        category_id: "cat2",
        name: "Fudgy Chocolate Brownies",
        description: "Intensely chocolatey and dense with that irresistible crinkly top.",
        price: 200000,
        unit: "",
        image_url:
          "https://images.unsplash.com/photo-1608732220898-9e419b03d71f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmdWRneSUyMGNob2NvbGF0ZSUyMGJyb3duaWVzfGVufDF8fHx8MTc3NjU2MDI3MHww&ixlib=rb-4.1.0&q=80&w=1080",
        is_active: true,
        sort_order: 1,
      },
    ],
  },
  {
    category: "Other Sweets",
    description: "Little treats for the moments when you just need a quick bite of joy.",
    items: [
      {
        id: "s1",
        category_id: "cat3",
        name: "Rose Vanilla Cupcakes",
        description: "Delicate vanilla cake crowned with our signature whipped pink frosting.",
        price: 180000,
        unit: " / half-dozen",
        image_url:
          "https://images.unsplash.com/photo-1622995706580-a332aed41cdf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwcGluayUyMGZyb3N0ZWQlMjBjdXBjYWtlc3xlbnwxfHx8fDE3NzY1NjAyNzF8MA&ixlib=rb-4.1.0&q=80&w=1080",
        is_active: true,
        sort_order: 0,
      },
      {
        id: "s2",
        category_id: "cat3",
        name: "Fresh Berry Tart",
        description: "Crisp buttery crust filled with rich custard and topped with seasonal fruits.",
        price: 350000,
        unit: "",
        image_url:
          "https://images.unsplash.com/photo-1773907889788-ed2a37755d76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGZydWl0JTIwdGFydCUyMGJha2VyeXxlbnwxfHx8fDE3NzY1NjAyNzF8MA&ixlib=rb-4.1.0&q=80&w=1080",
        is_active: true,
        sort_order: 1,
      },
      {
        id: "s3",
        category_id: "cat3",
        name: "Pastel Macarons",
        description: "Chewy almond shells with ganache fillings in a variety of delightful flavors.",
        price: 220000,
        unit: " / box",
        image_url:
          "https://images.unsplash.com/photo-1652555286866-1bef20014bc0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXN0ZWwlMjBmcmVuY2glMjBtYWNhcm9uc3xlbnwxfHx8fDE3NzY1NjAyNzF8MA&ixlib=rb-4.1.0&q=80&w=1080",
        is_active: true,
        sort_order: 2,
      },
    ],
  },
];

interface SidebarCategory {
  id: string;
  name: string;
  description?: string;
}

export default function StorefrontMenuPage() {
  const [menuData, setMenuData] = useState<ProductsByCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { items, addToCart, updateQuantity } = useCart();

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        const apiUrl = API_BASE;
        const res = await fetch(`${apiUrl}/products`);
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        setMenuData(data || []);
      } catch (err) {
        console.error("Failed to load products, using fallback menu data:", err);
        setMenuData(fallbackMenuItems);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  // 1. Extract distinct categories from menuData
  const categories: SidebarCategory[] = menuData.map((section) => ({
    id: section.category_id || section.category, // fallback if ID is not available
    name: section.category,
    description: section.description,
  }));

  // 2. Flatten all products and add category name metadata to each product
  const allProducts: (Product & { categoryName: string })[] = menuData.flatMap((section) =>
    (section.items || []).map((product) => ({
      ...product,
      categoryName: section.category,
    }))
  );

  // 3. Filter products by category and search term
  const filteredProducts = allProducts.filter((product) => {
    const matchesCategory =
      selectedCategoryId === "all" ||
      product.category_id === selectedCategoryId ||
      product.categoryName === selectedCategoryId; // fallback search by name if ID matches

    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const activeCategory = categories.find(
    (c) => c.id === selectedCategoryId || c.name === selectedCategoryId
  );

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      img: product.image_url,
      unit: product.unit,
    });
    toast.success(`Added ${product.name} to your cart!`);
  };

  return (
    <div className="pt-24 pb-24 min-h-screen bg-gray-50/50 font-sans transition-colors duration-500">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
            All Products
          </h1>
          <p className="text-gray-500 text-sm">
            Browse our selection of premium, freshly-baked chiffon cakes, bakes, and sweet desserts.
          </p>
        </div>

        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 font-medium text-sm">Loading our sweet catalog...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Left Sidebar Filter Section */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Search Box */}
              <div className="bg-white rounded-2xl border border-pink-100 p-5 shadow-xs">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Search
                </h3>
                <div className="relative">
                  <Search className="absolute inset-y-0 left-3 w-4 h-4 text-gray-400 my-auto" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm text-gray-900 bg-gray-50/50"
                  />
                </div>
              </div>

              {/* Categories Selector */}
              <div className="bg-white rounded-2xl border border-pink-100 p-5 shadow-xs">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                  Categories
                </h3>
                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={() => setSelectedCategoryId("all")}
                    className={`text-left w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      selectedCategoryId === "all"
                        ? "bg-pink-500 text-white shadow-md shadow-pink-100"
                        : "text-gray-600 hover:bg-pink-50/30 hover:text-pink-600"
                    }`}
                  >
                    All Products
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategoryId(cat.id)}
                      className={`text-left w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        selectedCategoryId === cat.id
                          ? "bg-pink-500 text-white shadow-md shadow-pink-100"
                          : "text-gray-600 hover:bg-pink-50/30 hover:text-pink-600"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Main Catalog Grid Section */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* Active Category Meta Header */}
              <div className="bg-white rounded-2xl border border-pink-100 p-6 shadow-xs">
                <h2 className="text-2xl font-bold text-gray-900 capitalize leading-snug">
                  {selectedCategoryId === "all" ? "All Bakes & Sweets" : activeCategory?.name}
                </h2>
                {selectedCategoryId !== "all" && activeCategory?.description && (
                  <p className="text-pink-500 text-xs font-medium mt-1">
                    {activeCategory.description}
                  </p>
                )}
                <p className="text-gray-400 text-xs mt-2">
                  Showing {filteredProducts.length} results
                </p>
              </div>

              {/* Products Display Grid */}
              {filteredProducts.length === 0 ? (
                <div className="bg-white rounded-3xl border border-pink-100 p-16 text-center space-y-4 shadow-xs">
                  <Info className="w-12 h-12 text-pink-300 mx-auto" />
                  <h3 className="text-lg font-bold text-gray-900">No products found</h3>
                  <p className="text-sm text-gray-500 max-w-sm mx-auto">
                    We couldn't find any cakes or treats matching your current selection. Try resetting your search or picking another category.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => {
                    const cartItem = items.find((i) => i.id === product.id);
                    const quantity = cartItem ? cartItem.quantity : 0;

                    return (
                      <div
                        key={product.id}
                        className="group bg-white rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-pink-100 flex flex-col justify-between"
                      >
                        <div className="aspect-[4/3] overflow-hidden relative">
                          <ImageWithFallback
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {/* Floating Glassmorphic Category Badge */}
                          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-[10px] font-bold text-pink-600 px-3 py-1 rounded-full border border-pink-100 shadow-sm uppercase tracking-wider">
                            {product.categoryName}
                          </span>
                        </div>
                        <div className="p-5 flex flex-col flex-1 justify-between space-y-4">
                          <div className="space-y-1">
                            <h4 className="text-lg font-bold text-gray-900 leading-snug group-hover:text-pink-500 transition-colors">
                              {product.name}
                            </h4>
                            <p className="text-gray-500 text-xs line-clamp-2">
                              {product.description}
                            </p>
                          </div>

                          <div className="space-y-3 pt-2">
                            <div className="flex justify-between items-baseline">
                              <span className="text-xs text-gray-400">Price</span>
                              <span className="text-lg font-extrabold text-pink-500 whitespace-nowrap">
                                {formatRupiah(product.price)}
                                <span className="text-xs text-gray-400 font-normal">
                                  {product.unit}
                                </span>
                              </span>
                            </div>

                            {quantity > 0 ? (
                              <div className="flex items-center justify-between bg-pink-50 border border-pink-100 rounded-xl overflow-hidden h-10">
                                <button
                                  onClick={() =>
                                    updateQuantity(product.id, quantity - 1)
                                  }
                                  className="h-full px-3.5 text-gray-500 hover:text-gray-900 hover:bg-pink-100/50 transition-colors flex items-center justify-center"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="font-bold text-gray-900 text-sm w-10 text-center">
                                  {quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    updateQuantity(product.id, quantity + 1)
                                  }
                                  className="h-full px-3.5 text-pink-600 hover:bg-pink-100/50 transition-colors flex items-center justify-center"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleAddToCart(product)}
                                className="w-full flex items-center justify-center gap-2 text-center bg-white border border-pink-200 text-pink-600 font-bold py-2.5 rounded-xl hover:bg-pink-50 hover:border-pink-300 transition-all duration-300 h-10 text-xs"
                              >
                                <ShoppingBag className="w-3.5 h-3.5" />
                                Add to Cart
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
