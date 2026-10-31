"use client";

import React, { useState, useEffect } from "react";
import { Review } from "@/types";
import { Star, CheckCircle, MessageSquare, Send } from "lucide-react";

interface ProductReviewsProps {
  productId: string;
  initialReviews?: Review[];
}

export default function ProductReviews({
  productId,
  initialReviews = [],
}: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [ratingSummary, setRatingSummary] = useState({
    average: 5.0,
    count: initialReviews.length,
  });

  // Form State
  const [authorName, setAuthorName] = useState("");
  const [selectedRating, setSelectedRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch reviews if not provided
  useEffect(() => {
    async function loadReviews() {
      try {
        const res = await fetch(`/api/reviews?productId=${productId}`);
        const data = await res.json();
        if (data.success) {
          setReviews(data.reviews);
          setRatingSummary(data.rating);
        }
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
      }
    }

    if (initialReviews.length === 0) {
      loadReviews();
    }
  }, [productId, initialReviews.length]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!authorName.trim()) {
      setErrorMessage("Please enter your name");
      return;
    }
    if (!comment.trim()) {
      setErrorMessage("Please enter your review feedback");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          authorName: authorName.trim(),
          rating: selectedRating,
          comment: comment.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit review");
      }

      setReviews((prev) => [data.review, ...prev]);
      setRatingSummary(data.rating);
      setAuthorName("");
      setComment("");
      setSelectedRating(5);
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error submitting review";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pt-8 border-t border-[#E9E5FF]">
      {/* Reviews Header & Score */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-extrabold text-[#22212B]">
            Verified Customer Reviews
          </h3>
          <p className="text-xs text-[#777486] mt-0.5">
            Real feedback from creators, developers, and students who purchased this resource.
          </p>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#FAF9FF] border border-[#E9E5FF]">
          <div className="flex items-center text-amber-500">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className="w-4 h-4 fill-amber-400 text-amber-400"
              />
            ))}
          </div>
          <span className="text-sm font-extrabold text-[#22212B]">
            {ratingSummary.average.toFixed(1)} / 5.0
          </span>
          <span className="text-xs text-[#777486]">
            ({reviews.length} reviews)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Reviews List */}
        <div className="lg:col-span-7 space-y-4">
          {reviews.length === 0 ? (
            <div className="p-8 text-center bg-[#FAF9FF] rounded-3xl border border-[#E9E5FF] text-xs text-[#777486]">
              No reviews submitted yet. Be the first to leave a verified review below!
            </div>
          ) : (
            reviews.map((r) => (
              <div
                key={r.id}
                className="p-5 rounded-2xl bg-white border border-[#E9E5FF] space-y-2.5 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#22212B]">
                      {r.authorName}
                    </span>
                    {r.verified && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle className="w-2.5 h-2.5" />
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-[#777486]">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3.5 h-3.5 ${
                        star <= r.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>

                <p className="text-xs text-[#555263] leading-relaxed">
                  {r.comment}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Right Column: Write a Review Form */}
        <div className="lg:col-span-5">
          <div className="p-6 rounded-3xl bg-[#FAF9FF] border border-[#E9E5FF] space-y-4 shadow-xs sticky top-24">
            <div className="flex items-center gap-2 font-bold text-xs text-[#22212B]">
              <MessageSquare className="w-4 h-4 text-[#7060F5]" />
              <span>Leave a Review</span>
            </div>

            {submitSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Thank you! Your review has been posted.</span>
              </div>
            )}

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#22212B] mb-1">
                  Rating
                </label>
                <div className="flex items-center gap-1.5 cursor-pointer">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setSelectedRating(star)}
                      className="p-1 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= selectedRating
                            ? "fill-amber-400 text-amber-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-semibold text-[#777486] ml-2">
                    {selectedRating} out of 5 stars
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#22212B] mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya R."
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E9E5FF] outline-none focus:border-[#7060F5] text-xs font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-[#22212B] mb-1">
                  Your Feedback *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="How did this product help your project or study routine?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E9E5FF] outline-none focus:border-[#7060F5] text-xs font-medium resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-full bg-[#22212B] hover:bg-[#7060F5] text-white font-bold text-xs transition-colors shadow-2xs disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? "Submitting..." : "Submit Review"}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
