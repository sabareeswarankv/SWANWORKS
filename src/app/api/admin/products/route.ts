import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAuthenticatedAdmin } from "@/lib/adminAuth";
import { getAllProductsAsync, createProductAsync } from "@/lib/db";
import { CreateProductSchema } from "@/lib/validations";

export async function GET() {
  const isAuth = await isAuthenticatedAdmin();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  const products = await getAllProductsAsync(true); // true includes unpublished
  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  const isAuth = await isAuthenticatedAdmin();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const json = await req.json();
    const parsed = CreateProductSchema.safeParse(json);

    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const errorText = issue?.message || "Please check your entered product details.";
      return NextResponse.json(
        { error: errorText, details: parsed.error.format() },
        { status: 400 }
      );
    }

    const created = await createProductAsync(parsed.data);
    revalidatePath("/", "page");
    revalidatePath("/shop", "page");
    revalidatePath("/admin", "page");
    return NextResponse.json({ success: true, product: created });
  } catch (err) {
    console.error("Admin product creation failed:", err);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
