import React, { Suspense } from "react";
import { getAllProductsAsync, getAllCategoriesAsync } from "@/lib/db";
import ShopCatalogue from "@/components/ShopCatalogue";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ShopPage() {
  const products = await getAllProductsAsync();
  const categories = await getAllCategoriesAsync();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10 text-left">
        <span className="text-xs font-bold uppercase tracking-wider text-[#7060F5] bg-[#ECE9FF] px-3 py-1 rounded-full">
          COMPLETE CATALOGUE
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#22212B] mt-3">
          Explore Digital Resources
        </h1>
        <p className="text-sm sm:text-base text-[#777486] mt-2 max-w-xl">
          Carefully crafted Next.js templates, developer boilerplates, Notion
          productivity workspaces, and vector design assets.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="py-20 text-center text-[#777486]">
            Loading catalogue...
          </div>
        }
      >
        <ShopCatalogue initialProducts={products} initialCategories={categories} />
      </Suspense>
    </div>
  );
}
