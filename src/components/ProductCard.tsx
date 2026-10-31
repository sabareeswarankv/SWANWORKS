"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { Plus, Check, Star } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, items } = useCart();
  const isInCart = items.some((item) => item.product.id === product.id);

  return (
    <div className="group flex flex-col rounded-3xl bg-white border border-[#E9E5FF] p-4 product-card-shadow transition-all duration-300">
      {/* Product Image / Preview Container */}
      <Link
        href={`/products/${product.slug}`}
        prefetch={false}
        className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-[#F0EEFA] flex items-center justify-center mb-4 cursor-pointer"
      >
        <Image
          src={product.previewImage}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Badge */}
        {product.badge && (
          <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-bold text-[#7060F5] border border-[#E9E5FF] shadow-sm">
            {product.badge}
          </div>
        )}
      </Link>

      {/* Product Information */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <Link
            href={`/products/${product.slug}`}
            className="block text-base font-bold text-[#22212B] hover:text-[#7060F5] transition-colors line-clamp-1 mb-1"
          >
            {product.title}
          </Link>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#777486]">
              {product.category}
            </span>
            <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500 bg-amber-50/80 px-2 py-0.5 rounded-full border border-amber-200/60">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{product.rating ? product.rating.toFixed(1) : "5.0"}</span>
            </div>
          </div>
        </div>

        {/* Price & Add to Cart Action */}
        <div className="flex items-center justify-between pt-3 mt-2 border-t border-[#F3F0FF]">
          <span className="text-base font-extrabold text-[#22212B]">
            ₹{product.price}
          </span>

          <button
            onClick={() => addToCart(product)}
            className={`p-2 rounded-full transition-all duration-200 flex items-center justify-center ${
              isInCart
                ? "bg-[#ECE9FF] text-[#7060F5]"
                : "bg-[#22212B] hover:bg-[#7060F5] text-white"
            }`}
            aria-label={isInCart ? `In cart: ${product.title}` : `Add ${product.title} to cart`}
            title={isInCart ? "Already in cart" : "Add to cart"}
          >
            {isInCart ? (
              <Check className="w-4 h-4 stroke-[2.5]" />
            ) : (
              <Plus className="w-4 h-4 stroke-[2.5]" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
