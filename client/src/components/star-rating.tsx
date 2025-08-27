import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  className?: string;
}

export default function StarRating({ rating, className = "" }: StarRatingProps) {
  return (
    <div className={`flex gap-1 ${className}`} data-testid="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
          data-testid={`star-${star}`}
        />
      ))}
    </div>
  );
}
