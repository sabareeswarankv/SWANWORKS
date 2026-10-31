"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import SwanLogo from "@/components/SwanLogo";
import { Lock, ArrowRight, AlertCircle, Shield } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Authentication failed");
      }

      router.push("/admin");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md p-8 rounded-3xl bg-white border border-[#E9E5FF] shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-3">
            <SwanLogo size="md" />
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7060F5] bg-[#ECE9FF] px-3 py-1 rounded-full">
            <Shield className="w-3.5 h-3.5" />
            <span>PROTECTED WORKSPACE</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#22212B]">
            Administrator Sign In
          </h1>
          <p className="text-xs text-[#777486]">
            Enter your administrative password to manage catalogue, view customer orders, and dispatch files.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#22212B] mb-2">
              Admin Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#777486] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#F9F8FF] border border-[#E9E5FF] text-sm text-[#22212B] outline-none focus:border-[#7060F5] transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-full bg-[#22212B] hover:bg-[#7060F5] text-white font-bold text-sm transition-all shadow-sm disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Enter Admin Panel</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
