import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms of Service — SWANWORKS",
};

export default function TermsPage() {
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
          TERMS & CONDITIONS
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#22212B] mt-3">
          Terms of Service
        </h1>
        <p className="text-sm text-[#777486] mt-1">
          Last revised: October 2026. Please read these terms carefully before purchasing digital resources.
        </p>
      </div>

      <div className="p-8 sm:p-10 rounded-3xl bg-white border border-[#E9E5FF] shadow-xs space-y-6 text-sm text-[#777486] leading-relaxed">
        <div>
          <h2 className="text-base font-bold text-[#22212B] mb-2">
            1. Overview & Nature of Goods
          </h2>
          <p>
            SWANWORKS operates an independent digital products storefront offering downloadable website templates, developer boilerplates, digital planners, Notion workspaces, and design assets. All products sold on this website are intangible digital items delivered electronically.
          </p>
        </div>

        <div>
          <h2 className="text-base font-bold text-[#22212B] mb-2">
            2. Payment & Verification
          </h2>
          <p>
            All prices are denominated and processed in Indian Rupees (INR ₹). Download access is granted immediately upon successful payment confirmation.
          </p>
        </div>

        <div>
          <h2 className="text-base font-bold text-[#22212B] mb-2">
            3. Delivery & Access Limits
          </h2>
          <p>
            Following successful payment, you will receive immediate access to download your files. Your download link remains active for 7 days and can be used up to 10 times. You can also re-access your files anytime using your purchase email address via our Past Purchases page.
          </p>
        </div>

        <div>
          <h2 className="text-base font-bold text-[#22212B] mb-2">
            4. Permitted Uses & Prohibitions
          </h2>
          <p>
            You are granted a non-exclusive license to use purchased resources according to our Digital Product Licence. You may not re-distribute, sub-license, resell, or publicly share raw source packages or Notion template duplicate links as standalone competitor products.
          </p>
        </div>

        <div>
          <h2 className="text-base font-bold text-[#22212B] mb-2">
            5. Support & Updates
          </h2>
          <p>
            Support for purchased templates and resources is provided via our online Contact & Help Desk for basic installation and usage questions. Custom engineering modifications or third-party service integration troubleshooting are not included in the standard purchase price.
          </p>
        </div>
      </div>
    </div>
  );
}
