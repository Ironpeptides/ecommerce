// components/home/reviews-marquee.tsx
"use client";

import Marquee from "react-fast-marquee";
import { ReviewCard } from "./review-card";
import { Review } from "@/types/types";


export function ReviewsMarquee({ reviews }: { reviews: Review[] }) {
  return (
    <Marquee
      gradient={false}
      speed={40}
      pauseOnHover
      className="overflow-hidden py-4"
    >
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </Marquee>
  );
}