import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Star, User, Edit2, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import EditReviewForm from "./EditReviewForm";
import type { ReviewWithUser } from "@shared/schema";

interface ReviewsListProps {
  productId: string;
}

export default function ReviewsList({ productId }: ReviewsListProps) {
  const [editingReview, setEditingReview] = useState<ReviewWithUser | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: reviews, isLoading } = useQuery<ReviewWithUser[]>({
    queryKey: ["/api/products", productId, "reviews"],
    queryFn: () => fetch(`/api/products/${productId}/reviews`).then(res => res.json()),
  });

  const deleteReviewMutation = useMutation({
    mutationFn: (reviewId: string) =>
      apiRequest("DELETE", `/api/reviews/${reviewId}`),
    onSuccess: () => {
      toast({
        title: "Review deleted",
        description: "Your review has been successfully deleted.",
      });
      // Invalidate and refetch reviews
      queryClient.invalidateQueries({ queryKey: ["/api/products", productId, "reviews"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products", productId, "rating-stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete review",
        variant: "destructive",
      });
    },
  });

  const handleDeleteReview = (reviewId: string) => {
    deleteReviewMutation.mutate(reviewId);
  };

  if (isLoading) {
    return (
      <div className="space-y-4" data-testid="reviews-loading">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
                  <div className="h-4 bg-muted rounded animate-pulse w-24" />
                  <div className="h-4 bg-muted rounded animate-pulse w-16" />
                </div>
                <div className="h-4 bg-muted rounded animate-pulse w-full" />
                <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <Card data-testid="no-reviews">
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">
            No reviews yet. Be the first to review this product!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4" data-testid="reviews-list">
      {reviews.map((review) => (
        <Card key={review.id} data-testid={`review-${review.id}`}>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {/* Review Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="font-medium" data-testid={`reviewer-name-${review.id}`}>
                      {review.user.firstName} {review.user.lastName}
                    </div>
                    <div className="text-sm text-muted-foreground" data-testid={`review-date-${review.id}`}>
                      {review.createdAt ? formatDistanceToNow(new Date(review.createdAt), { addSuffix: true }) : "Recently"}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Rating Stars */}
                  <div className="flex items-center gap-1" data-testid={`review-rating-${review.id}`}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                    <span className="ml-1 text-sm text-muted-foreground">
                      {review.rating}
                    </span>
                  </div>

                  {/* Edit/Delete buttons for user's own reviews */}
                  {user && user.id === review.userId && (
                    <div className="flex items-center gap-1 ml-2">
                      {/* Edit Review Dialog */}
                      <Dialog open={editingReview?.id === review.id} onOpenChange={(open) => !open && setEditingReview(null)}>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingReview(review)}
                            data-testid={`button-edit-review-${review.id}`}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Edit Review</DialogTitle>
                          </DialogHeader>
                          <EditReviewForm
                            review={review}
                            productId={productId}
                            onSuccess={() => setEditingReview(null)}
                          />
                        </DialogContent>
                      </Dialog>

                      {/* Delete Review Confirmation */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            data-testid={`button-delete-review-${review.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Review</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this review? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteReview(review.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              data-testid={`confirm-delete-review-${review.id}`}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
              </div>

              {/* Review Text */}
              {review.reviewText && (
                <p 
                  className="text-muted-foreground leading-relaxed"
                  data-testid={`review-text-${review.id}`}
                >
                  {review.reviewText}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}