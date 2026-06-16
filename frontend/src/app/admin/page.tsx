"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect /admin directly to /admin/orders
    router.replace("/admin/orders");
  }, [router]);

  return (
    <div className="min-h-screen bg-pink-50/10 flex items-center justify-center font-sans">
      <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
