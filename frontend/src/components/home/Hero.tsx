"use client";

import React from "react";
import { ArrowRight, MessageCircle } from "lucide-react";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import Link from "next/link";

export function Hero() {
  return (
    <section
      id="about"
      className="relative bg-pink-50 pt-32 pb-32 lg:pt-32 lg:pb-32 overflow-hidden transition-colors duration-500"
    >
      {/* Decorative Blob */}
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-96 h-96 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Text Content */}
          <div className="max-w-xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
              Layers of joy, whisked to{" "}
              <span className="text-pink-500 relative inline-block">
                perfection.
                <svg
                  className="absolute w-full h-3 -bottom-1 left-0 text-pink-300 z-[-1]"
                  viewBox="0 0 100 10"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0 5 Q 50 10 100 5"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                  />
                </svg>
              </span>
            </h1>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="https://wa.me/1234567890?text=Hi!%20I'd%20like%20to%20request%20a%20custom%20order!"
                target="_blank"
                rel="noreferrer"
                className="inline-flex justify-center items-center px-8 py-3.5 border border-transparent text-lg font-medium rounded-full text-white bg-pink-500 hover:bg-pink-600 shadow-lg shadow-pink-200 hover:shadow-pink-300 transition-all transform hover:-translate-y-0.5"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Request Custom Order
              </a>
              <Link
                href="/menu"
                className="inline-flex justify-center items-center px-8 py-3.5 border-2 border-pink-200 text-lg font-medium rounded-full text-pink-600 bg-white hover:bg-pink-50 hover:border-pink-300 transition-all"
              >
                See Menu
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>

          {/* Image */}
          <div className="relative mx-auto w-full max-w-lg lg:max-w-[440px] lg:ml-auto">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-pink-200 transform rotate-2 hover:rotate-0 transition-all duration-500">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1589961755363-0ec871220050?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWF1dGlmdWwlMjBwaW5rJTIwY2FrZSUyMG1vZGVybnxlbnwxfHx8fDE3NzY1NjAyNzB8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="A beautiful pink modern cake"
                className="w-full h-auto object-cover aspect-[4/5] sm:aspect-square lg:aspect-[4/5]"
              />
              <div className="absolute inset-0 border-4 border-white/20 rounded-3xl pointer-events-none"></div>
            </div>
            {/* Decorative floaty bits */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-rose-300 rounded-full opacity-20 blur-xl"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-pink-400 rounded-full opacity-20 blur-xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
