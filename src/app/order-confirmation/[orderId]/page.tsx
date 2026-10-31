import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderByIdAsync, getTokensForOrder, getAllProducts } from "@/lib/db";
import {
  CheckCircle2,
  Download,
  Mail,
  ArrowRight,
  ShieldCheck,
  Clock,
  Loader2,
  HelpCircle,
} from "lucide-react";
import OrderStatusPoller from "./OrderStatusPoller";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface OrderConfirmationProps {
  params: Promise<{ orderId: string }>;
}

export default async function OrderConfirmationPage({
  params,
}: OrderConfirmationProps) {
  const { orderId } = await params;
  const order = await getOrderByIdAsync(orderId);

  if (!order) {
    notFound();
  }

  const tokens = getTokensForOrder(order.id);
  const allProducts = getAllProducts();
  const isPendingApproval = order.status === "pending_approval";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* If Pending Approval: Show Professional High-Trust Live Verifier */}
      {isPendingApproval ? (
        <>
          <OrderStatusPoller orderId={order.id} />
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-sm border border-amber-200">
              <Clock className="w-10 h-10 animate-pulse" />
            </div>
            <span className="inline-block text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-3.5 py-1 rounded-full border border-amber-200">
              VERIFYING PAYMENT
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#22212B]">
              Order #{order.orderNumber} Received
            </h1>
            <p className="text-sm text-[#777486] max-w-md mx-auto">
              Your UPI payment reference <strong>{order.utr}</strong> has been logged.
              We are confirming the bank transaction.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E9E5FF] shadow-xs space-y-6">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#F9F8FF] border border-[#E9E5FF]">
              <Loader2 className="w-6 h-6 text-[#7060F5] animate-spin shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-[#22212B] block">
                  Checking Bank Records (Direct UPI)
                </span>
                <span className="text-[#777486]">
                  This page automatically updates the instant your payment is approved.
                  Your download links will also be sent to <strong>{order.customerEmail}</strong>.
                </span>
              </div>
            </div>

            <div className="border-t border-[#F3F0FF] pt-4 space-y-3">
              <h3 className="text-sm font-bold text-[#22212B]">Items in this order:</h3>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex justify-between items-center text-xs p-3 rounded-xl bg-slate-50 border border-slate-200"
                  >
                    <span className="font-semibold text-[#22212B]">{item.productTitle}</span>
                    <span className="font-bold text-[#7060F5]">₹{item.totalPrice}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero Risk Guarantee • 100% Delivery or Full Refund</span>
              </div>
              <a
                href="mailto:helloswanworks@gmail.com"
                className="font-bold hover:underline shrink-0 ml-2"
              >
                Contact Help Desk →
              </a>
            </div>
          </div>
        </>
      ) : (
        /* Order Confirmed / Paid Status */
        <>
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <span className="inline-block text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              ORDER CONFIRMED & VERIFIED
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#22212B]">
              Thank you for your purchase!
            </h1>
            <p className="text-sm text-[#777486] max-w-md mx-auto">
              Order <strong>{order.orderNumber}</strong> has been verified. Your digital downloads are ready below.
            </p>
          </div>

          {/* Main Download Delivery Cards */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E9E5FF] shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#F3F0FF]">
              <div>
                <h2 className="text-lg font-bold text-[#22212B]">
                  Your Digital Files
                </h2>
                <p className="text-xs text-[#777486] mt-0.5">
                  Access your downloadable resources below.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#7060F5] bg-[#ECE9FF] px-3 py-1 rounded-full font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Instant Access</span>
              </div>
            </div>

            {/* List of files with download action buttons */}
            <div className="space-y-4">
              {tokens.map((tokenRecord) => {
                const product = allProducts.find(
                  (p) => p.id === tokenRecord.productId
                );

                return (
                  <div
                    key={tokenRecord.token}
                    className="p-5 rounded-2xl bg-[#F9F8FF] border border-[#E9E5FF] hover:border-[#B8A7FF] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-[#22212B]">
                        {product?.title || "Digital Asset"}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#777486]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#7060F5]" />
                          Instant Download
                        </span>
                        <span>•</span>
                        <span>Lifetime Access</span>
                      </div>
                    </div>

                    <a
                      href={`/api/download/${tokenRecord.token}`}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#7060F5] hover:bg-[#5A48E6] text-white font-bold text-xs transition-colors shadow-sm flex-shrink-0"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download File</span>
                    </a>
                  </div>
                );
              })}
            </div>

            {/* Email delivery notice */}
            <div className="p-4 rounded-2xl bg-[#ECE9FF]/60 border border-[#E9E5FF] flex items-center gap-3 text-xs text-[#5A48E6]">
              <Mail className="w-5 h-5 flex-shrink-0 text-[#7060F5]" />
              <div>
                A confirmation receipt and backup download link was dispatched to{" "}
                <strong>{order.customerEmail}</strong>.
              </div>
            </div>
          </div>
        </>
      )}

      {/* Order Details & Summary */}
      <div className="p-6 rounded-3xl bg-white border border-[#E9E5FF] shadow-xs space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#22212B]">
          Receipt & Summary
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs py-2 border-y border-[#F3F0FF]">
          <div>
            <span className="text-[#777486]">Order Reference</span>
            <p className="font-bold text-[#22212B] mt-1">{order.orderNumber}</p>
          </div>
          <div>
            <span className="text-[#777486]">Status</span>
            <p className={`font-bold mt-1 capitalize ${isPendingApproval ? "text-amber-600" : "text-emerald-600"}`}>
              {isPendingApproval ? "Pending Verification" : "Paid & Verified"}
            </p>
          </div>
          <div>
            <span className="text-[#777486]">Total Amount</span>
            <p className="font-bold text-[#22212B] mt-1">₹{order.subtotal}</p>
          </div>
          <div>
            <span className="text-[#777486]">Payment Method</span>
            <p className="font-bold text-[#22212B] mt-1">
              Direct UPI ({order.utr ? `UTR: ${order.utr.slice(0, 6)}...` : "UPI"})
            </p>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between text-xs text-[#777486]">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Standard Commercial License Included
          </span>

          <Link
            href="/shop"
            className="inline-flex items-center gap-1 text-[#7060F5] hover:underline font-bold"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
