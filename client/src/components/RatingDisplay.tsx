import { useQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";

interface RatingDisplayProps {
  productId: string;
  showCount?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function RatingDisplay({ 
  productId, 
  showCount = true, 
  className = "",
  size = "md" 
}: RatingDisplayProps) {
  const { data: ratingStats, isLoading } = useQuery<{
    averageRating: number;
    totalReviews: number;
  }>({
    queryKey: ["/api/products", productId, "rating-stats"],
    queryFn: () => fetch(`/api/products/${productId}/rating-stats`).then(res => res.json()),
  });

  if (isLoading) {
    return (
      <div className={`flex items-center ${className}`}>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`${
                size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4"
              } bg-muted rounded animate-pulse`}
            />
          ))}
        </div>
        {showCount && (
          <div 
            className={`ml-2 ${
              size === "sm" ? "h-3 w-12" : "h-4 w-16"
            } bg-muted rounded animate-pulse`}
          />
        )}
      </div>
    );
  }

  const averageRating = ratingStats?.averageRating || 0;
  const totalReviews = ratingStats?.totalReviews || 0;

  const starSize = size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4";
  const textSize = size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm";

  return (
    <div className={`flex items-center ${className}`} data-testid="rating-display">
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`${starSize} ${
              i < Math.floor(averageRating)
                ? "fill-yellow-400 text-yellow-400"
                : i < averageRating
                ? "fill-yellow-200 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
      {showCount && (
        <span 
          className={`ml-2 text-muted-foreground ${textSize}`}
          data-testid="rating-count"
        >
          {totalReviews > 0 ? (
            <>
              ({averageRating.toFixed(1)}) • {totalReviews} review{totalReviews !== 1 ? "s" : ""}
            </>
          ) : (
            "No reviews yet"
          )}
        </span>
      )}
    </div>
  );
}