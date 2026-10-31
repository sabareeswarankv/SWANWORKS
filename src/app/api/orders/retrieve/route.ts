import { NextRequest, NextResponse } from "next/server";
import { RetrieveOrderSchema } from "@/lib/validations";
import {
  getAllOrders,
  getAllOrdersAsync,
  getTokensForOrder,
  getAllProducts,
} from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = RetrieveOrderSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const { email } = parsed.data;
    const orders = await getAllOrdersAsync();
    const paidOrders = orders.filter(
      (o) =>
        o.customerEmail.toLowerCase() === email.toLowerCase() &&
        o.status === "paid"
    );

    if (paidOrders.length === 0) {
      return NextResponse.json(
        {
          error:
            "No active paid orders were found associated with that email address.",
        },
        { status: 404 }
      );
    }

    const allProducts = getAllProducts();
    const results = paidOrders.map((order) => {
      const tokens = getTokensForOrder(order.id);
      return {
        orderId: order.id,
        orderNumber: order.orderNumber,
        paidAt: order.paidAt || order.createdAt,
        subtotal: order.subtotal,
        items: order.items,
        tokens: tokens.map((t) => {
          const product = allProducts.find((p) => p.id === t.productId);
          return {
            token: t.token,
            productTitle: product?.title || "Digital Asset",
            expiresAt: t.expiresAt,
            remainingDownloads: Math.max(0, t.maxDownloads - t.downloadCount),
          };
        }),
      };
    });

    return NextResponse.json({ success: true, orders: results });
  } catch (err) {
    console.error("Retrieve orders failed:", err);
    return NextResponse.json(
      { error: "Failed to retrieve past orders." },
      { status: 500 }
    );
  }
}
