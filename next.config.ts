import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  outputFileTracingIncludes: {
    "/api/**/*": ["./storage/**/*", "./data/**/*"],
    "/**/*": ["./storage/**/*", "./data/**/*"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
      },
      {
        protocol: "https",
        hostname: "*.ufs.sh",
      },
    ],
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          "**/public/uploads/**",
          "**/storage/**",
          "**/data/**",
          "**/.git/**",
          "**/node_modules/**",
        ],
      };
    }
    return config;
  },
};

export default nextConfig;
