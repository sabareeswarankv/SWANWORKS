import React from "react";
import Link from "next/link";
import { getAllProductsAsync, getAllCategoriesAsync } from "@/lib/db";
import HeroVisual from "@/components/HeroVisual";
import ProductCard from "@/components/ProductCard";
import {
  ArrowRight,
  CheckCircle2,
  Code2,
  Layout,
  CalendarDays,
  Layers,
  HelpCircle,
  FileCode,
  Zap,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const allProducts = await getAllProductsAsync();
  const bestsellers = allProducts.slice(0, 4);
  const liveCategories = await getAllCategoriesAsync();

  const colorPalette = [
    "bg-[#ECE9FF] text-[#7060F5]",
    "bg-[#E9E5FF] text-[#5A48E6]",
    "bg-[#F3F0FF] text-[#7060F5]",
    "bg-[#ECE9FF] text-[#7060F5]",
  ];

  const categories = liveCategories.map((cat, idx) => ({
    title: cat,
    slug: cat,
    description: `Explore all ${cat} ready for instant digital download.`,
    icon: Layout,
    color: colorPalette[idx % colorPalette.length],
    count: allProducts.filter((p) => p.category === cat).length,
  }));

  const trustBadges = [
    "Instant Download",
    "Lifetime Access",
    "Beginner Friendly",
    "Made with Care",
  ];

  const faqs = [
    {
      question: "How do I receive my digital files after checkout?",
      answer:
        "Instantly! As soon as your payment is confirmed, your files are immediately available on screen to download. We also send a backup download link directly to your email.",
    },
    {
      question: "Can I use these templates and assets for client projects?",
      answer:
        "Yes. All SWANWORKS templates, UI kits, and code boilerplates come with a standard commercial license allowing unlimited personal and commercial client deliverables.",
    },
    {
      question: "What if I lose my download link or change devices?",
      answer:
        "You can retrieve past purchases anytime using our Past Purchases page by entering your purchase email. You will receive active download links right away.",
    },
    {
      question: "What file formats will I receive?",
      answer:
        "Depending on the product, you receive ready-to-use PDF documents, printable sheets, Notion workspace templates, or design packages that open immediately on your phone, tablet, or computer.",
    },
  ];

  return (
    <div className="space-y-20 md:space-y-28">
      {/* ---------------- 1. HERO SECTION ---------------- */}
      <section className="pt-8 md:pt-14 pb-4 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-6 space-y-6 text-left">
              {/* Headline matching screenshot */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#22212B] leading-[1.1]">
                Small Tools <br />
                for Big Ideas<span className="text-[#7060F5]">.</span>
              </h1>

              {/* Supporting Copy */}
              <p className="text-base sm:text-lg text-[#777486] max-w-lg leading-relaxed">
                Templates, planners, and resources to help you create, organise, and build.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#22212B] text-white font-bold text-sm hover:bg-[#7060F5] transition-all shadow-md group"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white border border-[#E9E5FF] text-[#22212B] font-bold text-sm hover:border-[#7060F5] hover:text-[#7060F5] transition-all shadow-sm"
                >
                  <span>Browse Catalogue</span>
                </Link>
              </div>
            </div>

            {/* Right Visual Column (Matching Reference Design with 3D Container) */}
            <div className="lg:col-span-6 flex justify-center">
              <HeroVisual />
            </div>
          </div>

          {/* ---------------- TRUST INDICATORS ROW (Matching reference design) ---------------- */}
          <div className="mt-14 pt-8 border-t border-[#E9E5FF]/80">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {trustBadges.map((badge) => (
                <div
                  key={badge}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-[#E9E5FF] shadow-xs text-xs sm:text-sm font-semibold text-[#22212B]"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#7060F5] flex-shrink-0" />
                  <span>{badge}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- 2. BESTSELLERS SECTION (Matching Reference Design) ---------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#22212B] tracking-tight">
              Bestsellers
            </h2>
            <p className="text-sm text-[#777486] mt-1">
              Top curated tools our customers use daily.
            </p>
          </div>

          <Link
            href="/shop"
            className="group flex items-center gap-1.5 text-sm font-bold text-[#22212B] hover:text-[#7060F5] transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 4-Item Grid matching screenshot */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestsellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ---------------- 3. CATEGORIES SECTION ---------------- */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7060F5] bg-[#ECE9FF] px-3 py-1 rounded-full">
              EXPLORE THE WORKSHOP
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#22212B] mt-3">
              Browse by Resource Type
            </h2>
            <p className="text-sm text-[#777486] mt-1">
              Pick from our curated digital products and downloads.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.title}
                  href={`/shop?category=${encodeURIComponent(cat.slug)}`}
                  className="group p-6 rounded-3xl bg-white border border-[#E9E5FF] hover:border-[#B8A7FF] hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div
                      className={`w-12 h-12 rounded-2xl ${cat.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-[#22212B] group-hover:text-[#7060F5] transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-[#777486] mt-2 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
                  <div className="pt-6 flex items-center justify-between text-xs font-semibold text-[#7060F5]">
                    <span>{cat.count} Resources</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ---------------- 4. PRODUCT VALUE / WHY SWANWORKS ---------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-[#ECE9FF] via-[#F3F0FF] to-[#E9E5FF] p-8 sm:p-12 border border-[#B8A7FF]/50 relative overflow-hidden">
          <div className="max-w-2xl relative z-10 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7060F5] bg-white/80 px-3 py-1 rounded-full border border-[#B8A7FF]/30">
              DESIGNED FOR EVERYDAY USE
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#22212B]">
              Carefully crafted resources ready for your daily workflow.
            </h2>
            <p className="text-sm sm:text-base text-[#777486] leading-relaxed">
              Every planner, template, and design asset in SWANWORKS is built to save you time.
              Download instantly and start using them in your favorite tools — GoodNotes, Notion, Figma, or your browser.
            </p>
            <div className="pt-4 flex flex-wrap gap-6 text-sm font-semibold text-[#22212B]">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#7060F5]" />
                <span>One-Time Purchase</span>
              </div>
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-[#7060F5]" />
                <span>Instant PDF & Digital Downloads</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- 5. FAQ SECTION ---------------- */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7060F5] bg-[#ECE9FF] px-3 py-1 rounded-full mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>FREQUENT QUESTIONS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#22212B]">
            Clear Answers Before You Buy
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white border border-[#E9E5FF] shadow-xs"
            >
              <h3 className="text-base font-bold text-[#22212B] mb-2">
                {faq.question}
              </h3>
              <p className="text-sm text-[#777486] leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
