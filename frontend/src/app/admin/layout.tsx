"use client";

import React, { useEffect, useState } from "react";
import { API_BASE } from "@/lib/api";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { LayoutDashboard, ShoppingBag, Settings, LogOut, Loader2, Cake, FolderKanban } from "lucide-react";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [adminUser, setAdminUser] = useState<{ username: string } | null>(null);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setCheckingAuth(false);
      return;
    }

    const token = localStorage.getItem("admin_token");
    if (!token) {
      toast.error("Please sign in to access the admin dashboard.");
      router.push("/admin/login");
      return;
    }

    // Verify token by calling backend me endpoint
    const apiUrl = API_BASE;
    fetch(`${apiUrl}/admin/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Session expired");
        return res.json();
      })
      .then((data) => {
        setAdminUser(data);
        setCheckingAuth(false);
      })
      .catch((err) => {
        console.error(err);
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
        toast.error("Session expired. Please sign in again.");
        router.push("/admin/login");
      });
  }, [pathname, isLoginPage, router]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    toast.success("Signed out successfully.");
    router.push("/admin/login");
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-pink-50/10 flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-pink-500 animate-spin mx-auto" />
          <p className="text-pink-600 font-medium">Verifying administrator session...</p>
        </div>
      </div>
    );
  }

  // If it is the login page, render it directly without sidebars
  if (isLoginPage) {
    return <>{children}</>;
  }

  const navItems = [
    { name: "Orders", path: "/admin/orders", icon: LayoutDashboard },
    { name: "Products", path: "/admin/products", icon: Cake },
    { name: "Categories", path: "/admin/categories", icon: FolderKanban },
    { name: "Settings", path: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-pink-100 flex flex-col justify-between hidden md:flex">
        <div className="p-6">
          <Link href="/" className="text-2xl font-black text-pink-500 tracking-tighter lowercase flex items-center gap-2">
            <Cake className="w-6 h-6 text-pink-500" />
            something sweet
          </Link>
          
          <div className="mt-8 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-pink-500 text-white shadow-md shadow-pink-100"
                      : "text-gray-600 hover:bg-pink-50/30 hover:text-pink-600"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Footer Sidebar */}
        <div className="p-6 border-t border-gray-100 space-y-4">
          <div className="text-xs text-gray-400">
            Logged in as <span className="font-bold text-gray-700">{adminUser?.username}</span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50/50 transition-all text-left"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-x-hidden">
        {/* Mobile Header Nav */}
        <header className="bg-white border-b border-pink-100 px-6 py-4 flex md:hidden justify-between items-center z-20">
          <span className="text-xl font-black text-pink-500 tracking-tighter lowercase">
            something sweet admin
          </span>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    href={item.path}
                    title={item.name}
                    className={`p-2 rounded-lg ${
                      isActive ? "bg-pink-500 text-white" : "text-gray-500 hover:bg-pink-50/30"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </Link>
                );
              })}
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Main Content Pane */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
