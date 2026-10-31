"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Bundle } from "@/types";
import { useCart } from "@/context/CartContext";
import { Sparkles, Check, ShoppingBag, ArrowRight } from "lucide-react";

interface BundleDealCardProps {
  bundle: Bundle;
}

export default function BundleDealCard({ bundle }: BundleDealCardProps) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddBundle = () => {
    // Add the bundle as a special combo product item
    addToCart({
      id: bundle.id,
      slug: bundle.slug,
      title: bundle.title,
      category: "Bundles & Packs",
      shortDescription: bundle.subtitle,
      fullDescription: bundle.features.join(" • "),
      price: bundle.discountPrice,
      badge: "Bestseller",
      previewImage: bundle.previewImage,
      features: bundle.features,
      includedFiles: [
        "Full All-in-One Creator & Developer Pack",
        "Includes All 3 Items + Documentation",
      ],
      compatibility: "All Devices",
      license: "Commercial and personal use permitted.",
      vaultFile: "bundle_all_access.txt",
      published: true,
      salesCount: 142,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const savings = bundle.originalPrice - bundle.discountPrice;
  const savingsPercent = Math.round((savings / bundle.originalPrice) * 100);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#22212B] via-[#2D2A3E] to-[#1C1A24] text-white p-6 sm:p-8 border border-[#7060F5]/30 shadow-xl">
      {/* Decorative background glow */}
      <div className="absolute -right-20 -top-20 w-60 h-60 bg-[#7060F5]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#7060F5]/20 border border-[#7060F5]/40 text-[#A69BFF] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#A69BFF]" />
            <span>{bundle.badge || `Save ${savingsPercent}% (Best Value)`}</span>
          </div>

          <div>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {bundle.title}
            </h3>
            <p className="text-sm text-[#A8A4B8] mt-1.5 leading-relaxed">
              {bundle.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
            {bundle.features.map((feat, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-[#E0DCF5]">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing & CTA Card */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col items-center sm:items-end justify-between min-w-[240px] shrink-0 gap-4">
          <div className="text-center sm:text-right">
            <div className="flex items-center justify-center sm:justify-end gap-2 text-xs">
              <span className="text-[#A8A4B8] line-through font-medium">
                ₹{bundle.originalPrice}
              </span>
              <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Save ₹{savings} ({savingsPercent}% OFF)
              </span>
            </div>
            <div className="text-3xl sm:text-4xl font-black text-white mt-1">
              ₹{bundle.discountPrice}
            </div>
            <span className="text-[11px] text-[#A8A4B8] block mt-0.5">
              One-time purchase · Instant delivery
            </span>
          </div>

          <button
            type="button"
            onClick={handleAddBundle}
            className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-full font-bold text-xs transition-all shadow-md cursor-pointer ${
              added
                ? "bg-emerald-600 text-white"
                : "bg-[#7060F5] hover:bg-[#5A48E6] text-white"
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" />
                <span>Bundle Added to Cart!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>Get Complete Bundle</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
