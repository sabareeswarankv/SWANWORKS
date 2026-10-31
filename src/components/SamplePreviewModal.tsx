"use client";

import React, { useState } from "react";
import { Product } from "@/types";
import { BookOpen, X, Check, ShoppingBag, Download } from "lucide-react";
import { useCart } from "@/context/CartContext";

interface SamplePreviewModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export default function SamplePreviewModal({
  product,
  isOpen,
  onClose,
}: SamplePreviewModalProps) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  if (!isOpen) return null;

  const handleBuyNow = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#22212B]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl border border-[#E9E5FF] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F3F0FF] bg-[#FAF9FF] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#ECE9FF] text-[#7060F5] flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7060F5] bg-white border border-[#E9E5FF] px-2 py-0.5 rounded-full">
                  FREE PREVIEW CHAPTER
                </span>
              </div>
              <h3 className="text-sm font-bold text-[#22212B] line-clamp-1">
                {product.title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-[#ECE9FF] text-[#777486] hover:text-[#22212B] flex items-center justify-center text-sm font-bold cursor-pointer transition-colors border border-[#E9E5FF]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Reader Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-sm text-[#22212B] flex-1 leading-relaxed">
          <div className="p-4 rounded-2xl bg-[#F9F8FF] border border-[#E9E5FF] text-xs text-[#777486] flex items-center justify-between">
            <span>You are viewing a sample excerpt of <strong>{product.title}</strong>.</span>
            <span className="font-semibold text-[#7060F5]">3 Pages Available</span>
          </div>

          <article className="prose prose-sm max-w-none space-y-4">
            <h4 className="text-lg font-extrabold text-[#22212B]">
              Chapter 1: Foundations & Quick Start Guide
            </h4>
            <p className="text-[#555263]">
              Welcome to the digital resource edition of {product.title}. This guide is engineered to eliminate guesswork, optimize workflows, and deliver immediate clarity whether you are working independently or collaborating across teams.
            </p>

            <div className="p-5 rounded-2xl bg-[#ECE9FF]/40 border border-[#E9E5FF] space-y-2">
              <h5 className="font-bold text-xs uppercase tracking-wider text-[#7060F5]">
                Core Architecture & Key Principles:
              </h5>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#555263]">
                <li><strong>Instant Deployment:</strong> Built with zero dependencies on third-party lock-in.</li>
                <li><strong>Structured Layouts:</strong> Clean typography, spacious grids, and intuitive hierarchy.</li>
                <li><strong>Lifetime Personal License:</strong> Unrestricted usage across all personal and work projects.</li>
              </ul>
            </div>

            <h4 className="text-base font-bold text-[#22212B] pt-2">
              What is included in the full package:
            </h4>
            <p className="text-[#555263]">
              Upon unlocking the complete edition, you immediately receive all editable master source files, printable companion sheets, high-resolution formats, and step-by-step video duplication tutorials.
            </p>

            <div className="p-4 rounded-xl border border-dashed border-[#7060F5]/40 bg-[#FAF9FF] text-center space-y-2">
              <span className="text-xs font-bold text-[#7060F5] block">
                [ Remaining chapters and full downloads available in complete edition ]
              </span>
              <p className="text-[11px] text-[#777486]">
                Instant lifetime download link dispatched immediately upon purchase.
              </p>
            </div>
          </article>
        </div>

        {/* Footer with Purchase CTA */}
        <div className="px-6 py-4 border-t border-[#F3F0FF] bg-[#FAF9FF] shrink-0 flex items-center justify-between gap-4">
          <div>
            <span className="text-xs text-[#777486] block">Full Edition Price:</span>
            <span className="text-xl font-extrabold text-[#22212B]">₹{product.price}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-[#E9E5FF] bg-white text-xs font-bold text-[#777486] hover:text-[#22212B] cursor-pointer"
            >
              Continue Browsing
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              className="px-5 py-2.5 rounded-full bg-[#7060F5] hover:bg-[#5A48E6] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              {added ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added to Cart!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Unlock Full Edition (₹{product.price})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
