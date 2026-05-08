// components/reviews/twitter-review.tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Review } from "@/types/types";
import { MessageCircle, Repeat2, Heart, BarChart3 } from "lucide-react";

export function TwitterReview({ review }: { review: Review }) {
  return (
    <div className="w-[340px] bg-black text-white rounded-2xl border border-gray-800 p-4 space-y-3 flex-shrink-0 mx-2">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={review.avatarUrl} alt={review.name} />
          <AvatarFallback>{review.name[0]}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-bold text-[15px] leading-tight">{review.name}</p>
          <p className="text-gray-500 text-[13px]">
            @{review.handle ?? review.name.toLowerCase().replace(/\s/g, "")}
          </p>
        </div>
        <TwitterLogo className="ml-auto h-5 w-5 text-blue-400" />
      </div>
      {/* Text */}
      <p className="text-[15px] leading-normal">{review.text}</p>
      {/* Metrics */}
      <div className="flex justify-between text-gray-500 text-[13px] max-w-xs">
        <span className="flex items-center gap-1">
          <MessageCircle className="h-4 w-4" /> {review.replies ?? 0}
        </span>
        <span className="flex items-center gap-1">
          <Repeat2 className="h-4 w-4" /> {review.retweets ?? 0}
        </span>
        <span className="flex items-center gap-1">
          <Heart className="h-4 w-4" /> {review.likes ?? 0}
        </span>
        <span className="flex items-center gap-1">
          <BarChart3 className="h-4 w-4" /> 12K
        </span>
      </div>
    </div>
  );
}

// Simple inline Twitter logo (you can also use an SVG from lucide's Twitter icon)
const TwitterLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);