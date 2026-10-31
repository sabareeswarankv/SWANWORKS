import { NextRequest, NextResponse } from "next/server";
import { AdminLoginSchema } from "@/lib/validations";
import { generateAdminSessionToken, ADMIN_COOKIE } from "@/lib/adminAuth";
import { verifyAdminPassword } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = AdminLoginSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid password input format" },
        { status: 400 }
      );
    }

    const isMatch = verifyAdminPassword(parsed.data.password);

    if (!isMatch) {
      return NextResponse.json(
        { error: "Incorrect administrative password." },
        { status: 401 }
      );
    }

    const sessionToken = generateAdminSessionToken();
    const res = NextResponse.json({ success: true, message: "Authenticated." });

    res.cookies.set({
      name: ADMIN_COOKIE,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return res;
  } catch (err) {
    console.error("Admin login error:", err);
    return NextResponse.json(
      { error: "Server authentication error" },
      { status: 500 }
    );
  }
}
