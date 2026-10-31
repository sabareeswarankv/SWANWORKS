import { NextRequest } from "next/server";

/**
 * Automatically resolves the live canonical public URL for emails, webhooks, and redirects.
 * Prefers live forwarded domain headers, custom domains, and Vercel domains over localhost.
 */
export function getBaseUrl(req?: NextRequest): string {
  // 1. Explicit production APP_URL set by user
  if (process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes("localhost")) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }

  // 2. Live incoming request domain (handles custom domain or *.vercel.app dynamically)
  if (req) {
    const forwardedHost = req.headers.get("x-forwarded-host") || req.headers.get("host");
    const forwardedProto = req.headers.get("x-forwarded-proto") || "https";
    if (forwardedHost && !forwardedHost.includes("localhost")) {
      return `${forwardedProto}://${forwardedHost}`.replace(/\/$/, "");
    }

    if (req.nextUrl?.origin && !req.nextUrl.origin.includes("localhost")) {
      return req.nextUrl.origin.replace(/\/$/, "");
    }
  }

  // 3. Vercel deployment variables
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`.replace(/\/$/, "");
  }

  // 4. Localhost fallback for local dev
  return req?.nextUrl?.origin || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}
