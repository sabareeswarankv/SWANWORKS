"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SwanLogo from "@/components/SwanLogo";
import { useCart } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";
import { Search, ShoppingBag, User, Menu, X, Mail } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { itemCount, openCart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.categories && Array.isArray(data.categories)) {
          setCategories(data.categories);
        }
      })
      .catch(() => {});
  }, []);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    ...categories.slice(0, 3).map((c) => ({
      label: c,
      href: `/shop?category=${encodeURIComponent(c)}`,
    })),
    { label: "Help Desk", href: "/contact" },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#F9F8FF]/90 backdrop-blur-md border-b border-[#E9E5FF]/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <SwanLogo size="md" />
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  prefetch={false}
                  className={`text-sm font-semibold transition-colors duration-200 ${
                    isActive
                      ? "text-[#7060F5] font-bold"
                      : "text-[#777486] hover:text-[#22212B]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Action Icons */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Search Toggle */}
            <div className="relative">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2.5 rounded-full text-[#777486] hover:text-[#22212B] hover:bg-[#E9E5FF]/60 transition-colors"
                aria-label="Search digital products"
              >
                <Search className="w-5 h-5" />
              </button>

              {searchOpen && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (searchQuery.trim()) {
                      window.location.href = `/shop?q=${encodeURIComponent(
                        searchQuery.trim()
                      )}`;
                      setSearchOpen(false);
                    }
                  }}
                  className="absolute right-0 top-12 w-72 p-2 bg-white rounded-2xl shadow-xl border border-[#E9E5FF] flex items-center z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search templates, kits..."
                    className="w-full px-3 py-1.5 text-sm bg-transparent outline-none text-[#22212B] placeholder:text-[#777486]"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-3 py-1 rounded-xl bg-[#7060F5] text-white text-xs font-semibold"
                  >
                    Go
                  </button>
                </form>
              )}
            </div>

            {/* Shopping Bag / Cart */}
            <button
              onClick={openCart}
              className="relative p-2.5 rounded-full text-[#777486] hover:text-[#22212B] hover:bg-[#E9E5FF]/60 transition-colors"
              aria-label={`Shopping Cart with ${itemCount} items`}
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#7060F5] text-white text-[11px] font-extrabold flex items-center justify-center shadow-sm">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Customer Downloads Link */}
            <Link
              href="/retrieve-order"
              className="p-2.5 rounded-full text-[#777486] hover:text-[#22212B] hover:bg-[#E9E5FF]/60 transition-colors"
              aria-label="My Downloads & Orders"
              title="My Downloads"
            >
              <User className="w-5 h-5" />
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-full text-[#777486] hover:text-[#22212B] hover:bg-[#E9E5FF]/60"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#E9E5FF] bg-white/95 backdrop-blur-md px-6 py-5 space-y-4 shadow-lg animate-in slide-in-from-top duration-200">
            <nav className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-semibold text-[#22212B] hover:text-[#7060F5] py-1"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-[#E9E5FF] flex flex-col gap-3">
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-semibold text-[#7060F5] flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>Contact & Help Desk</span>
                </Link>
                <div className="flex items-center justify-between pt-1">
                  <Link
                    href="/retrieve-order"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-sm font-semibold text-[#22212B] flex items-center gap-2"
                  >
                    <User className="w-4 h-4 text-[#777486]" />
                    <span>My Purchases</span>
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openCart();
                    }}
                    className="text-sm font-semibold text-[#22212B] flex items-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4 text-[#777486]" />
                    <span>Cart ({itemCount})</span>
                  </button>
                </div>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Slide-out Cart Drawer */}
      <CartDrawer />
    </>
  );
}
