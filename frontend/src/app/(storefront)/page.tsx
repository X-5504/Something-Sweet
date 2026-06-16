import React from "react";
import { Hero } from "@/components/home/Hero";
import { MenuSection } from "@/components/home/MenuSection";
import type { ProductsByCategory } from "@/lib/types";

// Force dynamic so that it always fetches fresh data on load
export const dynamic = "force-dynamic";

async function getProducts(): Promise<ProductsByCategory[] | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
  try {
    const res = await fetch(`${apiUrl}/products`, {
      next: { revalidate: 0 }, // do not cache
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch products server-side:", error);
    return null;
  }
}

export default async function HomePage() {
  const initialProducts = await getProducts();

  return (
    <>
      <Hero />
      <MenuSection initialData={initialProducts || undefined} />
    </>
  );
}
