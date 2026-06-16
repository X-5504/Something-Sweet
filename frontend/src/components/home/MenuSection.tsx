"use client";

import React from "react";
import { ShoppingBag, Plus, Minus } from "lucide-react";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { formatRupiah } from "@/lib/utils";
import type { ProductsByCategory } from "@/lib/types";

// Fallback data when API is not available
const fallbackMenuItems: ProductsByCategory[] = [
  {
    category: "Signature Chiffon Cakes",
    description:
      "Cloud-like, airy perfection in three irresistible flavors.",
    items: [
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
        sort_order: 0,
      },
      {
        id: "c2",
        category_id: "cat1",
        name: "Chocolate Chiffon",
        description:
          "Airy cocoa goodness that melts perfectly in your mouth.",
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
        description:
          "Sweet meets savory in this impossibly soft cheese-topped sponge.",
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
    description:
      "Our beloved staples that you can never go wrong with.",
    items: [
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
        sort_order: 0,
      },
      {
        id: "r2",
        category_id: "cat2",
        name: "Fudgy Chocolate Brownies",
        description:
          "Intensely chocolatey and dense with that irresistible crinkly top.",
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
    description:
      "Little treats for the moments when you just need a quick bite of joy.",
    items: [
      {
        id: "s1",
        category_id: "cat3",
        name: "Rose Vanilla Cupcakes",
        description:
          "Delicate vanilla cake crowned with our signature whipped pink frosting.",
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
        description:
          "Crisp buttery crust filled with rich custard and topped with seasonal fruits.",
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
        description:
          "Chewy almond shells with ganache fillings in a variety of delightful flavors.",
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

interface MenuSectionProps {
  initialData?: ProductsByCategory[];
}

export function MenuSection({ initialData }: MenuSectionProps) {
  const menuItems = initialData || fallbackMenuItems;
  const { items, addToCart, updateQuantity } = useCart();

  const handleAddToCart = (item: (typeof menuItems)[0]["items"][0]) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      img: item.image_url,
      unit: item.unit,
    });
    toast.success(`Added ${item.name} to your cart!`);
  };

  return (
    <section id="menu" className="py-24 bg-white transition-colors duration-500">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">
            Best Seller
          </h2>
        </div>

        <div className="space-y-24">
          {menuItems.map((section, idx) => (
            <div key={idx} className="space-y-12">
              <div className="text-center sm:text-left border-b border-pink-100 pb-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  {section.category}
                </h3>
                <p className="text-pink-500 mt-1">{section.description}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {section.items.map((item) => {
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
                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex justify-between items-start mb-2 gap-4">
                          <h4 className="text-xl font-bold text-gray-900">
                            {item.name}
                          </h4>
                          <span className="text-pink-500 font-semibold bg-white px-3 py-1 rounded-full text-sm shadow-sm whitespace-nowrap">
                            {formatRupiah(item.price)}
                            {item.unit}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-6 line-clamp-2 flex-1">
                          {item.description}
                        </p>

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
                  );
                })}
              </div>
            </div>
          ))}
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
