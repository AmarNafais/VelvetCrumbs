import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Review } from "@shared/schema";

interface EditReviewFormProps {
  review: Review;
  productId: string;
  onSuccess?: () => void;
}

export default function EditReviewForm({ review, productId, onSuccess }: EditReviewFormProps) {
  const [rating, setRating] = useState(review.rating);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState(review.reviewText || "");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateReviewMutation = useMutation({
    mutationFn: (reviewData: { rating: number; reviewText: string }) =>
      apiRequest("PUT", `/api/reviews/${review.id}`, reviewData),
    onSuccess: () => {
      toast({
        title: "Review updated!",
        description: "Your review has been successfully updated.",
      });
      // Invalidate and refetch reviews
      queryClient.invalidateQueries({ queryKey: ["/api/products", productId, "reviews"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products", productId, "rating-stats"] });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update review",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating || !reviewText.trim()) {
      toast({
        title: "Error", 
        description: "Please provide both a rating and review text",
        variant: "destructive",
      });
      return;
    }

    updateReviewMutation.mutate({
      rating,
      reviewText: reviewText.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-testid="edit-review-form">
      {/* Star Rating */}
      <div>
        <label className="block text-sm font-medium mb-2">Rating</label>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setRating(i + 1)}
              onMouseEnter={() => setHoveredRating(i + 1)}
              onMouseLeave={() => setHoveredRating(0)}
              className="p-1 hover:scale-110 transition-transform"
              data-testid={`edit-rating-star-${i + 1}`}
            >
              <Star
                className={`h-6 w-6 ${
                  i < (hoveredRating || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-sm text-muted-foreground">
              {rating} star{rating !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* Review Text */}
      <div>
        <label className="block text-sm font-medium mb-2">Your Review</label>
        <Textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Share your experience with this product..."
          rows={4}
          className="w-full"
          data-testid="edit-review-text"
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        disabled={updateReviewMutation.isPending || !rating || !reviewText.trim()}
        data-testid="button-update-review"
      >
        {updateReviewMutation.isPending ? "Updating..." : "Update Review"}
      </Button>
    </form>
  );
}