import React from "react";
import { getAllProducts } from "@/lib/db";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { ArrowLeft, Layout } from "lucide-react";

export const metadata = {
  title: "Website & Digital Templates — SWANWORKS",
  description: "Production-ready website boilerplates, portfolio templates, and Notion productivity setups.",
};

export default function TemplatesPage() {
  const allProducts = getAllProducts();
  const templateProducts = allProducts.filter(
    (p) => p.category === "Templates" || p.category === "Planners"
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
          <Layout className="w-3.5 h-3.5" />
          <span>CURATED WORKSPACES</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#22212B]">
          Templates & Workspaces
        </h1>
        <p className="text-sm sm:text-base text-[#777486] mt-2 max-w-xl">
          Clean, responsive Next.js web templates, developer portfolios, and Notion productivity systems built for immediate deployment.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {templateProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
