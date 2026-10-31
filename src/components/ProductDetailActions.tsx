"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, ArrowRight, Check, BookOpen } from "lucide-react";
import SamplePreviewModal from "@/components/SamplePreviewModal";

export default function ProductDetailActions({ product }: { product: Product }) {
  const router = useRouter();
  const { addToCart, items, openCart } = useCart();
  const isInCart = items.some((item) => item.product.id === product.id);
  const [justAdded, setJustAdded] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleAddToCart = () => {
    addToCart(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (!isInCart) {
      addToCart(product);
    }
    router.push("/checkout");
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handleAddToCart}
        className={`w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-full font-bold text-sm transition-all shadow-sm cursor-pointer ${
          justAdded || isInCart
            ? "bg-[#ECE9FF] text-[#7060F5] border border-[#B8A7FF]"
            : "bg-[#22212B] hover:bg-[#7060F5] text-white"
        }`}
      >
        {justAdded || isInCart ? (
          <>
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>Added to Cart</span>
          </>
        ) : (
          <>
            <ShoppingBag className="w-4 h-4" />
            <span>Add to Cart</span>
          </>
        )}
      </button>

      <button
        onClick={handleBuyNow}
        className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-full bg-white border border-[#E9E5FF] hover:border-[#7060F5] text-[#22212B] hover:text-[#7060F5] font-bold text-sm transition-all shadow-xs group cursor-pointer"
      >
        <span>Instant Checkout</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>

      <button
        type="button"
        onClick={() => setIsPreviewOpen(true)}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-[#FAF9FF] hover:bg-[#ECE9FF] border border-[#E9E5FF] text-[#7060F5] font-bold text-xs transition-colors cursor-pointer"
      >
        <BookOpen className="w-3.5 h-3.5" />
        <span>Preview Free Sample Chapter</span>
      </button>

      <SamplePreviewModal
        product={product}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </div>
  );
}
