// components/reviews/facebook-review.tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Review } from "@/types/types";
import { ThumbsUp, MessageCircle, Share2 } from "lucide-react";

export function FacebookReview({ review }: { review: Review }) {
  return (
    <div className="w-[340px] bg-white rounded-lg shadow-md border border-gray-200 flex-shrink-0 mx-2 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 pb-0">
        <Avatar className="h-10 w-10">
          <AvatarImage src={review.avatarUrl} alt={review.name} />
          <AvatarFallback className="bg-blue-100 text-blue-600">
            {review.name[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-sm text-black">{review.name}</p>
          <p className="text-gray-500 text-xs">
            {review.date ?? "2 hrs ago"} · 🌐
          </p>
        </div>
      </div>
      {/* Text */}
      <p className="px-3 py-2 text-sm text-gray-800">{review.text}</p>
      {/* Like/Comment/Share bar */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-gray-100 text-gray-500 text-xs">
        <span className="flex items-center gap-1">
          <ThumbsUp className="h-3.5 w-3.5" /> {review.likes ?? 0}
        </span>
        <span>{review.comments ?? 0} Comments</span>
        <span>{review.shares ?? 0} Shares</span>
      </div>
      {/* Action buttons */}
      <div className="flex border-t border-gray-100 text-gray-600 text-xs font-semibold">
        <button className="flex-1 py-2 flex items-center justify-center gap-1 hover:bg-gray-50">
          <ThumbsUp className="h-4 w-4" /> Like
        </button>
        <button className="flex-1 py-2 flex items-center justify-center gap-1 hover:bg-gray-50">
          <MessageCircle className="h-4 w-4" /> Comment
        </button>
        <button className="flex-1 py-2 flex items-center justify-center gap-1 hover:bg-gray-50">
          <Share2 className="h-4 w-4" /> Share
        </button>
      </div>
    </div>
  );
}