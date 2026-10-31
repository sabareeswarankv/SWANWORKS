import { NextRequest, NextResponse } from "next/server";
import { getOrderByIdAsync } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId");

  if (!orderId) {
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
  }

  const order = await getOrderByIdAsync(orderId);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({
    orderId: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
  });
}
