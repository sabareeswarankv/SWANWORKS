"use client";

import React from "react";

export default function HeroVisual() {
  return (
    <div className="relative w-full max-w-[480px] lg:max-w-[540px] mx-auto select-none">
      {/* Decorative floating retro starburst (matches top-right in reference) */}
      <div className="absolute -top-6 -right-2 md:-right-6 z-20 animate-pulse duration-1000">
        <svg
          width="64"
          height="64"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-md text-[#7060F5] hover:rotate-45 transition-transform duration-500 cursor-pointer"
        >
          {/* 12-pointed playful geometric star */}
          <path
            d="M32 0L36.2 17.5L52.5 9.5L44.5 25.8L62 30L44.5 34.2L52.5 50.5L36.2 42.5L32 60L27.8 42.5L11.5 50.5L19.5 34.2L2 30L19.5 25.8L11.5 9.5L27.8 17.5L32 0Z"
            fill="#7060F5"
          />
        </svg>
      </div>

      {/* Floating background ambient glow */}
      <div className="absolute -inset-4 bg-gradient-to-tr from-[#B8A7FF]/30 via-[#E9E5FF]/50 to-[#7060F5]/20 rounded-full blur-2xl -z-10" />

      {/* Main 3D Composition Wrapper */}
      <div className="relative flex flex-col items-center justify-center pt-8 pb-4">
        {/* Layer 1: Back Card (Code & Preview) */}
        <div
          className="w-[280px] sm:w-[320px] h-[180px] rounded-2xl p-4 shadow-lg border border-white/60 bg-gradient-to-br from-white/90 via-[#E9E5FF]/70 to-[#B8A7FF]/40 backdrop-blur-md transform -rotate-6 translate-y-6 translate-x-4 transition-transform hover:-translate-y-2 duration-300"
          style={{
            boxShadow: "0 20px 40px -15px rgba(112, 96, 245, 0.25)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
            </div>
            <span className="text-[11px] font-semibold text-[#7060F5] bg-white/80 px-2.5 py-0.5 rounded-full border border-[#E9E5FF]">
              v2.4
            </span>
          </div>
          <div className="space-y-2">
            <div className="w-3/4 h-2.5 rounded bg-[#7060F5]/70" />
            <div className="w-1/2 h-2 rounded bg-[#777486]/50" />
            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="h-10 rounded-lg bg-white/70 border border-[#E9E5FF]" />
              <div className="h-10 rounded-lg bg-white/70 border border-[#E9E5FF]" />
              <div className="h-10 rounded-lg bg-[#7060F5]/20 border border-[#7060F5]/40" />
            </div>
          </div>
        </div>

        {/* Layer 2: Middle Dark Device / Mobile Mockup (Matches dark rectangle in container in reference) */}
        <div
          className="absolute top-12 left-6 sm:left-12 w-[160px] sm:w-[180px] h-[220px] rounded-2xl p-3 bg-[#22212B] text-white shadow-xl transform rotate-3 -translate-y-4 transition-transform hover:-translate-y-6 duration-300 border border-[#353443] z-10"
          style={{
            boxShadow: "0 25px 45px -10px rgba(34, 33, 43, 0.35)",
          }}
        >
          <div className="w-8 h-1 rounded-full bg-white/20 mx-auto mb-2" />
          <div className="space-y-2 pt-1">
            <div className="w-16 h-2 rounded bg-[#B8A7FF]" />
            <div className="w-24 h-4 rounded bg-white/90" />
            <div className="w-full h-16 rounded-xl bg-[#2D2B3A] p-2 flex flex-col justify-between">
              <div className="w-12 h-1.5 rounded bg-[#7060F5]" />
              <div className="flex justify-between items-end">
                <div className="w-8 h-6 rounded bg-[#7060F5]/40" />
                <div className="w-14 h-4 rounded-full bg-[#7060F5] text-[9px] flex items-center justify-center font-bold">
                  PRO
                </div>
              </div>
            </div>
            <div className="w-full h-12 rounded-xl bg-[#2D2B3A] p-2 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#7060F5] flex-shrink-0" />
              <div className="w-full space-y-1">
                <div className="w-14 h-1.5 rounded bg-white/80" />
                <div className="w-20 h-1.5 rounded bg-white/40" />
              </div>
            </div>
          </div>
        </div>

        {/* Layer 3: The 3D Frosted Lavender "SWANWORKS" Storage Box / Organizer (Primary Hero element) */}
        <div
          className="relative z-20 mt-[-40px] w-full max-w-[360px] sm:max-w-[420px] rounded-3xl p-6 sm:p-7 backdrop-blur-xl border border-white/80 bg-gradient-to-b from-[#E9E5FF]/95 via-[#ECE9FF]/90 to-[#D4CDFF]/95 shadow-2xl transition-all duration-300"
          style={{
            boxShadow:
              "0 30px 60px -15px rgba(112, 96, 245, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.9), inset 0 -4px 10px rgba(112, 96, 245, 0.15)",
          }}
        >
          {/* Subtle top container groove / rim */}
          <div className="w-full h-2 rounded-full bg-white/70 mb-5 shadow-inner" />

          {/* Central Branded Wordmark on the container */}
          <div className="flex items-center justify-center py-6">
            <span
              className="text-2xl sm:text-3xl font-extrabold uppercase text-[#22212B] tracking-[0.22em] select-none opacity-90 drop-shadow-sm"
              style={{
                letterSpacing: "0.22em",
              }}
            >
              SWANWORKS
            </span>
          </div>

          {/* Playful Floating Pointer / Click Cursor Arrow (Matches reference design) */}
          <div className="absolute -bottom-3 -right-3 sm:-right-5 z-30 transition-transform duration-300 hover:scale-110">
            <svg
              width="44"
              height="44"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-xl"
            >
              <path
                d="M7 3L22 17L14.5 18.5L19.5 28L15.5 30L10.5 20.5L7 24.5V3Z"
                fill="#22212B"
                stroke="#FFFFFF"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
