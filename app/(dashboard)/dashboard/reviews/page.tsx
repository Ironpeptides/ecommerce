// app/dashboard/reviews/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Star, Edit2, Trash2, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";

// Types
type Review = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  product: {
    id: string;
    name: string;
    images: { url: string }[];
  };
};

export default function ReviewsPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Edit dialog state
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editRating, setEditRating] = useState<number>(0);
  const [editComment, setEditComment] = useState<string>("");
  const [updating, setUpdating] = useState(false);
  
  // Delete dialog state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch user's reviews
  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("/api/reviews");
      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }
      
      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // Handle update review
  const handleUpdate = async () => {
    if (!editingReview || editRating === 0) return;

    try {
      setUpdating(true);
      
      const response = await fetch("/api/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewId: editingReview.id,
          rating: editRating,
          comment: editComment.trim() || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update review");
      }

      toast.success("Review updated successfully");
      
      // Update local state
      setReviews(reviews.map(r => 
        r.id === editingReview.id 
          ? { ...r, rating: editRating, comment: editComment.trim() || null, updatedAt: new Date().toISOString() }
          : r
      ));
      
      setEditingReview(null);
    } catch (err) {
      toast.error("Failed to update review");
    } finally {
      setUpdating(false);
    }
  };

  // Handle delete review (you'll need to create this API route)
  const handleDelete = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete review");
      }

      toast.success("Review deleted successfully");
      setReviews(reviews.filter(r => r.id !== reviewId));
      setDeletingId(null);
    } catch (err) {
      toast.error("Failed to delete review");
    }
  };

  // Star rating component
  const StarRating = ({ rating, onRate, interactive = false }: { 
    rating: number; 
    onRate?: (rating: number) => void;
    interactive?: boolean;
  }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onRate?.(star)}
          className={`${
            interactive ? "cursor-pointer hover:scale-110 transition-transform" : "cursor-default"
          }`}
        >
          <Star
            className={`h-5 w-5 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        </button>
      ))}
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h2 className="text-xl font-semibold">Failed to load reviews</h2>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={fetchReviews}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Reviews</h1>
          <p className="text-muted-foreground mt-1">
            Manage your product reviews
          </p>
        </div>
        <Button onClick={fetchReviews} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      {reviews.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Star className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              You haven't written any reviews. Reviews help other customers make better decisions.
            </p>
            <Button onClick={() => router.push("/dashboard/orders")}>
              View Your Orders
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  {/* Product Image */}
                  {review.product.images[0] && (
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <Image
                        src={review.product.images[0].url}
                        alt={review.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Link 
                          href={`/products/${review.product.id}`}
                          className="font-semibold text-lg hover:underline"
                        >
                          {review.product.name}
                        </Link>
                        <div className="mt-1">
                          <StarRating rating={review.rating} />
                        </div>
                      </div>
                      
                      <div className="flex gap-2 flex-shrink-0">
                        {/* Edit Button */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingReview(review);
                                setEditRating(review.rating);
                                setEditComment(review.comment || "");
                              }}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Review</DialogTitle>
                              <DialogDescription>
                                Update your review for {review.product.name}
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4 py-4">
                              <div>
                                <label className="text-sm font-medium mb-2 block">
                                  Rating
                                </label>
                                <StarRating 
                                  rating={editRating} 
                                  onRate={setEditRating}
                                  interactive 
                                />
                              </div>
                              
                              <div>
                                <label className="text-sm font-medium mb-2 block">
                                  Comment
                                </label>
                                <Textarea
                                  placeholder="Share your experience with this product..."
                                  value={editComment}
                                  onChange={(e) => setEditComment(e.target.value)}
                                  rows={4}
                                />
                              </div>
                            </div>
                            
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setEditingReview(null)}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={handleUpdate}
                                disabled={updating || editRating === 0}
                              >
                                {updating ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : null}
                                Update Review
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        
                        {/* Delete Button */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Delete Review</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to delete your review for {review.product.name}? This action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setDeletingId(null)}>
                                Cancel
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => handleDelete(review.id)}
                                disabled={deletingId === review.id}
                              >
                                {deletingId === review.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : null}
                                Delete
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                    
                    {/* Review Comment */}
                    {review.comment && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {review.comment}
                      </p>
                    )}
                    
                    {/* Date */}
                    <div className="flex gap-2 mt-3 text-xs text-muted-foreground">
                      <span>
                        Reviewed on {new Date(review.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                      {review.updatedAt !== review.createdAt && (
                        <>
                          <span>•</span>
                          <span>Updated</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}