"use client";

import React from "react";
import { Menu as MenuIcon, X, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { totalItems, setIsCartOpen } = useCart();

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-40 border-b border-pink-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link
              href="/"
              className="text-2xl font-bold text-pink-500 tracking-tighter lowercase"
            >
              something sweet
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/#about"
              className="text-gray-600 hover:text-pink-500 font-medium transition-colors"
            >
              About
            </Link>
            <Link
              href="/menu"
              className="text-gray-600 hover:text-pink-500 font-medium transition-colors"
            >
              Menu
            </Link>
            <Link
              href="/track"
              className="text-gray-600 hover:text-pink-500 font-medium transition-colors"
            >
              Track Order
            </Link>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-gray-600 hover:text-pink-500 transition-colors"
            >
              <ShoppingBag className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 bg-pink-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
                  {totalItems}
                </span>
              )}
            </button>
          </nav>

          {/* Mobile buttons */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 mr-2 text-gray-600 hover:text-pink-500"
            >
              <ShoppingBag className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 bg-pink-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {totalItems}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-pink-500 focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <MenuIcon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-pink-100 px-4 pt-2 pb-4 space-y-1 shadow-lg">
          <Link
            href="/#about"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-pink-500 hover:bg-pink-50"
            onClick={() => setIsMenuOpen(false)}
          >
            About
          </Link>
          <Link
            href="/menu"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-pink-500 hover:bg-pink-50"
            onClick={() => setIsMenuOpen(false)}
          >
            Menu
          </Link>
          <Link
            href="/track"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-pink-500 hover:bg-pink-50"
            onClick={() => setIsMenuOpen(false)}
          >
            Track Order
          </Link>
        </div>
      )}
    </header>
  );
}
