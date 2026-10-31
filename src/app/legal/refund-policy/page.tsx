import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";

export const metadata = {
  title: "Refund & Cancellation Policy — SWANWORKS",
};

export default function RefundPolicyPage() {
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
          CONSUMER INFORMATION
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#22212B] mt-3">
          Refund & Cancellation Policy
        </h1>
        <p className="text-sm text-[#777486] mt-1">
          Explicit conditions regarding digital goods and software resources.
        </p>
      </div>

      <div className="p-8 sm:p-10 rounded-3xl bg-white border border-[#E9E5FF] shadow-xs space-y-6 text-sm text-[#777486] leading-relaxed">
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 flex-shrink-0 text-amber-700 mt-0.5" />
          <div>
            <strong>Notice on Downloadable Goods:</strong> Because digital resources (website templates, code kits, Notion workspaces, and design files) are delivered immediately upon checkout, sales are generally final once the files have been downloaded.
          </div>
        </div>

        <div>
          <h2 className="text-base font-bold text-[#22212B] mb-2">
            1. Defective or Inaccessible Resources
          </h2>
          <p>
            If a downloaded file is corrupted, missing advertised components, or technically inoperable despite meeting the stated compatibility requirements, please contact support within 7 days of purchase. If our team cannot rectify the issue, a full refund will be processed to your original payment method.
          </p>
        </div>

        <div>
          <h2 className="text-base font-bold text-[#22212B] mb-2">
            2. Accidental Duplicate Purchases
          </h2>
          <p>
            If you inadvertently placed identical duplicate orders for the same item, notify our team with your order numbers. We will promptly cancel and refund the duplicate charge.
          </p>
        </div>

        <div>
          <h2 className="text-base font-bold text-[#22212B] mb-2">
            3. Refund Process
          </h2>
          <p>
            Approved refunds are credited through the original payment processor within 5–7 business days depending on your bank&apos;s standard processing window. Upon a refund, access to the download link is deactivated.
          </p>
        </div>
      </div>
    </div>
  );
}
