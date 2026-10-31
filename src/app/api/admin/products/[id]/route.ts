import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAuthenticatedAdmin } from "@/lib/adminAuth";
import { updateProductAsync, deleteProductAsync, getProductById } from "@/lib/db";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteProps) {
  const isAuth = await isAuthenticatedAdmin();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const updates = await req.json();
    const existing = getProductById(id);
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const updated = await updateProductAsync(id, updates);
    revalidatePath("/", "page");
    revalidatePath("/shop", "page");
    revalidatePath("/admin", "page");
    revalidatePath(`/products/${existing.slug}`, "page");
    return NextResponse.json({ success: true, product: updated });
  } catch (err) {
    console.error("Product update failed:", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteProps) {
  const isAuth = await isAuthenticatedAdmin();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  const { id } = await params;
  const existing = getProductById(id);
  const deleted = await deleteProductAsync(id);
  if (!deleted) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  revalidatePath("/", "page");
  revalidatePath("/shop", "page");
  revalidatePath("/admin", "page");
  if (existing) {
    revalidatePath(`/products/${existing.slug}`, "page");
  }

  return NextResponse.json({ success: true });
}
