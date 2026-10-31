"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Download,
  Mail,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  FileCheck,
  Clock,
  PackageCheck,
} from "lucide-react";

interface RetrievedToken {
  token: string;
  productTitle: string;
  expiresAt: string;
  remainingDownloads: number;
}

interface RetrievedOrder {
  orderId: string;
  orderNumber: string;
  paidAt: string;
  subtotal: number;
  tokens: RetrievedToken[];
}

export default function RetrieveOrderPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<RetrievedOrder[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOrders(null);
    setLoading(true);

    try {
      const res = await fetch("/api/orders/retrieve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Could not find orders.");
      }

      setOrders(data.orders);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to retrieve orders.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      {/* Back navigation */}
      <div className="flex items-center gap-3 text-xs">
        <Link
          href="/contact"
          className="inline-flex items-center gap-1.5 font-bold text-[#7060F5] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Help Desk</span>
        </Link>
        <span className="text-[#E9E5FF]">|</span>
        <Link
          href="/"
          className="font-medium text-[#777486] hover:text-[#22212B] transition-colors"
        >
          Store Home
        </Link>
      </div>

      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-[#ECE9FF] text-[#7060F5] flex items-center justify-center mx-auto mb-2">
          <Download className="w-8 h-8" />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#7060F5] bg-[#ECE9FF] px-3 py-1 rounded-full">
          MY PURCHASES
        </span>
        <h1 className="text-3xl font-extrabold text-[#22212B]">
          Find Your Past Purchases
        </h1>
        <p className="text-sm text-[#777486] max-w-md mx-auto">
          Enter the email address you used at checkout to access your digital downloads anytime.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E9E5FF] shadow-xs space-y-5"
      >
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#22212B] mb-2">
            Your Checkout Email Address
          </label>
          <div className="relative">
            <Mail className="w-5 h-5 text-[#777486] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#F9F8FF] border border-[#E9E5FF] text-sm text-[#22212B] outline-none focus:border-[#7060F5] transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-full bg-[#22212B] hover:bg-[#7060F5] text-white font-bold text-sm transition-all shadow-sm disabled:opacity-60 cursor-pointer"
        >
          {loading ? (
            <span>Locating purchases...</span>
          ) : (
            <>
              <span>Find My Orders</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Retrieved Orders Display */}
      {orders && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <h2 className="text-lg font-bold text-[#22212B] flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-[#7060F5]" />
            <span>Found {orders.length} Verified Order(s)</span>
          </h2>

          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.orderId}
                className="p-6 rounded-3xl bg-white border border-[#E9E5FF] shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[#F3F0FF] text-xs">
                  <div>
                    <span className="font-bold text-[#22212B]">
                      {order.orderNumber}
                    </span>
                    <span className="text-[#777486] ml-2">
                      (Total: ₹{order.subtotal})
                    </span>
                  </div>
                  <span className="font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Paid
                  </span>
                </div>

                <div className="space-y-3">
                  {order.tokens.map((t) => (
                    <div
                      key={t.token}
                      className="p-4 rounded-2xl bg-[#F9F8FF] border border-[#E9E5FF] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <h4 className="text-sm font-bold text-[#22212B]">
                          {t.productTitle}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[11px] text-[#777486] mt-1">
                          <Clock className="w-3.5 h-3.5 text-[#7060F5]" />
                          <span>Instant Download • Lifetime Access</span>
                        </div>
                      </div>

                      <a
                        href={`/api/download/${t.token}`}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#7060F5] hover:bg-[#5A48E6] text-white text-xs font-bold transition-colors shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Files</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
