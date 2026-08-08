import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: "sm" | "md";
  showValue?: boolean;
}

export function StarRating({ rating, max = 5, size = "sm", showValue = true }: StarRatingProps) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {Array.from({ length: max }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              size === "sm" ? "h-3.5 w-3.5" : "h-4.5 w-4.5",
              i < Math.round(rating) ? "fill-[oklch(0.78_0.18_65)] text-[oklch(0.78_0.18_65)]" : "fill-muted text-muted-foreground/30"
            )}
          />
        ))}
      </div>
      {showValue && <span className="text-xs text-muted-foreground font-medium">{rating.toFixed(1)}</span>}
    </div>
  );
}
