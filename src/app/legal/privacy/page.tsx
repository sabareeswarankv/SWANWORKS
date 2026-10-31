import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — SWANWORKS",
};

export default function PrivacyPage() {
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
          CUSTOMER PRIVACY
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#22212B] mt-3">
          Privacy Policy
        </h1>
        <p className="text-sm text-[#777486] mt-1">
          How SWANWORKS protects your privacy.
        </p>
      </div>

      <div className="p-8 sm:p-10 rounded-3xl bg-white border border-[#E9E5FF] shadow-xs space-y-6 text-sm text-[#777486] leading-relaxed">
        <div>
          <h2 className="text-base font-bold text-[#22212B] mb-2">
            1. Information We Collect
          </h2>
          <p>
            When you purchase a resource, we collect only your email address so we can deliver your digital files and invoice receipt. We never see or store your payment details, card numbers, or UPI PINs — all transactions are handled securely through our verified payment partners.
          </p>
        </div>

        <div>
          <h2 className="text-base font-bold text-[#22212B] mb-2">
            2. How We Use Your Email
          </h2>
          <p>
            Your email is used strictly to:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Deliver your downloadable files and purchase receipt</li>
            <li>Allow you to access and re-download your past purchases anytime</li>
            <li>Respond if you contact our help desk</li>
          </ul>
        </div>

        <div>
          <h2 className="text-base font-bold text-[#22212B] mb-2">
            3. Zero Spam & Complete Privacy
          </h2>
          <p>
            We respect your privacy. We will never sell, rent, or share your email address with third parties or advertisers.
          </p>
        </div>
      </div>
    </div>
  );
}
