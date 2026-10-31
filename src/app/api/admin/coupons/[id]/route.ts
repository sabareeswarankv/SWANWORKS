import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAuthenticatedAdmin } from "@/lib/adminAuth";
import { deleteCoupon, toggleCouponActive, saveDatabaseAsync } from "@/lib/db";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteProps) {
  const isAuth = await isAuthenticatedAdmin();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const updated = toggleCouponActive(id);
  if (!updated) {
    return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
  }

  await saveDatabaseAsync();
  revalidatePath("/admin", "page");

  return NextResponse.json({ success: true, coupon: updated });
}

export async function DELETE(req: NextRequest, { params }: RouteProps) {
  const isAuth = await isAuthenticatedAdmin();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const deleted = deleteCoupon(id);
  if (!deleted) {
    return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
  }

  await saveDatabaseAsync();
  revalidatePath("/admin", "page");

  return NextResponse.json({ success: true });
}
