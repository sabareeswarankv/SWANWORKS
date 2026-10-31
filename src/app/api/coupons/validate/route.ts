import { NextRequest, NextResponse } from "next/server";
import { validateAndApplyCoupon } from "@/lib/db";
import { z } from "zod";

const ValidateCouponSchema = z.object({
  code: z.string().min(1, "Coupon code is required"),
  subtotal: z.number().nonnegative(),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = ValidateCouponSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { valid: false, error: "Please enter a valid coupon code" },
        { status: 400 }
      );
    }

    const { code, subtotal } = parsed.data;
    const result = validateAndApplyCoupon(code, subtotal);

    if (!result.valid) {
      return NextResponse.json(
        { valid: false, error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      discount: result.discount,
      finalTotal: result.finalTotal,
      message: result.message,
      coupon: result.coupon,
    });
  } catch (err) {
    console.error("Coupon validation error:", err);
    return NextResponse.json(
      { valid: false, error: "Failed to validate coupon" },
      { status: 500 }
    );
  }
}
