import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedAdmin } from "@/lib/adminAuth";
import { setAdminPassword, saveDatabaseAsync } from "@/lib/db";

export async function POST(req: NextRequest) {
  const isAuth = await isAuthenticatedAdmin();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const { newPassword } = await req.json();
    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    setAdminPassword(newPassword.trim());
    await saveDatabaseAsync();
    return NextResponse.json({ success: true, message: "Password updated successfully!" });
  } catch (err) {
    console.error("Change password error:", err);
    return NextResponse.json({ error: "Failed to update password" }, { status: 500 });
  }
}
