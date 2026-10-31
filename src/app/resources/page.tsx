import React from "react";
import { getAllProducts } from "@/lib/db";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { ArrowLeft, Box } from "lucide-react";

export const metadata = {
  title: "Creative Resources & Design Assets — SWANWORKS",
  description: "UI icon sets, Figma component libraries, vector assets, and presentation slide kits.",
};

export default function ResourcesPage() {
  const allProducts = getAllProducts();
  const resourceProducts = allProducts.filter(
    (p) => p.category === "Creative Resources" || p.category === "Code Kits"
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#777486] hover:text-[#7060F5] transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Categories</span>
        </Link>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ECE9FF] text-[#7060F5] text-xs font-bold uppercase tracking-wider mb-2">
          <Box className="w-3.5 h-3.5" />
          <span>ASSETS & CODE</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#22212B]">
          Creative Resources & Code Kits
        </h1>
        <p className="text-sm sm:text-base text-[#777486] mt-2 max-w-xl">
          Hand-crafted vector icons, Figma design kits, and production-ready code modules built for web projects and client deliverables.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {resourceProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
