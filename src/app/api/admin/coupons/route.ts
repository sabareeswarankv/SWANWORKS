import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAuthenticatedAdmin } from "@/lib/adminAuth";
import { getAllCoupons, createCoupon, saveDatabaseAsync } from "@/lib/db";
import { z } from "zod";

const CreateCouponSchema = z.object({
  code: z.string().min(2, "Code must be at least 2 characters").max(20),
  type: z.enum(["percentage", "fixed"]),
  discount: z.number().positive("Discount must be greater than zero"),
  minOrder: z.number().nonnegative().optional(),
  description: z.string().optional(),
});

export async function GET() {
  const isAuth = await isAuthenticatedAdmin();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const coupons = getAllCoupons();
  return NextResponse.json({ success: true, coupons });
}

export async function POST(req: NextRequest) {
  const isAuth = await isAuthenticatedAdmin();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const json = await req.json();
    const parsed = CreateCouponSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid coupon data" },
        { status: 400 }
      );
    }

    const newCoupon = createCoupon({
      code: parsed.data.code,
      type: parsed.data.type,
      discount: parsed.data.discount,
      minOrder: parsed.data.minOrder || 0,
      active: true,
      description:
        parsed.data.description?.trim() ||
        `${parsed.data.type === "percentage" ? `${parsed.data.discount}%` : `₹${parsed.data.discount}`} discount code`,
    });

    await saveDatabaseAsync();
    revalidatePath("/admin", "page");

    return NextResponse.json({ success: true, coupon: newCoupon });
  } catch (err) {
    console.error("Create coupon error:", err);
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 });
  }
}
