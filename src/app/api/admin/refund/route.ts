import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAuthenticatedAdmin } from "@/lib/adminAuth";
import { refundOrder, saveDatabaseAsync } from "@/lib/db";

export async function POST(req: NextRequest) {
  const isAuth = await isAuthenticatedAdmin();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    const updated = refundOrder(orderId);
    if (!updated) {
      return NextResponse.json(
        { error: "Order could not be found to refund" },
        { status: 404 }
      );
    }

    await saveDatabaseAsync();
    revalidatePath("/admin", "page");

    return NextResponse.json({ success: true, order: updated });
  } catch (err) {
    console.error("Refund failed:", err);
    return NextResponse.json({ error: "Refund failed" }, { status: 500 });
  }
}
