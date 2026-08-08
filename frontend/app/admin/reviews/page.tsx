"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StarRating } from "@/components/star-rating";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import type { Review, PaginatedResponse } from "@/lib/types";
import { Search, Trash2, MessageSquare } from "lucide-react";

const LIMIT = 15;

export default function AdminReviewsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [vendorId, setVendorId] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    if (user.role !== "ADMIN") { router.push("/"); return; }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: String(LIMIT), page: String(page) });
    if (vendorId) params.set("vendorId", vendorId);
    api.get<PaginatedResponse<Review>>(`/admin/reviews?${params}`)
      .then(r => { setReviews(r.data.items); setTotal(r.data.pagination.totalItems); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [vendorId, page]);

  async function handleDelete(id: number) {
    if (!confirm("Delete this review?")) return;
    await api.delete(`/admin/reviews/${id}`);
    setReviews(prev => prev.filter(r => r.id !== id));
    setTotal(t => t - 1);
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-5xl w-full px-4 py-8">
        <h1 className="font-heading text-3xl font-bold mb-6">Reviews</h1>

        <div className="flex gap-3 mb-6">
          <Input
            placeholder="Filter by vendor ID..."
            value={vendorId}
            onChange={e => { setVendorId(e.target.value); setPage(1); }}
            className="max-w-xs"
          />
          <span className="flex items-center text-sm text-muted-foreground">{total} total</span>
        </div>

        {loading ? (
          <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="font-medium">No reviews found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {reviews.map(r => (
              <div key={r.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <span className="font-medium text-sm">{r.user?.name ?? `User #${r.userId}`}</span>
                      <span className="text-xs text-muted-foreground">→</span>
                      <span className="text-sm text-primary font-medium">{(r as any).vendor?.name ?? `Vendor #${r.vendorId}`}</span>
                      <StarRating rating={r.rating} showValue={false} />
                    </div>
                    {r.text && <p className="text-sm text-muted-foreground line-clamp-2">{r.text}</p>}
                    <p className="text-xs text-muted-foreground/60 mt-1">{new Date(r.createdAt).toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => handleDelete(r.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors shrink-0">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {total > LIMIT && (
          <div className="flex justify-center gap-2 mt-6">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <span className="flex items-center px-3 text-sm text-muted-foreground">Page {page} of {Math.ceil(total / LIMIT)}</span>
            <Button variant="outline" size="sm" disabled={page >= Math.ceil(total / LIMIT)} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        )}
      </div>
    </div>
  );
}
