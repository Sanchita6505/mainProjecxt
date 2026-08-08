"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/navbar";
import { StarRating } from "@/components/star-rating";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import type { Vendor, Food, Review, ApiResponse, PaginatedResponse } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import { MapPin, Clock, Phone, Heart, Leaf, Flame, Star, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function VendorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [foods, setFoods] = useState<Food[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState("");
  const [isFav, setIsFav] = useState(false);
  const [tab, setTab] = useState<"menu" | "reviews">("menu");
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<ApiResponse<Vendor>>(`/vendors/${id}`),
      api.get<PaginatedResponse<Food>>(`/foods?vendorId=${id}&limit=50`),
      // reviews are fetched via the review service filtered by vendorId
      api.get<ApiResponse<Review[]>>(`/reviews?vendorId=${id}`).catch(() => null),
    ]).then(([v, f, r]) => {
      setVendor(v.data);
      setFoods(f.data.items);
      if (r) setReviews(r.data as Review[]);
    }).catch(() => {}).finally(() => setLoading(false));

    if (user) {
      api.get<ApiResponse<{ vendorId: number }[]>>("/users/favorites")
        .then(r => setIsFav(r.data.some((f: any) => String(f.vendorId ?? f.id) === String(id))))
        .catch(() => {});
    }

    api.post<ApiResponse<{ summary: string }>>("/ai/review-summary", { vendorId: Number(id) })
      .then(r => setSummary(r.data.summary))
      .catch(() => {});
  }, [id, user]);

  async function toggleFav() {
    if (!user) return;
    if (isFav) {
      await api.delete(`/users/favorites/${id}`);
    } else {
      await api.post(`/users/favorites/${id}`, {});
    }
    setIsFav(!isFav);
  }

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    try {
      const r = await api.post<ApiResponse<Review>>("/reviews", { vendorId: Number(id), rating: reviewRating, text: reviewText });
      setReviews(prev => [r.data, ...prev]);
      setReviewText("");
      setReviewRating(5);
    } catch {}
    setSubmitting(false);
  }

  if (loading) return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-4xl w-full px-4 py-8 space-y-4">
        <div className="h-64 rounded-2xl bg-muted animate-pulse" />
        <div className="h-8 w-48 rounded-lg bg-muted animate-pulse" />
        <div className="h-4 w-full rounded bg-muted animate-pulse" />
      </div>
    </div>
  );

  if (!vendor) return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 flex items-center justify-center text-muted-foreground">Vendor not found</div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-4xl w-full px-4 py-8">
        {/* Hero */}
        <div className="relative h-56 md:h-72 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-[oklch(0.68_0.2_355)]/20 mb-6">
          {vendor.imageUrl && <img src={vendor.imageUrl} alt={vendor.name} className="h-full w-full object-cover" />}
          <button
            onClick={toggleFav}
            className={cn("absolute top-4 right-4 h-10 w-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-all", isFav ? "bg-[oklch(0.68_0.2_355)] text-white" : "bg-background/80 text-muted-foreground hover:text-[oklch(0.68_0.2_355)]")}
          >
            <Heart className={cn("h-5 w-5", isFav && "fill-current")} />
          </button>
        </div>

        {/* Info */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">{vendor.name}</h1>
            {vendor.categories && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {vendor.categories.map(c => <Badge key={c.id}>{c.name}</Badge>)}
              </div>
            )}
            {vendor.description && <p className="text-muted-foreground mt-3 text-sm leading-relaxed">{vendor.description}</p>}
          </div>
          <div className="shrink-0 text-right">
            <StarRating rating={vendor.avgRating} size="md" />
            <p className="text-xs text-muted-foreground mt-1">{vendor.reviewCount} reviews</p>
          </div>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
          {vendor.address && <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{vendor.address}</span>}
          {vendor.openingTime && <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{vendor.openingTime} – {vendor.closingTime}</span>}
          {vendor.phone && <span className="flex items-center gap-1.5"><Phone className="h-4 w-4" />{vendor.phone}</span>}
        </div>

        {/* AI Summary */}
        {summary && (
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 mb-6">
            <div className="flex items-center gap-2 text-primary text-sm font-semibold mb-2">
              <Sparkles className="h-4 w-4" /> AI Review Summary
            </div>
            <p className="text-sm text-foreground leading-relaxed">{summary}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border mb-6">
          {(["menu", "reviews"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn("px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px", tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}
            >
              {t} {t === "reviews" && `(${reviews.length})`}
            </button>
          ))}
        </div>

        {tab === "menu" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {foods.length === 0 ? (
              <p className="text-muted-foreground col-span-2 py-8 text-center">No menu items listed yet.</p>
            ) : foods.map(food => (
              <div key={food.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                <div className="h-14 w-14 rounded-lg bg-muted overflow-hidden shrink-0">
                  {food.imageUrl ? <img src={food.imageUrl} alt={food.name} className="h-full w-full object-cover" /> : (
                    <div className="h-full w-full flex items-center justify-center">
                      {food.isVeg ? <Leaf className="h-5 w-5 text-[oklch(0.55_0.18_145)]" /> : <Flame className="h-5 w-5 text-primary" />}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={cn("h-3 w-3 rounded-sm border-2 shrink-0", food.isVeg ? "border-[oklch(0.55_0.18_145)]" : "border-destructive")}>
                      <span className={cn("block h-1.5 w-1.5 rounded-full m-px", food.isVeg ? "bg-[oklch(0.55_0.18_145)]" : "bg-destructive")} />
                    </span>
                    <span className="font-medium text-sm text-foreground truncate">{food.name}</span>
                  </div>
                  {food.description && <p className="text-xs text-muted-foreground truncate mt-0.5">{food.description}</p>}
                </div>
                <span className="font-semibold text-sm text-foreground shrink-0">₹{food.price}</span>
              </div>
            ))}
          </div>
        )}

        {tab === "reviews" && (
          <div className="space-y-4">
            {user && (
              <form onSubmit={submitReview} className="rounded-xl border border-border bg-card p-4 space-y-3">
                <p className="font-medium text-sm">Write a review</p>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} type="button" onClick={() => setReviewRating(s)}>
                      <Star className={cn("h-5 w-5 transition-colors", s <= reviewRating ? "fill-[oklch(0.78_0.18_65)] text-[oklch(0.78_0.18_65)]" : "text-muted-foreground/30")} />
                    </button>
                  ))}
                </div>
                <Textarea placeholder="Share your experience..." value={reviewText} onChange={e => setReviewText(e.target.value)} />
                <Button type="submit" size="sm" loading={submitting}>Post review</Button>
              </form>
            )}
            {reviews.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No reviews yet. Be the first!</p>
            ) : reviews.map(r => (
              <div key={r.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                      {r.user?.name?.[0]?.toUpperCase() ?? "U"}
                    </div>
                    <span className="text-sm font-medium">{r.user?.name ?? "User"}</span>
                  </div>
                  <StarRating rating={r.rating} showValue={false} />
                </div>
                {r.text && <p className="text-sm text-muted-foreground leading-relaxed">{r.text}</p>}
                <p className="text-xs text-muted-foreground/60 mt-2">{new Date(r.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
