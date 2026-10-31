import { cookies } from "next/headers";
import crypto from "crypto";

const ADMIN_COOKIE_NAME = "swanworks_admin_session";

// Default dev admin secret key if not set in environment
const ADMIN_SECRET =
  process.env.ADMIN_SECRET_KEY || "swanworks_super_secret_admin_key_2026";

export function generateAdminSessionToken(): string {
  const timestamp = Date.now().toString();
  const signature = crypto
    .createHmac("sha256", ADMIN_SECRET)
    .update(`admin_session_${timestamp}`)
    .digest("hex");
  return `${timestamp}.${signature}`;
}

export function verifyAdminSessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [timestamp, signature] = parts;
  const age = Date.now() - parseInt(timestamp, 10);

  // Expire session after 24 hours
  if (isNaN(age) || age < 0 || age > 24 * 60 * 60 * 1000) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", ADMIN_SECRET)
    .update(`admin_session_${timestamp}`)
    .digest("hex");

  // Timing safe comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expectedSignature, "hex")
    );
  } catch {
    return false;
  }
}

export async function isAuthenticatedAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME);
  return verifyAdminSessionToken(sessionCookie?.value);
}

export const ADMIN_COOKIE = ADMIN_COOKIE_NAME;
