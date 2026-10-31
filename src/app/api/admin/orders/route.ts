import { NextResponse } from "next/server";
import { isAuthenticatedAdmin } from "@/lib/adminAuth";
import { getAllOrders, getAllProducts } from "@/lib/db";
import { getDispatchedEmails } from "@/lib/email";

export async function GET() {
  const isAuth = await isAuthenticatedAdmin();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  const orders = getAllOrders();
  const products = getAllProducts(true);
  const emails = getDispatchedEmails();

  // Calculate metrics
  const totalRevenue = orders
    .filter((o) => o.status === "paid")
    .reduce((sum, o) => sum + o.subtotal, 0);
  const paidOrdersCount = orders.filter((o) => o.status === "paid").length;
  const totalDownloads = products.reduce((sum, p) => sum + (p.salesCount || 0), 0);

  return NextResponse.json({
    metrics: {
      totalRevenue,
      paidOrdersCount,
      totalOrdersCount: orders.length,
      totalDownloads,
      productsCount: products.length,
      emailsDispatchedCount: emails.length,
    },
    orders,
    recentEmails: emails.slice(0, 10),
  });
}
