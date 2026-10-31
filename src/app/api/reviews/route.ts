import { NextRequest, NextResponse } from "next/server";
import { getReviewsForProduct, addReview, getProductRating } from "@/lib/db";
import { z } from "zod";

const CreateReviewSchema = z.object({
  productId: z.string().min(1),
  authorName: z.string().min(2, "Name must be at least 2 characters").max(50),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(3, "Review text must be at least 3 characters").max(500),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: "productId parameter is required" },
        { status: 400 }
      );
    }

    const reviews = getReviewsForProduct(productId);
    const ratingSummary = getProductRating(productId);

    return NextResponse.json({
      success: true,
      reviews,
      rating: ratingSummary,
    });
  } catch (err) {
    console.error("Fetch reviews error:", err);
    return NextResponse.json(
      { error: "Failed to retrieve reviews" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = CreateReviewSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid review data" },
        { status: 400 }
      );
    }

    const newReview = addReview({
      productId: parsed.data.productId,
      authorName: parsed.data.authorName.trim(),
      rating: parsed.data.rating,
      comment: parsed.data.comment.trim(),
      verified: true,
    });

    const ratingSummary = getProductRating(parsed.data.productId);

    return NextResponse.json({
      success: true,
      review: newReview,
      rating: ratingSummary,
    });
  } catch (err) {
    console.error("Create review error:", err);
    return NextResponse.json(
      { error: "Failed to submit review" },
      { status: 500 }
    );
  }
}
