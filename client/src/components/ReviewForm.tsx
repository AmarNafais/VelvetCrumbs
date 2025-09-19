import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Review } from "@shared/schema";

interface ReviewFormProps {
  productId: string;
}

export default function ReviewForm({ productId }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if user has already reviewed this product
  const { data: existingReview } = useQuery({
    queryKey: ["/api/user/reviews/check", productId],
    queryFn: () => fetch(`/api/user/reviews/check/${productId}`).then(res => res.json()),
    enabled: !!user,
  });

  const createReviewMutation = useMutation({
    mutationFn: (reviewData: { productId: string; rating: number; reviewText: string }) =>
      apiRequest("POST", `/api/reviews`, reviewData),
    onSuccess: () => {
      toast({
        title: "Review submitted!",
        description: "Thank you for your feedback.",
      });
      setRating(0);
      setReviewText("");
      // Invalidate and refetch reviews
      queryClient.invalidateQueries({ queryKey: ["/api/products", productId, "reviews"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products", productId, "rating-stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/reviews/check", productId] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit review",
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

    createReviewMutation.mutate({
      productId,
      rating,
      reviewText: reviewText.trim(),
    });
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">
            Please log in to leave a review.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (existingReview?.hasReviewed) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">
            You have already reviewed this product.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="review-form">
      <CardHeader>
        <CardTitle>Write a Review</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
                  data-testid={`rating-star-${i + 1}`}
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
              data-testid="review-text"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={createReviewMutation.isPending || !rating || !reviewText.trim()}
            data-testid="button-submit-review"
          >
            {createReviewMutation.isPending ? "Submitting..." : "Submit Review"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}