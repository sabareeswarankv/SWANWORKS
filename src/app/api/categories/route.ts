import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAuthenticatedAdmin } from "@/lib/adminAuth";
import {
  getAllCategoriesAsync,
  addCategoryAsync,
  updateCategoryAsync,
  deleteCategoryAsync,
} from "@/lib/db";

export const dynamic = "force-dynamic";

// Public GET so store front & shop can load live categories
export async function GET() {
  const categories = await getAllCategoriesAsync();
  return NextResponse.json({ categories });
}

// Admin POST to add a new category
export async function POST(req: NextRequest) {
  const isAuth = await isAuthenticatedAdmin();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name } = await req.json();
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }
    const categories = await addCategoryAsync(name.trim());
    revalidatePath("/", "page");
    revalidatePath("/shop", "page");
    revalidatePath("/admin", "page");
    return NextResponse.json({ success: true, categories });
  } catch (err) {
    console.error("Failed to add category:", err);
    return NextResponse.json(
      { error: "Failed to add category" },
      { status: 500 }
    );
  }
}

// Admin PUT to rename a category
export async function PUT(req: NextRequest) {
  const isAuth = await isAuthenticatedAdmin();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { oldName, newName } = await req.json();
    if (!oldName || !newName || typeof newName !== "string" || !newName.trim()) {
      return NextResponse.json(
        { error: "Both old and new category names are required" },
        { status: 400 }
      );
    }
    const categories = await updateCategoryAsync(oldName, newName.trim());
    revalidatePath("/", "page");
    revalidatePath("/shop", "page");
    revalidatePath("/admin", "page");
    return NextResponse.json({ success: true, categories });
  } catch (err) {
    console.error("Failed to update category:", err);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

// Admin DELETE to delete a category
export async function DELETE(req: NextRequest) {
  const isAuth = await isAuthenticatedAdmin();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name } = await req.json();
    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }
    const categories = await deleteCategoryAsync(name);
    revalidatePath("/", "page");
    revalidatePath("/shop", "page");
    revalidatePath("/admin", "page");
    return NextResponse.json({ success: true, categories });
  } catch (err) {
    console.error("Failed to delete category:", err);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
