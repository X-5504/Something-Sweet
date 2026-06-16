"use client";

import React from "react";
import { X, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { useRouter } from "next/navigation";
import { formatRupiah } from "@/lib/utils";

export function CartSidebar() {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    totalItems,
    totalPrice,
  } = useCart();
  const router = useRouter();

  if (!isCartOpen) return null;

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    router.push("/checkout");
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Sidebar */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-[70] flex flex-col transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-pink-100 bg-white z-10">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-pink-500" />
            <h2 className="text-xl font-bold text-gray-900">Your Cart</h2>
            <span className="bg-pink-50 text-pink-600 px-2 py-0.5 rounded-full text-sm font-medium ml-2">
              {totalItems}
            </span>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto bg-gray-50/50 relative">
          <div className="p-6 h-full flex flex-col">
            {items.length === 0 ? (
              <div className="flex-grow flex flex-col items-center justify-center text-center space-y-4 my-auto">
                <div className="w-24 h-24 rounded-full bg-pink-50/50 flex items-center justify-center mb-4">
                  <ShoppingBag className="w-12 h-12 text-pink-300" />
                </div>
                <h3 className="text-xl font-medium text-gray-900">
                  Your cart is empty
                </h3>
                <p className="text-gray-500">
                  Looks like you haven't added any sweet treats yet.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-4 px-6 py-2 rounded-full bg-pink-500 text-white font-medium hover:bg-pink-600 transition-colors"
                >
                  Browse Menu
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 rounded-2xl bg-white border border-pink-100 shadow-sm"
                  >
                    <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                      <ImageWithFallback
                        src={item.img}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-gray-900 leading-tight">
                            {item.name}
                          </h4>
                          <p className="text-sm text-pink-500 font-medium mt-1">
                            {formatRupiah(item.price)}
                            {item.unit}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="p-1.5 text-gray-500 hover:text-gray-900 transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-medium text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="p-1.5 text-pink-500 hover:text-pink-700 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="font-bold text-gray-900">
                          {formatRupiah(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 bg-white border-t border-pink-100 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-10">
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatRupiah(totalPrice)}</span>
              </div>
              <p className="text-xs text-gray-400">
                * Delivery fee and preorder dates will be selected at checkout.
              </p>
              <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t border-gray-100">
                <span>Total Cart</span>
                <span>{formatRupiah(totalPrice)}</span>
              </div>
            </div>

            <button
              onClick={handleProceedToCheckout}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-white font-bold text-lg transition-all bg-pink-500 hover:bg-pink-600 shadow-lg hover:shadow-pink-200 transform hover:-translate-y-0.5"
            >
              Proceed to Checkout <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
