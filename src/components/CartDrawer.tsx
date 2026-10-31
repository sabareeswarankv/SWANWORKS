"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { X, Trash2, ArrowRight, ShoppingBag, ShieldCheck } from "lucide-react";

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeFromCart, subtotal, itemCount } =
    useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#22212B]/40 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-[#FFFFFF] shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#E9E5FF] bg-[#F9F8FF]">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-[#7060F5]" />
              <h2 className="text-lg font-bold text-[#22212B]">
                Your Cart ({itemCount})
              </h2>
            </div>
            <button
              onClick={closeCart}
              className="p-2 rounded-full hover:bg-[#E9E5FF] text-[#777486] hover:text-[#22212B] transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-[#ECE9FF] flex items-center justify-center text-[#7060F5] mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-[#22212B] mb-1">
                  Your cart is empty
                </h3>
                <p className="text-sm text-[#777486] max-w-xs mb-6">
                  Explore our curated templates, code kits, and productivity resources.
                </p>
                <button
                  onClick={closeCart}
                  className="px-6 py-2.5 rounded-full bg-[#7060F5] text-white font-semibold text-sm hover:bg-[#5A48E6] transition-colors shadow-sm"
                >
                  Browse Products
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-4 p-3.5 rounded-2xl border border-[#E9E5FF] bg-[#F9F8FF] hover:border-[#B8A7FF] transition-colors"
                >
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-white border border-[#E9E5FF] flex-shrink-0">
                    <Image
                      src={item.product.previewImage}
                      alt={item.product.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-bold text-[#22212B] line-clamp-1">
                          {item.product.title}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-[#777486] hover:text-red-500 transition-colors p-1"
                          aria-label={`Remove ${item.product.title}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="text-xs font-medium text-[#7060F5] bg-[#ECE9FF] px-2 py-0.5 rounded-full inline-block mt-1">
                        {item.product.category}
                      </span>
                    </div>

                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-[#777486]">Instant Digital Delivery</span>
                      <span className="text-sm font-bold text-[#22212B]">
                        ₹{item.product.price}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Actions */}
          {items.length > 0 && (
            <div className="p-6 border-t border-[#E9E5FF] bg-[#F9F8FF] space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#777486] font-medium">Subtotal</span>
                <span className="text-xl font-extrabold text-[#22212B]">
                  ₹{subtotal}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-[#777486]">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Verified secure checkout with instant digital delivery</span>
              </div>

              <Link
                href="/checkout"
                onClick={closeCart}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-full bg-[#22212B] hover:bg-[#7060F5] text-white font-bold text-sm transition-all shadow-md group"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
