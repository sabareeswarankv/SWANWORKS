import React from "react";
import Link from "next/link";
import SwanLogo from "@/components/SwanLogo";
import { ShieldCheck, Download, Mail } from "lucide-react";
import { getAllCategories } from "@/lib/db";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const categories = getAllCategories();

  return (
    <footer className="bg-white border-t border-[#E9E5FF] mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <SwanLogo size="md" />
            <p className="text-sm text-[#777486] leading-relaxed">
              Small Tools for Big Ideas. Carefully crafted templates, planners,
              and resources to help you create, organise, and build.
            </p>
          </div>

          {/* Shop Categories */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#22212B] mb-4">
              Catalogue
            </h4>
            <ul className="space-y-2.5 text-sm text-[#777486]">
              <li>
                <Link
                  href="/shop"
                  prefetch={false}
                  className="hover:text-[#7060F5] transition-colors font-medium text-[#22212B]"
                >
                  All Products & Books
                </Link>
              </li>
              {categories.map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/shop?category=${encodeURIComponent(cat)}`}
                    prefetch={false}
                    className="hover:text-[#7060F5] transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer & Delivery */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#22212B] mb-4">
              Customer Support
            </h4>
            <ul className="space-y-2.5 text-sm text-[#777486]">
              <li className="flex items-center gap-2">
                <Download className="w-4 h-4 text-[#7060F5]" />
                <Link
                  href="/retrieve-order"
                  className="hover:text-[#7060F5] transition-colors"
                >
                  Retrieve Past Downloads
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <Link
                  href="/legal/refund-policy"
                  className="hover:text-[#7060F5] transition-colors"
                >
                  Refund & Download Policy
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#7060F5]" />
                <Link
                  href="/contact"
                  prefetch={false}
                  className="hover:text-[#7060F5] transition-colors"
                >
                  Contact & Help Desk
                </Link>
              </li>
              <li className="flex items-center gap-2 text-xs text-[#7060F5]">
                <span className="font-semibold text-[#777486]">Email:</span>
                <a
                  href="mailto:helloswanworks@gmail.com"
                  className="hover:underline font-medium text-[#7060F5]"
                >
                  helloswanworks@gmail.com
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Pages */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#22212B] mb-4">
              Legal & Terms
            </h4>
            <ul className="space-y-2.5 text-sm text-[#777486]">
              <li>
                <Link
                  href="/legal/terms"
                  className="hover:text-[#7060F5] transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/privacy"
                  className="hover:text-[#7060F5] transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/license"
                  className="hover:text-[#7060F5] transition-colors"
                >
                  Digital Product Licence
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/refund-policy"
                  className="hover:text-[#7060F5] transition-colors"
                >
                  Cancellation & Refunds
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-8 border-t border-[#E9E5FF] flex flex-col sm:flex-row items-center justify-between text-xs text-[#777486] gap-4">
          <p>© {currentYear} SWANWORKS. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <span>Prices in INR (₹)</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
