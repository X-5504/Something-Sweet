import React from "react";
import { Hero } from "@/components/home/Hero";
import { BestSellersSection } from "@/components/home/BestSellersSection";
import { API_BASE } from "@/lib/api";
import type { Product } from "@/lib/types";

// Force dynamic so that it always fetches fresh data on load
export const dynamic = "force-dynamic";

async function getBestSellers(): Promise<Product[] | null> {
  try {
    const res = await fetch(`${API_BASE}/products/best-sellers`, {
      next: { revalidate: 0 }, // do not cache
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch best sellers server-side:", error);
    return null;
  }
}

export default async function HomePage() {
  const initialBestSellers = await getBestSellers();

  return (
    <>
      <Hero />
      <BestSellersSection initialData={initialBestSellers || undefined} />
    </>
  );
}
