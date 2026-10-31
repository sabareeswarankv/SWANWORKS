import { NextRequest, NextResponse } from "next/server";
import { VerifyPaymentSchema } from "@/lib/validations";
import {
  getOrderByIdAsync,
  markOrderAsPaid,
  markOrderPendingApprovalAsync,
  saveDatabaseAsync,
  getAllProducts,
} from "@/lib/db";
import { sendOrderConfirmationEmail, sendAdminNewPaymentAlert } from "@/lib/email";
import { getBaseUrl } from "@/lib/url";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parseResult = VerifyPaymentSchema.safeParse(json);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Invalid payment verification payload",
          details: parseResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { orderId, paymentId, paymentOrderId, signature, provider } =
      parseResult.data;

    const order = await getOrderByIdAsync(orderId);
    if (!order) {
      return NextResponse.json(
        { error: "Order not found in database." },
        { status: 404 }
      );
    }

    // Verify signatures server-side
    if (provider === "payu") {
      const salt = process.env.PAYU_MERCHANT_SALT;
      const key = process.env.PAYU_MERCHANT_KEY;
      if (!salt || !key) {
        return NextResponse.json(
          { error: "PayU merchant credentials not configured on server." },
          { status: 500 }
        );
      }

      // PayU reverse verification hash
      const reverseHashSequence = `${salt}|success||||||${order.id}||||${order.customerEmail}|${order.customerName || "Customer"}|${order.items.map(i => i.productTitle).join(", ")}|${order.subtotal.toFixed(2)}|${paymentOrderId}|${key}`;
      const expectedHash = crypto
        .createHash("sha512")
        .update(reverseHashSequence)
        .digest("hex");

      if (expectedHash.toLowerCase() !== signature.toLowerCase()) {
        return NextResponse.json(
          { error: "PayU transaction signature verification failed." },
          { status: 400 }
        );
      }
    } else if (provider === "upi_direct" || provider === "test_mode") {
      // Direct UPI / Test Mode HMAC Verification
      const testSecret =
        process.env.TEST_PAYMENT_SECRET || "swanworks_test_mode_secret_key_2026";
      const expectedSignature = crypto
        .createHmac("sha256", testSecret)
        .update(`${order.id}|${order.subtotal}|${paymentOrderId || order.paymentOrderId}`)
        .digest("hex");

      if (signature !== expectedSignature) {
        return NextResponse.json(
          { error: "Payment verification signature mismatch." },
          { status: 400 }
        );
      }
    }

    const baseUrl = getBaseUrl(req);

    // If Direct UPI: hold in pending_approval and notify admin to prevent free theft
    if (provider === "upi_direct") {
      const cleanUtr = parseResult.data.utr || (paymentId ? paymentId.replace("upi_", "") : `claim_${Date.now()}`);
      const updatedOrder = await markOrderPendingApprovalAsync(order.id, cleanUtr);

      if (!updatedOrder) {
        return NextResponse.json(
          { error: "Failed to submit transaction." },
          { status: 500 }
        );
      }

      // Notify admin immediately (sabareekv7@gmail.com)
      try {
        await sendAdminNewPaymentAlert(updatedOrder, cleanUtr, baseUrl);
      } catch (err) {
        console.error("Failed to notify admin of new payment:", err);
      }

      return NextResponse.json({
        success: true,
        orderId: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        status: "pending_approval",
        utr: cleanUtr,
        downloadTokens: [], // Zero tokens given until admin approves!
      });
    }

    // Mark order as paid idempotently and generate entitlement & tokens
    const result = markOrderAsPaid(order.id, {
      paymentId: paymentId || `pay_${Date.now()}`,
      paymentOrderId,
      paymentSignature: signature,
      provider,
    });

    await saveDatabaseAsync();

    if (!result) {
      return NextResponse.json(
        { error: "Failed to mark order as paid." },
        { status: 500 }
      );
    }

    // Send transactional order confirmation email
    const allProducts = getAllProducts();

    try {
      await sendOrderConfirmationEmail(
        result.order,
        result.tokens,
        allProducts,
        baseUrl
      );
    } catch (e) {
      console.warn("Failed to dispatch order email:", e);
    }

    return NextResponse.json({
      success: true,
      orderId: result.order.id,
      orderNumber: result.order.orderNumber,
      status: result.order.status,
      downloadTokens: result.tokens.map((t) => ({
        productId: t.productId,
        token: t.token,
        expiresAt: t.expiresAt,
      })),
    });
  } catch (err) {
    console.error("Payment verification error:", err);
    return NextResponse.json(
      { error: "Payment verification failed." },
      { status: 500 }
    );
  }
}
