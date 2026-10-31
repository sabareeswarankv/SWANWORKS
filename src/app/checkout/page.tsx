"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  ShoppingBag,
  AlertCircle,
  CheckCircle,
  Tag,
  Check,
  QrCode,
  Smartphone,
  Copy,
  ExternalLink,
  ChevronLeft,
} from "lucide-react";

interface PendingUpiOrder {
  orderId: string;
  orderNumber: string;
  subtotal: number;
  paymentOrderId: string;
  testSignature: string;
  upi: {
    vpa: string;
    name: string;
    amount: number;
    note: string;
  };
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart, removeFromCart } = useCart();

  const [email, setEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Discount Coupon State
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
    finalTotal: number;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  // Direct UPI Payment Modal State
  const [pendingUpi, setPendingUpi] = useState<PendingUpiOrder | null>(null);
  const [utrNumber, setUtrNumber] = useState("");
  const [isVerifyingUtr, setIsVerifyingUtr] = useState(false);
  const [utrError, setUtrError] = useState<string | null>(null);
  const [hasClickedUpiIntent, setHasClickedUpiIntent] = useState(false);

  const finalPayableTotal = appliedCoupon ? appliedCoupon.finalTotal : subtotal;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    const code = couponCode.trim();
    if (!code) return;

    setIsValidatingCoupon(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        throw new Error(data.error || "Invalid coupon code");
      }
      setAppliedCoupon({
        code: data.coupon.code,
        discount: data.discount,
        finalTotal: data.finalTotal,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to apply coupon";
      setCouponError(msg);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address to receive your files.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Create order on the server
      const createRes = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerEmail: email.trim(),
          customerName: customerName.trim() || undefined,
          couponCode: appliedCoupon?.code,
          items: items.map((i) => ({
            productId: i.product.id,
            quantity: i.quantity,
          })),
        }),
      });

      const createData = await createRes.json();

      if (!createRes.ok || !createData.success) {
        if (createData.error && createData.error.includes("unavailable or unlisted")) {
          const matchedId = createData.error.match(/'([^']+)'/)?.[1];
          if (matchedId) {
            removeFromCart(matchedId);
            throw new Error(`Removed unlisted item (${matchedId}) from your cart. Please click Complete Purchase again.`);
          }
        }
        throw new Error(createData.error || "Failed to initialize order.");
      }

      // 2. Process PayU Live Gateway (if configured)
      if (createData.provider === "payu" && createData.payu) {
        clearCart();
        const form = document.createElement("form");
        form.method = "POST";
        form.action = createData.payu.actionUrl;

        Object.entries(createData.payu.params).forEach(([k, v]) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = k;
          input.value = String(v);
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
        return;
      }

      // 3. Direct UPI Payment Screen
      if (createData.provider === "upi_direct" && createData.upi) {
        setPendingUpi({
          orderId: createData.orderId,
          orderNumber: createData.orderNumber,
          subtotal: createData.subtotal,
          paymentOrderId: createData.paymentOrderId,
          testSignature: createData.testSignature,
          upi: createData.upi,
        });
        setIsLoading(false);
        return;
      }

      // 4. Default fallback instant verification
      const verifyRes = await fetch("/api/checkout/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: createData.orderId,
          paymentId: `pay_test_${Date.now()}`,
          paymentOrderId: createData.paymentOrderId,
          signature: createData.testSignature,
          provider: "test_mode",
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.success) {
        throw new Error(verifyData.error || "Payment verification failed.");
      }

      clearCart();
      router.push(`/order-confirmation/${createData.orderId}`);
    } catch (err: unknown) {
      console.error("Checkout submission failed:", err);
      const msg = err instanceof Error ? err.message : "An error occurred during checkout.";
      setErrorMessage(msg);
      setIsLoading(false);
    }
  };

  // Handle 1-Click "I Have Paid" Confirmation
  const handleConfirmPaid = async () => {
    if (!pendingUpi) return;
    setIsVerifyingUtr(true);
    setUtrError(null);

    try {
      const verifyRes = await fetch("/api/checkout/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: pendingUpi.orderId,
          paymentId: `upi_${Date.now()}`,
          paymentOrderId: pendingUpi.paymentOrderId,
          signature: pendingUpi.testSignature,
          provider: "upi_direct",
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.success) {
        throw new Error(verifyData.error || "Failed to confirm payment.");
      }

      clearCart();
      router.push(`/order-confirmation/${pendingUpi.orderId}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to record payment.";
      setUtrError(msg);
      setIsVerifyingUtr(false);
    }
  };

  if (items.length === 0 && !pendingUpi) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#ECE9FF] text-[#7060F5] flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#22212B]">
          Your Cart is Empty
        </h1>
        <p className="text-sm text-[#777486] mt-2 mb-6">
          Add a template, planner, or code kit to start checkout.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#7060F5] text-white font-bold text-sm hover:bg-[#5A48E6] transition-colors"
        >
          <span>Browse Catalogue</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  // Direct UPI Payment Screen View
  if (pendingUpi) {
    const upiLink = `upi://pay?pa=${encodeURIComponent(pendingUpi.upi.vpa)}&pn=${encodeURIComponent(pendingUpi.upi.name)}&am=${encodeURIComponent(pendingUpi.upi.amount.toFixed(2))}&cu=INR&tn=${encodeURIComponent(pendingUpi.upi.note)}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(upiLink)}`;

    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-28 md:pb-12">
        <div className="mb-6">
          <button
            onClick={() => setPendingUpi(null)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#777486] hover:text-[#7060F5] transition-colors cursor-pointer mb-3"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Order Details</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              DIRECT UPI PAYMENT
            </span>
            <span className="text-xs text-[#777486]">
              Order #{pendingUpi.orderNumber}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#22212B] mt-2">
            Pay ₹{pendingUpi.subtotal} via UPI
          </h1>
          <p className="text-sm text-[#777486] mt-1">
            Tap below to open your UPI app, then confirm to unlock your digital files.
          </p>
        </div>

        {utrError && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{utrError}</span>
          </div>
        )}

        {/* ============================================================ */}
        {/* MOBILE-FIRST FAST ACTION CARD (NO SCROLLING NEEDED ON PHONE) */}
        {/* ============================================================ */}
        <div className="block md:hidden mb-6 p-5 rounded-3xl bg-white border border-[#E9E5FF] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F3F0FF]">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#7060F5] bg-[#ECE9FF] px-2.5 py-0.5 rounded-full">
                2-Step Mobile Checkout
              </span>
              <h3 className="text-base font-bold text-[#22212B] mt-1.5">
                Pay & Unlock Instantly
              </h3>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#777486] block">Payable Total</span>
              <span className="text-base font-extrabold text-[#7060F5]">₹{pendingUpi.subtotal}</span>
            </div>
          </div>

          <div className="space-y-3">
            {/* Step 1 Button */}
            <div>
              <span className="text-[11px] font-bold text-[#777486] uppercase tracking-wider block mb-1.5">
                Step 1: Complete Transfer
              </span>
              <a
                href={upiLink}
                onClick={() => setHasClickedUpiIntent(true)}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-[#7060F5] hover:bg-[#5A48E6] text-white font-bold text-xs sm:text-sm shadow-sm transition-all"
              >
                <Smartphone className="w-4 h-4" />
                <span>Tap to Pay in GPay / PhonePe / Paytm</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>
              <span className="text-[10px] text-[#777486] block text-center mt-1">
                Supports GPay • PhonePe • Paytm • CRED • BHIM
              </span>
            </div>

            {/* Step 2 Button (Placed right below Step 1 on mobile!) */}
            <div className={`pt-2 transition-all ${hasClickedUpiIntent ? "p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200" : ""}`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-[11px] font-bold uppercase tracking-wider block ${hasClickedUpiIntent ? "text-emerald-800" : "text-[#777486]"}`}>
                  Step 2: After Paying in App
                </span>
                {hasClickedUpiIntent && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full animate-pulse">
                    Returned from app? Tap below!
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleConfirmPaid}
                disabled={isVerifyingUtr}
                className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-extrabold text-xs sm:text-sm transition-all shadow-md cursor-pointer ${
                  hasClickedUpiIntent
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-300"
                    : "bg-[#22212B] hover:bg-black text-white"
                }`}
              >
                {isVerifyingUtr ? (
                  <span>Checking your payment...</span>
                ) : (
                  <>
                    <span>I Have Completed Payment</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-[#F3F0FF] flex items-center justify-between text-[11px] text-[#777486]">
            <span className="flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              100% Secure UPI Transfer
            </span>
            <span>Files emailed to {email}</span>
          </div>
        </div>

        {/* ============================================================ */}
        {/* DESKTOP 2-COLUMN VIEW & OPTIONAL QR SECTION FOR MOBILE       */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Left: QR Code & Mobile Deep Link */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E9E5FF] shadow-xs text-center space-y-4">
            <div className="text-left md:text-center">
              <span className="text-xs font-bold text-[#22212B] block">
                Scan with any UPI App:
              </span>
              <p className="text-[11px] text-[#777486] mt-0.5">
                Point your phone camera, GPay, or PhonePe scanner at the code
              </p>
            </div>

            <div className="relative inline-block p-3 rounded-2xl bg-[#F9F8FF] border border-[#E9E5FF]">
              <img
                src={qrCodeUrl}
                alt="UPI Payment QR Code"
                width={220}
                height={220}
                className="rounded-xl mx-auto"
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-2 bg-white rounded-xl shadow-md border border-[#E9E5FF]">
                <QrCode className="w-5 h-5 text-[#7060F5]" />
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-[#777486] block">Accepted Apps:</span>
              <p className="text-xs font-semibold text-[#22212B]">
                GPay • PhonePe • Paytm • BHIM • CRED
              </p>
            </div>

            {/* Desktop Intent button */}
            <div className="pt-2 hidden md:block">
              <a
                href={upiLink}
                onClick={() => setHasClickedUpiIntent(true)}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-full bg-[#7060F5] hover:bg-[#5A48E6] text-white font-bold text-xs sm:text-sm transition-all shadow-sm"
              >
                <Smartphone className="w-4 h-4" />
                <span>Open in UPI App to Pay</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>
            </div>

            {/* Safe Direct Payment notice */}
            <div className="pt-2 border-t border-[#F3F0FF] flex items-center justify-center text-xs bg-[#F9F8FF] p-2.5 rounded-xl text-[#777486]">
              <div className="flex items-center gap-1.5 font-medium text-[11px]">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Direct Transfer via SBI Secure UPI</span>
              </div>
            </div>
          </div>

          {/* Right: Desktop Confirmation Card */}
          <div className="hidden md:block p-6 sm:p-8 rounded-3xl bg-white border border-[#E9E5FF] shadow-xs space-y-6">
            <div className="border-b border-[#F3F0FF] pb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#7060F5] bg-[#ECE9FF] px-2.5 py-0.5 rounded-full">
                Step 2 of 2
              </span>
              <h3 className="text-lg font-bold text-[#22212B] mt-2">
                Confirm & Access Downloads
              </h3>
              <p className="text-xs text-[#777486] mt-1 leading-relaxed">
                Once you complete the transfer on GPay, PhonePe, or Paytm, simply click the button below. Zero typing required.
              </p>
            </div>

            <div className="space-y-4">
              <button
                type="button"
                onClick={handleConfirmPaid}
                disabled={isVerifyingUtr}
                className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-full bg-[#7060F5] hover:bg-[#5A48E6] text-white font-extrabold text-sm transition-all shadow-md group disabled:opacity-60 cursor-pointer"
              >
                {isVerifyingUtr ? (
                  <span>Checking your payment...</span>
                ) : (
                  <>
                    <span>I Have Completed Payment</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <div className="p-4 rounded-2xl bg-[#F9F8FF] border border-[#E9E5FF] text-xs text-[#777486] space-y-2">
                <div className="flex items-center gap-2 font-bold text-[#22212B]">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>How it works:</span>
                </div>
                <ul className="space-y-1 text-[11px] list-disc list-inside">
                  <li>Clicking confirms your payment request.</li>
                  <li>Our team verifies the bank credit and releases your files.</li>
                  <li>Download links are also sent straight to <strong>{email}</strong>.</li>
                </ul>
              </div>
            </div>

            <div className="pt-2 text-center border-t border-[#F3F0FF]">
              <span className="text-[11px] text-[#777486]">
                Need help? Contact support at{" "}
                <a
                  href="mailto:helloswanworks@gmail.com"
                  className="text-[#7060F5] font-semibold hover:underline"
                >
                  helloswanworks@gmail.com
                </a>
              </span>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* MOBILE STICKY FLOATING BOTTOM BAR (ALWAYS ACCESSIBLE 1-TAP)  */}
        {/* ============================================================ */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 p-3.5 bg-white/95 backdrop-blur-md border-t border-[#E9E5FF] shadow-2xl z-50 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-xs font-bold text-[#22212B] block truncate">
              {hasClickedUpiIntent ? "Paid in your UPI app?" : "Paid via GPay/PhonePe?"}
            </span>
            <span className="text-[10px] text-[#777486] block">
              Tap to confirm & get your files
            </span>
          </div>
          <button
            type="button"
            onClick={handleConfirmPaid}
            disabled={isVerifyingUtr}
            className={`shrink-0 px-5 py-2.5 rounded-full text-xs font-bold shadow-md transition-all flex items-center gap-1.5 ${
              hasClickedUpiIntent
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-[#7060F5] hover:bg-[#5A48E6] text-white"
            }`}
          >
            {isVerifyingUtr ? (
              <span>Checking...</span>
            ) : (
              <>
                <span>I Have Paid</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Default Customer Form View
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-[#7060F5] bg-[#ECE9FF] px-3 py-1 rounded-full">
          SECURE CHECKOUT
        </span>
        <h1 className="text-3xl font-extrabold text-[#22212B] mt-2">
          Complete Your Order
        </h1>
        <p className="text-sm text-[#777486] mt-1">
          Review your items and provide your delivery email for digital files.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Customer Form & Payment Mode */}
        <div className="lg:col-span-7 space-y-6">
          <form
            onSubmit={handleCheckoutSubmit}
            className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E9E5FF] shadow-xs space-y-6"
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#F3F0FF]">
              <h2 className="text-lg font-bold text-[#22212B]">
                Customer Information
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                <Lock className="w-3.5 h-3.5" />
                <span>SSL Encrypted</span>
              </div>
            </div>

            {errorMessage && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#22212B] mb-1.5">
                  Your Full Name
                </label>
                <input
                  type="text"
                  placeholder="Alex Rivera"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-[#F9F8FF] border border-[#E9E5FF] text-sm text-[#22212B] outline-none focus:border-[#7060F5] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#22212B] mb-1.5">
                  Delivery Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="alex@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-[#F9F8FF] border border-[#E9E5FF] text-sm text-[#22212B] outline-none focus:border-[#7060F5] transition-colors"
                />
                <p className="text-[11px] text-[#777486] mt-1">
                  Your download files and purchase receipt will be delivered instantly to this email.
                </p>
              </div>
            </div>

            {/* Payment Method Banner */}
            <div className="p-4 rounded-2xl bg-[#F9F8FF] border border-[#E9E5FF] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#ECE9FF] text-[#7060F5] flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#22212B] block">Direct UPI Payment</span>
                  <span className="text-[11px] text-[#777486]">GPay, PhonePe, Paytm, BHIM & NetBanking</span>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                Zero Fees
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-full bg-[#22212B] hover:bg-[#7060F5] text-white font-bold text-sm transition-all shadow-md group disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <span>Generating UPI Payment...</span>
              ) : (
                <>
                  <span>Proceed to UPI Payment (₹{finalPayableTotal})</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-4 text-xs text-[#777486] pt-2">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                Instant Access
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Direct Bank Transfer
              </span>
            </div>
          </form>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-[#E9E5FF] shadow-xs space-y-5">
            <h3 className="text-base font-bold text-[#22212B] pb-3 border-b border-[#F3F0FF]">
              Order Summary ({items.length} items)
            </h3>

            <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center gap-3.5 text-sm"
                >
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#F0EEFA] border border-[#E9E5FF] flex-shrink-0">
                    <Image
                      src={item.product.previewImage}
                      alt={item.product.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-[#22212B] text-xs truncate">
                      {item.product.title}
                    </h4>
                    <span className="text-[11px] text-[#777486]">
                      Qty: {item.quantity}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs text-[#22212B]">
                      ₹{item.product.price * item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-xs text-[#777486] hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition-colors"
                      title="Remove item"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Discount Coupon Form */}
            <div className="pt-2 border-t border-[#F3F0FF]">
              {appliedCoupon ? (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-emerald-800">
                    <Tag className="w-4 h-4 text-emerald-600" />
                    <span>
                      Coupon <strong>{appliedCoupon.code}</strong> applied (-₹
                      {appliedCoupon.discount})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAppliedCoupon(null)}
                    className="text-emerald-700 hover:text-emerald-900 font-bold ml-2"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Discount code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl bg-[#F9F8FF] border border-[#E9E5FF] text-xs text-[#22212B] outline-none focus:border-[#7060F5] uppercase tracking-wider"
                    />
                    <button
                      type="submit"
                      disabled={isValidatingCoupon || !couponCode.trim()}
                      className="px-4 py-2 rounded-xl bg-[#22212B] text-white text-xs font-bold hover:bg-[#7060F5] transition-colors disabled:opacity-50"
                    >
                      {isValidatingCoupon ? "Checking..." : "Apply"}
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-[11px] text-red-600">{couponError}</p>
                  )}
                </form>
              )}
            </div>

            {/* Totals */}
            <div className="border-t border-[#F3F0FF] pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-[#777486]">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount</span>
                  <span>-₹{appliedCoupon.discount}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-extrabold text-[#22212B] pt-2 border-t border-[#F3F0FF]">
                <span>Total Amount</span>
                <span>₹{finalPayableTotal}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
