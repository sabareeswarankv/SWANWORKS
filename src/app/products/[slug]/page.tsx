import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlugAsync, getAllProductsAsync } from "@/lib/db";
import ProductDetailActions from "@/components/ProductDetailActions";
import ProductCard from "@/components/ProductCard";
import ProductReviews from "@/components/ProductReviews";
import {
  Check,
  Download,
  ShieldCheck,
  FileCheck,
  Layers,
  ArrowLeft,
  Tag,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlugAsync(slug);
  if (!product) {
    return { title: "Product Not Found | SWANWORKS" };
  }
  return {
    title: `${product.title} — SWANWORKS`,
    description: product.shortDescription,
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlugAsync(slug);

  if (!product) {
    notFound();
  }

  // Related products in the same category
  const allProducts = await getAllProductsAsync();
  const relatedProducts = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Back button */}
      <div>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#777486] hover:text-[#7060F5] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalogue</span>
        </Link>
      </div>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Preview Mockup */}
        <div className="lg:col-span-7 space-y-6">
          <div className="relative aspect-[4/3] w-full rounded-3xl overflow-hidden bg-[#F0EEFA] border border-[#E9E5FF] shadow-sm">
            <Image
              src={product.previewImage}
              alt={product.title}
              fill
              priority
              className="object-cover"
            />
            {product.badge && (
              <div className="absolute top-4 left-4 px-4 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-xs font-extrabold text-[#7060F5] border border-[#E9E5FF] shadow-xs">
                {product.badge}
              </div>
            )}
          </div>

          {/* Included Files Breakdown Box */}
          <div className="p-6 rounded-3xl bg-white border border-[#E9E5FF] space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[#22212B]">
              <FileCheck className="w-4 h-4 text-[#7060F5]" />
              <span>Included Files & Deliverables</span>
            </div>
            <ul className="space-y-2 text-xs text-[#777486]">
              {product.includedFiles.map((file, i) => (
                <li key={i} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#7060F5]" />
                  <span>{file}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Pricing & Purchase Details */}
        <div className="lg:col-span-5 space-y-8">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#7060F5] bg-[#ECE9FF] px-3 py-1 rounded-full w-fit mb-3">
              <Tag className="w-3.5 h-3.5" />
              <span>{product.category}</span>
            </div>
            <h1 className="text-3xl font-extrabold text-[#22212B] leading-tight">
              {product.title}
            </h1>
            <p className="text-sm text-[#777486] mt-3 leading-relaxed">
              {product.shortDescription}
            </p>
          </div>

          {/* Price Box */}
          <div className="p-6 rounded-3xl bg-white border border-[#E9E5FF] shadow-sm space-y-6">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-extrabold text-[#22212B]">
                  ₹{product.price}
                </span>
                <span className="text-xs text-[#777486] ml-2">One-time payment</span>
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Instant Access
              </span>
            </div>

            {/* Client Add to Cart Component */}
            <ProductDetailActions product={product} />

            <div className="space-y-3 pt-3 border-t border-[#F3F0FF] text-xs text-[#777486]">
              <div className="flex items-center gap-2.5">
                <Download className="w-4 h-4 text-[#7060F5]" />
                <span>Instant download on screen & delivered via email</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Secure encrypted checkout with instant receipt</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-[#7060F5]" />
                <span>Free updates for future releases</span>
              </div>
            </div>
          </div>

          {/* Compatibility & License */}
          <div className="p-6 rounded-3xl bg-[#F9F8FF] border border-[#E9E5FF] space-y-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#22212B]">
                Software Compatibility
              </h4>
              <p className="text-xs text-[#777486] mt-1">
                {product.compatibility}
              </p>
            </div>

            <div className="pt-2 border-t border-[#E9E5FF]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#22212B]">
                Licensing
              </h4>
              <p className="text-xs text-[#777486] mt-1">{product.license}</p>
              <Link
                href="/legal/license"
                className="text-xs text-[#7060F5] hover:underline font-semibold inline-block mt-1"
              >
                Read full licence terms →
              </Link>
            </div>

            <div className="pt-2 border-t border-[#E9E5FF]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#22212B]">
                Refund Policy
              </h4>
              <p className="text-xs text-[#777486] mt-1">
                Due to the immediate delivery of digital resources, purchases are covered by our standard digital goods policy.
              </p>
              <Link
                href="/legal/refund-policy"
                className="text-xs text-[#7060F5] hover:underline font-semibold inline-block mt-1"
              >
                Review digital refund conditions →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Full Description & Features Section */}
      <div className="p-8 sm:p-10 rounded-3xl bg-white border border-[#E9E5FF] space-y-8">
        <div>
          <h2 className="text-xl font-bold text-[#22212B]">
            About this Resource
          </h2>
          <p className="text-sm text-[#777486] mt-3 leading-relaxed whitespace-pre-line max-w-3xl">
            {product.fullDescription}
          </p>
        </div>

        <div className="pt-6 border-t border-[#F3F0FF]">
          <h3 className="text-base font-bold text-[#22212B] mb-4">
            Key Features & Capabilities
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {product.features.map((feature, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#ECE9FF] text-[#7060F5] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 stroke-[2.5]" />
                </div>
                <span className="text-sm text-[#22212B]">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <ProductReviews productId={product.id} />

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-[#22212B]">
            Related {product.category}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
