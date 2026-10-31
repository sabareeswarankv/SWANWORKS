import React from "react";
import Link from "next/link";
import { ArrowLeft, Check, X } from "lucide-react";

export const metadata = {
  title: "Digital Product Licence — SWANWORKS",
};

export default function LicensePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-4 text-xs">
          <Link
            href="/contact"
            className="inline-flex items-center gap-1.5 font-bold text-[#7060F5] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Help Desk</span>
          </Link>
          <span className="text-[#E9E5FF]">|</span>
          <Link
            href="/"
            className="font-medium text-[#777486] hover:text-[#22212B] transition-colors"
          >
            Store Home
          </Link>
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#7060F5] bg-[#ECE9FF] px-3 py-1 rounded-full">
          LICENSING SPECIFICATION
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#22212B] mt-3">
          Digital Product Licence
        </h1>
        <p className="text-sm text-[#777486] mt-1">
          A clear, friendly guide to what you can and cannot do with SWANWORKS resources.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Permitted */}
        <div className="p-6 rounded-3xl bg-white border border-emerald-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-700">
            <Check className="w-5 h-5" />
            <span>Permitted Uses</span>
          </div>
          <ul className="space-y-3 text-xs text-[#777486]">
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>Use templates and boilerplates for personal web projects.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>Build and publish commercial client websites and applications.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>Incorporate UI icons and assets into commercial SaaS products.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>Modify, restyle, and extend source code for your own builds.</span>
            </li>
          </ul>
        </div>

        {/* Prohibited */}
        <div className="p-6 rounded-3xl bg-white border border-red-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-red-700">
            <X className="w-5 h-5" />
            <span>Prohibited Actions</span>
          </div>
          <ul className="space-y-3 text-xs text-[#777486]">
            <li className="flex items-start gap-2">
              <span className="text-red-600 font-bold">✕</span>
              <span>Reselling or sub-licensing templates as standalone competitor assets.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 font-bold">✕</span>
              <span>Re-uploading source files or Notion share links to public file-sharing hubs.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 font-bold">✕</span>
              <span>Claiming raw unedited design mockups as your proprietary trademark.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
