import { NextRequest, NextResponse } from "next/server";
import { getOrderById, markOrderAsPaid, getAllProducts } from "@/lib/db";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { getBaseUrl } from "@/lib/url";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const status = formData.get("status")?.toString() || "";
    const txnid = formData.get("txnid")?.toString() || "";
    const amount = formData.get("amount")?.toString() || "";
    const productinfo = formData.get("productinfo")?.toString() || "";
    const firstname = formData.get("firstname")?.toString() || "";
    const email = formData.get("email")?.toString() || "";
    const udf1 = formData.get("udf1")?.toString() || ""; // our orderId
    const udf2 = formData.get("udf2")?.toString() || "";
    const udf3 = formData.get("udf3")?.toString() || "";
    const udf4 = formData.get("udf4")?.toString() || "";
    const udf5 = formData.get("udf5")?.toString() || "";
    const payuHash = formData.get("hash")?.toString() || "";
    const payuKey = formData.get("key")?.toString() || "";
    const payuId = formData.get("payuMoneyId")?.toString() || txnid;

    const salt = process.env.PAYU_MERCHANT_SALT;
    const baseUrl = getBaseUrl(req);

    if (!salt) {
      console.error("PayU Salt not set on server");
      return NextResponse.redirect(`${baseUrl}/checkout?error=payu_config_missing`, 303);
    }

    // Verify PayU reverse hash formula:
    // sha512(salt|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
    const reverseHashSequence = `${salt}|${status}||||||${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${payuKey}`;
    const calculatedHash = crypto
      .createHash("sha512")
      .update(reverseHashSequence)
      .digest("hex");

    if (calculatedHash.toLowerCase() !== payuHash.toLowerCase()) {
      console.error("PayU reverse hash mismatch!");
      return NextResponse.redirect(`${baseUrl}/checkout?error=hash_mismatch`, 303);
    }

    if (status !== "success") {
      console.warn(`PayU transaction failed with status: ${status}`);
      return NextResponse.redirect(`${baseUrl}/checkout?error=payment_${status}`, 303);
    }

    // Order lookup
    const order = getOrderById(udf1);
    if (!order) {
      console.error(`PayU callback order ${udf1} not found`);
      return NextResponse.redirect(`${baseUrl}/checkout?error=order_not_found`, 303);
    }

    // Mark paid idempotently
    const result = markOrderAsPaid(order.id, {
      paymentId: payuId,
      paymentOrderId: txnid,
      paymentSignature: payuHash,
      provider: "payu",
    });

    if (result) {
      const allProducts = getAllProducts();
      try {
        await sendOrderConfirmationEmail(
          result.order,
          result.tokens,
          allProducts,
          baseUrl
        );
      } catch (e) {
        console.warn("Email dispatch error in PayU callback:", e);
      }
    }

    return NextResponse.redirect(`${baseUrl}/order-confirmation/${order.id}`, 303);
  } catch (err) {
    console.error("PayU response handler error:", err);
    const origin = getBaseUrl(req);
    return NextResponse.redirect(`${origin}/checkout?error=unexpected_error`, 303);
  }
}
