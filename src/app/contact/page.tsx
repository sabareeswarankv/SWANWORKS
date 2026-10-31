"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, orderNumber, message }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitted(true);
      } else {
        setErrorMsg(data.error || "Failed to send message. Please try again.");
      }
    } catch {
      setErrorMsg("Network error. Please email helloswanworks@gmail.com directly.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#777486] hover:text-[#7060F5] transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Store</span>
        </Link>
        <span className="text-xs font-bold uppercase tracking-wider text-[#7060F5] bg-[#ECE9FF] px-3 py-1 rounded-full">
          CUSTOMER SUPPORT
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#22212B] mt-3">
          Contact & Help Desk
        </h1>
        <p className="text-sm text-[#777486] mt-1">
          Have a question about a template or need assistance with your downloads? We are here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-[#E9E5FF] shadow-xs space-y-2">
          <Mail className="w-5 h-5 text-[#7060F5]" />
          <h3 className="text-sm font-bold text-[#22212B]">Email Help Desk</h3>
          <a
            href="mailto:helloswanworks@gmail.com"
            className="text-xs text-[#7060F5] font-bold hover:underline block break-all"
          >
            helloswanworks@gmail.com
          </a>
          <span className="text-[11px] text-emerald-600 block font-medium">Responses within 24 hours</span>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-[#E9E5FF] shadow-xs space-y-2">
          <div className="text-sm font-bold text-[#22212B]">Self-Service Retrieval</div>
          <p className="text-xs text-[#777486]">Lost your links? Retrieve past orders with your email.</p>
          <Link
            href="/retrieve-order"
            className="text-xs text-[#7060F5] font-bold hover:underline block"
          >
            Access Past Orders →
          </Link>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-[#E9E5FF] shadow-xs space-y-2">
          <div className="text-sm font-bold text-[#22212B]">Refund Requests</div>
          <p className="text-xs text-[#777486]">Review conditions and instructions for assistance.</p>
          <Link
            href="/legal/refund-policy"
            className="text-xs text-[#7060F5] font-bold hover:underline block"
          >
            Refund Policy →
          </Link>
        </div>
      </div>

      <div className="p-8 sm:p-10 rounded-3xl bg-white border border-[#E9E5FF] shadow-xs">
        {submitted ? (
          <div className="text-center py-8 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="text-xl font-bold text-[#22212B]">
              Message Received
            </h3>
            <p className="text-sm text-[#777486] max-w-sm mx-auto">
              Thank you for reaching out, {name || "there"}. A team member will follow up at {email} within one business day.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <h2 className="text-lg font-bold text-[#22212B] mb-4">
              Send us a Message
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-[#22212B] mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F9F8FF] border border-[#E9E5FF] outline-none focus:border-[#7060F5]"
                />
              </div>
              <div>
                <label className="block font-bold text-[#22212B] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="alex@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F9F8FF] border border-[#E9E5FF] outline-none focus:border-[#7060F5]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#22212B] mb-1">
                Order Number (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. SW-2026-4821"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F9F8FF] border border-[#E9E5FF] outline-none focus:border-[#7060F5]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#22212B] mb-1">
                Your Message
              </label>
              <textarea
                required
                rows={4}
                placeholder="How can we assist you with SWANWORKS resources?..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F9F8FF] border border-[#E9E5FF] outline-none focus:border-[#7060F5]"
              />
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 text-red-600 border border-red-200 font-medium">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full bg-[#7060F5] hover:bg-[#5A48E6] text-white font-bold text-xs transition-colors shadow-sm cursor-pointer disabled:opacity-60"
            >
              {loading ? "Sending Message..." : "Send Support Message"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
