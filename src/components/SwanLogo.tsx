import React from "react";
import Link from "next/link";

interface SwanLogoProps {
  variant?: "light" | "dark" | "icon-only";
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function SwanLogo({
  variant = "dark",
  className = "",
  size = "md",
}: SwanLogoProps) {
  const isLight = variant === "light";
  const isIconOnly = variant === "icon-only";

  const sizeDimensions = {
    sm: { icon: 28, text: "text-base tracking-wider" },
    md: { icon: 34, text: "text-lg tracking-wider" },
    lg: { icon: 42, text: "text-2xl tracking-wider" },
  }[size];

  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2.5 font-bold transition-opacity hover:opacity-90 select-none ${className}`}
      aria-label="SWANWORKS Home"
    >
      {/* Abstract Geometric SWANWORKS Brand Symbol */}
      <div
        style={{ width: sizeDimensions.icon, height: sizeDimensions.icon }}
        className="relative flex items-center justify-center rounded-xl bg-gradient-to-tr from-[#7060F5] to-[#B8A7FF] p-1.5 shadow-sm shadow-[#7060F5]/20 flex-shrink-0"
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Geometric curved wing facet */}
          <path
            d="M6 24C6 16.5 11.5 13 18 13H21C24 13 26 11 26 8"
            stroke="#FFFFFF"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <path
            d="M12 25C15 25 26 25 26 18C26 15 23.5 13 21 13"
            stroke="#FFFFFF"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeOpacity="0.85"
          />
          <circle cx="25" cy="8" r="3" fill="#FFFFFF" />
        </svg>
      </div>

      {!isIconOnly && (
        <span
          className={`font-extrabold uppercase ${sizeDimensions.text} ${
            isLight ? "text-white" : "text-[#22212B]"
          }`}
          style={{ letterSpacing: "0.12em" }}
        >
          SWANWORKS
        </span>
      )}
    </Link>
  );
}
