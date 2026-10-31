import { NextRequest, NextResponse } from "next/server";
import { CreateOrderSchema } from "@/lib/validations";
import { getProductById, createOrderAsync, validateAndApplyCoupon, saveDatabaseAsync } from "@/lib/db";
import { getBaseUrl } from "@/lib/url";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parseResult = CreateOrderSchema.safeParse(json);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request payload",
          details: parseResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { customerEmail, customerName, items: rawItems, couponCode } = parseResult.data;

    // Server-side recalculation of prices: query real database
    let calculatedSubtotal = 0;
    const validatedItems = [];

    for (const item of rawItems) {
      const product = getProductById(item.productId);
      if (!product || !product.published) {
        return NextResponse.json(
          {
            error: `Product with ID '${item.productId}' is unavailable or unlisted.`,
          },
          { status: 400 }
        );
      }

      const itemTotal = product.price * item.quantity;
      calculatedSubtotal += itemTotal;

      validatedItems.push({
        productId: product.id,
        productTitle: product.title,
        unitPrice: product.price,
        quantity: item.quantity,
        totalPrice: itemTotal,
      });
    }

    if (calculatedSubtotal <= 0) {
      return NextResponse.json(
        { error: "Calculated order subtotal must be greater than zero." },
        { status: 400 }
      );
    }

    // Apply coupon discount if provided
    let discountAmount = 0;
    let appliedCouponCode: string | undefined = undefined;

    if (couponCode && couponCode.trim()) {
      const couponResult = validateAndApplyCoupon(couponCode.trim(), calculatedSubtotal);
      if (couponResult.valid) {
        discountAmount = couponResult.discount;
        calculatedSubtotal = couponResult.finalTotal;
        appliedCouponCode = couponResult.coupon?.code;
      }
    }

    // Check PayU Gateway configuration or default to direct UPI
    const payuKey = process.env.PAYU_MERCHANT_KEY;
    const payuSalt = process.env.PAYU_MERCHANT_SALT;
    const isPayuConfigured = Boolean(payuKey && payuSalt);
    const provider = isPayuConfigured ? "payu" : "upi_direct";

    const txnid = `txn_${crypto.randomBytes(8).toString("hex")}`;

    // Create database pending order
    const order = await createOrderAsync({
      customerEmail,
      customerName,
      items: validatedItems,
      subtotal: calculatedSubtotal,
      discountAmount,
      couponCode: appliedCouponCode,
      currency: "INR",
      paymentProvider: provider,
      paymentOrderId: txnid,
    });

    const baseUrl = getBaseUrl(req);

    let payuPayload = null;

    if (isPayuConfigured && payuKey && payuSalt) {
      const amountStr = calculatedSubtotal.toFixed(2);
      const productinfo = validatedItems.map((i) => i.productTitle).join(", ").slice(0, 100);
      const firstname = (customerName || "Customer").trim();
      const email = customerEmail.trim();

      // PayU SHA-512 Hash calculation:
      // sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||salt)
      const udf1 = order.id; // pass orderId in udf1
      const udf2 = "";
      const udf3 = "";
      const udf4 = "";
      const udf5 = "";

      const hashSequence = `${payuKey}|${txnid}|${amountStr}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${payuSalt}`;
      const hash = crypto.createHash("sha512").update(hashSequence).digest("hex");

      const payuActionUrl =
        process.env.PAYU_ENV === "prod"
          ? "https://secure.payu.in/_payment"
          : "https://test.payu.in/_payment";

      payuPayload = {
        actionUrl: payuActionUrl,
        params: {
          key: payuKey,
          txnid,
          amount: amountStr,
          productinfo,
          firstname,
          email,
          phone: "9999999999",
          surl: `${baseUrl}/api/checkout/payu/response`,
          furl: `${baseUrl}/checkout?error=payu_cancelled`,
          hash,
          udf1,
        },
      };
    }

    // Generate cryptographic verification signature for client-side state
    const signingSecret =
      process.env.TEST_PAYMENT_SECRET || "swanworks_test_mode_secret_key_2026";
    const testSignature = crypto
      .createHmac("sha256", signingSecret)
      .update(`${order.id}|${order.subtotal}|${txnid}`)
      .digest("hex");

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      subtotal: order.subtotal,
      currency: "INR",
      provider,
      paymentOrderId: txnid,
      testSignature,
      upi: {
        vpa: "sabareekv7-1@oksbi",
        name: "SWANWORKS",
        amount: order.subtotal,
        note: `Order ${order.orderNumber}`,
      },
      payu: payuPayload,
    });
  } catch (err) {
    console.error("Order creation failed:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred while creating order." },
      { status: 500 }
    );
  }
}
