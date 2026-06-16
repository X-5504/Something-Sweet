"use client";

import React from "react";
import { ShoppingBag, Plus, Minus, ArrowRight } from "lucide-react";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { formatRupiah } from "@/lib/utils";
import type { Product } from "@/lib/types";
import Link from "next/link";

// Fallback data when API is not available
const fallbackBestSellers: Product[] = [
  {
    id: "c1",
    category_id: "cat1",
    name: "Pandan Chiffon",
    description:
      "Infused with real pandan leaves for an aromatic, lightly sweet bite.",
    price: 240000,
    unit: "",
    image_url:
      "https://images.unsplash.com/photo-1759324351433-c5a1063f8ac6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlbiUyMHNwb25nZSUyMGNha2UlMjBzbGljZXxlbnwxfHx8fDE3NzY1NjAyNzB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    is_active: true,
    is_best_seller: true,
    sort_order: 0,
  },
  {
    id: "r1",
    category_id: "cat2",
    name: "Strawberry Cake Roll",
    description:
      "Fresh strawberries and light cream hugged by a delicate, pillowy sponge.",
    price: 320000,
    unit: "",
    image_url:
      "https://images.unsplash.com/photo-1724805054535-90caaeb76102?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHJhd2JlcnJ5JTIwc3dpc3MlMjByb2xsJTIwY2FrZXxlbnwxfHx8fDE3NzY1NjAyNzB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    is_active: true,
    is_best_seller: true,
    sort_order: 0,
  },
  {
    id: "s3",
    category_id: "cat3",
    name: "Pastel Macarons",
    description:
      "Chewy almond shells with ganache fillings in a variety of delightful flavors.",
    price: 220000,
    unit: " / box",
    image_url:
      "https://images.unsplash.com/photo-1652555286866-1bef20014bc0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXN0ZWwlMjBmcmVuY2glMjBtYWNhcm9uc3xlbnwxfHx8fDE3NzY1NjAyNzF8MA&ixlib=rb-4.1.0&q=80&w=1080",
    is_active: true,
    is_best_seller: true,
    sort_order: 2,
  },
];

interface BestSellersSectionProps {
  initialData?: Product[];
}

export function BestSellersSection({ initialData }: BestSellersSectionProps) {
  const [products, setProducts] = React.useState<Product[]>(initialData || []);
  const [loading, setLoading] = React.useState(!initialData);

  React.useEffect(() => {
    if (initialData && initialData.length > 0) {
      setProducts(initialData);
      setLoading(false);
      return;
    }

    const fetchBestSellers = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
        const res = await fetch(`${apiUrl}/products/best-sellers`);
        if (!res.ok) throw new Error("Failed to fetch best sellers");
        const data = await res.json();
        setProducts(data || []);
      } catch (err) {
        console.error("Client-side best sellers fetch failed, using fallback:", err);
        setProducts(fallbackBestSellers);
      } finally {
        setLoading(false);
      }
    };

    fetchBestSellers();
  }, [initialData]);

  const { items, addToCart, updateQuantity } = useCart();

  const handleAddToCart = (item: Product) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      img: item.image_url,
      unit: item.unit,
    });
    toast.success(`Added ${item.name} to your cart!`);
  };

  if (loading) {
    return (
      <section id="best-sellers" className="py-24 bg-white transition-colors duration-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-64 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 font-medium text-sm">Loading best sellers...</p>
          </div>
        </div>
      </section>
    );
  }

  // If there are no best sellers in the database and fallback fails, show an informative card
  if (products.length === 0) {
    return (
      <section id="best-sellers" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Best Sellers</h2>
          <p className="text-gray-500 max-w-md mx-auto mb-8">
            We are updating our list of best-selling cakes. Explore our full menu to check out our delicious bakes!
          </p>
          <Link
            href="/menu"
            className="inline-flex justify-center items-center px-8 py-3 rounded-full text-white font-medium bg-pink-500 hover:bg-pink-600 shadow-md transition-colors"
          >
            Explore Full Menu
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section id="best-sellers" className="py-24 bg-white transition-colors duration-500">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">
            Best Sellers
          </h2>
          <p className="text-gray-500">
            Our most popular, freshly-baked treats, loved by everyone.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {products.map((item) => {
            const cartItem = items.find((i) => i.id === item.id);
            const quantity = cartItem ? cartItem.quantity : 0;

            return (
              <div
                key={item.id}
                className="group bg-pink-50/50 rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-transparent hover:border-pink-100 hover:-translate-y-1 flex flex-col"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <ImageWithFallback
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6 flex flex-col flex-1 justify-between">
                  <div className="space-y-2">
                    <h4 className="text-xl font-bold text-gray-900 leading-snug">
                      {item.name}
                    </h4>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  <div className="space-y-3 pt-4">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-gray-400">Price</span>
                      <span className="text-lg font-extrabold text-pink-500 whitespace-nowrap">
                        {formatRupiah(item.price)}
                        <span className="text-xs text-gray-400 font-normal">
                          {item.unit}
                        </span>
                      </span>
                    </div>

                    {quantity > 0 ? (
                      <div className="flex items-center justify-between bg-white border-2 border-pink-100 rounded-xl overflow-hidden h-12">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, quantity - 1)
                          }
                          className="h-full px-4 text-gray-500 hover:text-gray-900 hover:bg-pink-50 transition-colors flex items-center justify-center"
                        >
                          <Minus className="w-5 h-5" />
                        </button>
                        <span className="font-bold text-gray-900 w-12 text-center">
                          {quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, quantity + 1)
                          }
                          className="h-full px-4 text-pink-500 hover:bg-pink-50 transition-colors flex items-center justify-center"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="w-full flex items-center justify-center gap-2 text-center bg-white border-2 border-pink-100 text-pink-600 font-bold py-3 rounded-xl hover:bg-pink-50 hover:border-pink-200 transition-colors duration-300 h-12"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Explore Full Menu Button */}
        <div className="text-center">
          <Link
            href="/menu"
            className="inline-flex justify-center items-center px-10 py-4 border border-transparent text-lg font-bold rounded-full text-white bg-pink-500 hover:bg-pink-600 shadow-lg shadow-pink-100 hover:shadow-pink-200 transition-all transform hover:-translate-y-0.5"
          >
            Explore Full Menu
            <ArrowRight className="w-5 h-5 ml-2 animate-bounce-horizontal" />
          </Link>
        </div>

        <div className="mt-24 p-8 rounded-3xl bg-pink-50/50 border border-pink-200 text-center max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Looking for something special?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            We do custom cakes for weddings, birthdays, and special events!
            Let&apos;s chat about your dream cake.
          </p>
          <a
            href="https://wa.me/1234567890?text=Hi!%20I'd%20like%20to%20request%20a%20custom%20order!"
            target="_blank"
            rel="noreferrer"
            className="inline-flex justify-center items-center px-8 py-3 rounded-full text-white font-medium bg-pink-500 hover:bg-pink-600 shadow-md transition-colors"
          >
            Request Custom Order
          </a>
        </div>
      </div>
    </section>
  );
}
