// components/home/review-card.tsx
import { Review } from "@/types/types";
import { TwitterReview } from "@/components/reviews/twitter-review";
import { FacebookReview } from "@/components/reviews/facebook-review";
import { GoogleReview } from "@/components/reviews/google-review";
import Image from "next/image";

export function ReviewCard({ review }: { review: Review }) {
  // 1. Screenshot override (if imageUrl present)
  if (review.imageUrl) {
    return (
      <div className="mx-3 w-[300px] flex-shrink-0 rounded-xl overflow-hidden shadow-lg">
        <Image
          src={review.imageUrl}
          alt={review.imageAlt || `${review.name}'s review`}
          width={300}
          height={200}
          className="w-full h-auto object-cover"
        />
      </div>
    );
  }

  // 2. Code‑based platform cards
  switch (review.platform) {
    case "twitter":
      return <TwitterReview review={review} />;
    case "facebook":
      return <FacebookReview review={review} />;
    case "google":
      return <GoogleReview review={review} />;
    default:
      // Fallback for unknown platforms (optional)
      return <TwitterReview review={review} />;
  }
}