"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/star-rating";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import type { Vendor, ApiResponse, PaginatedResponse } from "@/lib/types";
import { Search, Trash2, Eye, ToggleLeft, ToggleRight } from "lucide-react";
import Link from "next/link";

export default function AdminVendorsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 15;

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    if (user.role !== "ADMIN") { router.push("/"); return; }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: String(LIMIT), page: String(page) });
    if (search) params.set("search", search);
    api.get<PaginatedResponse<Vendor>>(`/vendors?${params}`)
      .then(r => { setVendors(r.data.items); setTotal(r.data.pagination.totalItems); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, page]);

  async function toggleActive(vendor: Vendor) {
    await api.put(`/vendors/${vendor.id}`, { isActive: !vendor.isActive });
    setVendors(prev => prev.map(v => v.id === vendor.id ? { ...v, isActive: !v.isActive } : v));
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this vendor?")) return;
    await api.delete(`/vendors/${id}`);
    setVendors(prev => prev.filter(v => v.id !== id));
    setTotal(t => t - 1);
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-6xl w-full px-4 py-8">
        <h1 className="font-heading text-3xl font-bold mb-6">Vendors</h1>
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search vendors..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-10" />
          </div>
          <span className="flex items-center text-sm text-muted-foreground">{total} total</span>
        </div>

        {loading ? (
          <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-14 rounded-xl bg-muted animate-pulse" />)}</div>
        ) : (
          <div className="rounded-2xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  {["Vendor", "City", "Rating", "Status", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {vendors.map(v => (
                  <tr key={v.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{v.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{v.city}</td>
                    <td className="px-4 py-3"><StarRating rating={v.avgRating} /></td>
                    <td className="px-4 py-3"><Badge variant={v.isActive ? "success" : "secondary"}>{v.isActive ? "Active" : "Inactive"}</Badge></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link href={`/vendors/${v.id}`}><button className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground"><Eye className="h-4 w-4" /></button></Link>
                        <button onClick={() => toggleActive(v)} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground">
                          {v.isActive ? <ToggleRight className="h-4 w-4 text-[oklch(0.55_0.18_145)]" /> : <ToggleLeft className="h-4 w-4" />}
                        </button>
                        <button onClick={() => handleDelete(v.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
