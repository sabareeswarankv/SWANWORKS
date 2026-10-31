import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAuthenticatedAdmin } from "@/lib/adminAuth";
import { getOrderByIdAsync, markOrderAsPaidAsync, getAllProductsAsync } from "@/lib/db";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { getBaseUrl } from "@/lib/url";

export async function POST(req: NextRequest) {
  const isAuth = await isAuthenticatedAdmin();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    const order = await getOrderByIdAsync(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Mark as paid and generate secure tokens directly in cloud DB
    const result = await markOrderAsPaidAsync(order.id, {
      paymentId: order.paymentId || `upi_approved_${Date.now()}`,
      paymentOrderId: order.paymentOrderId,
      provider: "upi_direct",
      utr: order.utr,
    });

    if (!result) {
      return NextResponse.json(
        { error: "Failed to approve order" },
        { status: 500 }
      );
    }

    // Send confirmation email with download links to customer
    const allProducts = await getAllProductsAsync(true);
    const baseUrl = getBaseUrl(req);

    try {
      await sendOrderConfirmationEmail(
        result.order,
        result.tokens,
        allProducts,
        baseUrl
      );
    } catch (e) {
      console.warn("Failed to dispatch approval confirmation email:", e);
    }

    revalidatePath("/admin");

    return NextResponse.json({
      success: true,
      order: result.order,
      downloadTokens: result.tokens,
    });
  } catch (err) {
    console.error("Order approval error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
