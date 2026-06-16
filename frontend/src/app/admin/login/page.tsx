"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Lock, User, KeyRound } from "lucide-react";
import { API_BASE } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const apiUrl = API_BASE;

    try {
      const res = await fetch(`${apiUrl}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Invalid credentials");
      }

      // Store JWT token and admin info in localStorage
      localStorage.setItem("admin_token", data.token);
      localStorage.setItem("admin_user", JSON.stringify(data.admin));

      toast.success("Login successful! Welcome back.");
      
      // Redirect to admin orders
      router.push("/admin/orders");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pink-50/10 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl border border-pink-100 p-8 shadow-sm space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-500 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Bakery Administration</h1>
          <p className="text-sm text-gray-400">
            Sign in to manage products, view preorders, and configure delivery rules.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 pl-1">
              Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                <User className="w-5 h-5" />
              </span>
              <input
                type="text"
                required
                placeholder="admin"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 focus:outline-none transition-shadow text-gray-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 pl-1">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                <KeyRound className="w-5 h-5" />
              </span>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 focus:outline-none transition-shadow text-gray-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl shadow-lg hover:shadow-pink-200 transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div className="bg-pink-50/20 border border-pink-100 p-4 rounded-xl text-center">
          <p className="text-xxs text-pink-700">
            <strong>Default Credentials:</strong> username: <code className="font-mono bg-white px-1 py-0.5 rounded border">admin</code> | password: <code className="font-mono bg-white px-1 py-0.5 rounded border">adminpassword123</code>
          </p>
        </div>

      </div>
    </div>
  );
}
