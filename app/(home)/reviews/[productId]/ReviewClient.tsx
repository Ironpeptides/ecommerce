"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type Product = {
  id: string;
  name: string;
  images: { url: string }[];
};

type ExistingReview = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
} | null;

interface ReviewClientProps {
  product: Product;
  existingReview: ExistingReview;
  userId: string;
}

const RATING_LABELS: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very Good",
  5: "Excellent",
};

export function ReviewClient({ product, existingReview, userId }: ReviewClientProps) {
  const router = useRouter();
  const isEdit = !!existingReview;

  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment ?? "");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const activeRating = hovered || rating;

  const submit = async () => {
    if (rating === 0) {
      toast.error("Please select a star rating");
      return;
    }
    if (comment.trim().length < 10) {
      toast.error("Please write at least 10 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          userId,
          rating,
          comment: comment.trim(),
          ...(isEdit && { reviewId: existingReview.id }),
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Something went wrong");
        return;
      }

      setSubmitted(true);
    } catch {
      toast.error("Something went wrong, please try again");
    } finally {
      setLoading(false);
    }
  };

  // Success screen
  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-5">
          <div className="flex justify-center">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Thank you!</h2>
            <p className="text-muted-foreground text-sm">
              Your review for <span className="font-medium text-foreground">{product.name}</span> has been {isEdit ? "updated" : "submitted"}.
              It helps other buyers make better decisions.
            </p>
          </div>
          <div className="flex gap-3 justify-center pt-2">
            <Link href="/">
              <Button variant="outline">Continue Shopping</Button>
            </Link>
            <Link href="/dashboard/orders/buyer">
              <Button>My Orders</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <Link href="/dashboard/orders/buyer" className="hover:text-foreground transition-colors">My Orders</Link>
          <span>/</span>
          <span className="text-foreground font-medium">Write a Review</span>
        </div>

        {/* Back button */}
        <Link href="/dashboard/orders/buyer">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground mb-6 -ml-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Button>
        </Link>

        <div className="space-y-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight mb-1">
              {isEdit ? "Edit Your Review" : "Write a Review"}
            </h1>
            <p className="text-muted-foreground text-sm">
              Share your honest experience to help other buyers.
            </p>
          </div>

          {/* Product card */}
          <div className="flex items-center gap-4 p-4 rounded-xl border bg-muted/40">
            <div className="relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden border bg-background">
              {product.images?.[0]?.url && (
                <Image
                  src={product.images[0].url}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                />
              )}
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <p className="font-medium text-sm leading-snug line-clamp-2">
                {product.name}
              </p>
              <Badge variant="secondary" className="w-fit text-xs">
                Verified Purchase
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Star rating */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              Overall Rating <span className="text-destructive">*</span>
            </Label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                  aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                >
                  <Star
                    className={cn(
                      "h-9 w-9 transition-colors",
                      star <= activeRating
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-muted text-muted-foreground"
                    )}
                  />
                </button>
              ))}
              {activeRating > 0 && (
                <span className="ml-2 text-sm font-medium text-muted-foreground">
                  {RATING_LABELS[activeRating]}
                </span>
              )}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label className="text-base font-semibold" htmlFor="comment">
              Your Review <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="comment"
              placeholder="What did you like or dislike? How was the quality, fit, or performance? Be specific — your review helps others make better decisions."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={5}
              className="resize-none"
            />
            <div className="flex justify-between">
              <p className="text-xs text-muted-foreground">Minimum 10 characters</p>
              <p className={cn(
                "text-xs",
                comment.length < 10 ? "text-muted-foreground" : "text-green-600"
              )}>
                {comment.length} characters
              </p>
            </div>
          </div>

          {/* Guidelines */}
          <div className="rounded-lg bg-muted/50 border p-4 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Review Guidelines
            </p>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li>Be honest and specific about your experience</li>
              <li>Do not include personal information or offensive language</li>
              <li>Focus on the product, not the seller or shipping</li>
            </ul>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 gap-2"
              onClick={submit}
              disabled={loading || rating === 0}
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>
              ) : isEdit ? (
                "Update Review"
              ) : (
                "Submit Review"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}