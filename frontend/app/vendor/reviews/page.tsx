"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/navbar";
import { StarRating } from "@/components/star-rating";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { useRequireAuth } from "@/hooks/use-require-auth";
import type { Review, Vendor, ApiResponse, PaginatedResponse } from "@/lib/types";
import { MessageSquare } from "lucide-react";

export default function VendorReviewsPage() {
  const { user } = useAuth();
  const ready = useRequireAuth("VENDOR");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    api.get<PaginatedResponse<Vendor>>(`/vendors?ownerId=${user!.id}&limit=1`)
      .then(r => {
        const v = r.data.items[0];
        if (v) return api.get<ApiResponse<Review[]>>(`/reviews?vendorId=${v.id}`);
      })
      .then(r => r && setReviews(r.data as Review[]))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [ready]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-3xl w-full px-4 py-8">
        <h1 className="font-heading text-3xl font-bold mb-6">Customer Reviews</h1>
        {!ready || loading ? (
          <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="font-medium">No reviews yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map(r => (
              <div key={r.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                      {r.user?.name?.[0]?.toUpperCase() ?? "U"}
                    </div>
                    <span className="font-medium text-sm">{r.user?.name ?? "Customer"}</span>
                  </div>
                  <StarRating rating={r.rating} showValue={false} />
                </div>
                {r.text && <p className="text-sm text-muted-foreground">{r.text}</p>}
                <p className="text-xs text-muted-foreground/60 mt-2">{new Date(r.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
