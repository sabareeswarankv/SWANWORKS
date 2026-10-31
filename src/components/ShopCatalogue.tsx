"use client";

import React, { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Product, ProductCategory } from "@/types";
import ProductCard from "@/components/ProductCard";
import { Search, SlidersHorizontal, Package } from "lucide-react";

interface ShopCatalogueProps {
  initialProducts: Product[];
  initialCategories?: string[];
}

export default function ShopCatalogue({
  initialProducts,
  initialCategories,
}: ShopCatalogueProps) {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "All";
  const initialSearch = searchParams.get("q") || "";

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [sortBy, setSortBy] = useState<string>("popular");

  const categories = useMemo(() => {
    const list = new Set<string>(["All"]);
    if (initialCategories && initialCategories.length > 0) {
      initialCategories.forEach((c) => list.add(c));
    }
    initialProducts.forEach((p) => {
      if (p.category) list.add(p.category);
    });
    return Array.from(list);
  }, [initialCategories, initialProducts]);

  const filteredProducts = useMemo(() => {
    return initialProducts
      .filter((product) => {
        const matchesCategory =
          selectedCategory === "All" || product.category === selectedCategory;
        const matchesSearch =
          searchQuery.trim() === "" ||
          product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.features.some((f) =>
            f.toLowerCase().includes(searchQuery.toLowerCase())
          );
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "price_asc") return a.price - b.price;
        if (sortBy === "price_desc") return b.price - a.price;
        if (sortBy === "newest") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        // default: popular (salesCount)
        return (b.salesCount || 0) - (a.salesCount || 0);
      });
  }, [initialProducts, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="space-y-8">
      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-white p-4 rounded-3xl border border-[#E9E5FF] shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-[#777486] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search resources, tags, or features..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F9F8FF] border border-[#E9E5FF] text-sm text-[#22212B] placeholder:text-[#777486] outline-none focus:border-[#7060F5] transition-colors"
          />
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#777486]" />
          <span className="text-xs font-semibold text-[#777486]">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-2xl bg-[#F9F8FF] border border-[#E9E5FF] text-xs font-bold text-[#22212B] outline-none focus:border-[#7060F5] cursor-pointer"
          >
            <option value="popular">Popularity & Bestsellers</option>
            <option value="newest">Newest Releases</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2.5">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                isSelected
                  ? "bg-[#7060F5] text-white shadow-sm"
                  : "bg-white border border-[#E9E5FF] text-[#777486] hover:text-[#22212B] hover:border-[#B8A7FF]"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="py-20 text-center rounded-3xl bg-white border border-[#E9E5FF] p-8">
          <div className="w-16 h-16 rounded-2xl bg-[#ECE9FF] text-[#7060F5] flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[#22212B]">No products found</h3>
          <p className="text-sm text-[#777486] max-w-sm mx-auto mt-1 mb-6">
            We couldn&apos;t find anything matching your filters. Try clearing your search or category filter.
          </p>
          <button
            onClick={() => {
              setSelectedCategory("All");
              setSearchQuery("");
            }}
            className="px-6 py-2.5 rounded-full bg-[#22212B] text-white font-semibold text-xs hover:bg-[#7060F5] transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
