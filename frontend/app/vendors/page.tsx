"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/navbar";
import { VendorCard } from "@/components/vendor-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { Vendor, Category, ApiResponse, PaginatedResponse } from "@/lib/types";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

function VendorList() {
  const searchParams = useSearchParams();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [selectedCat, setSelectedCat] = useState(searchParams.get("category") ?? "");
  const [city, setCity] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 12;

  useEffect(() => {
    api.get<ApiResponse<Category[]>>("/categories")
      .then(r => setCategories(r.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: String(LIMIT), page: String(page) });
    if (search) params.set("search", search);
    if (selectedCat) params.set("category", selectedCat);
    if (city) params.set("city", city);
    api.get<PaginatedResponse<Vendor>>(`/vendors?${params}`)
      .then(r => { setVendors(r.data.items); setTotal(r.data.pagination.totalItems); })
      .catch(() => setVendors([]))
      .finally(() => setLoading(false));
  }, [search, selectedCat, city, page]);

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vendors..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="pl-10"
          />
        </div>
        <Input
          placeholder="City (e.g. Delhi)"
          value={city}
          onChange={e => { setCity(e.target.value); setPage(1); }}
          className="sm:w-40"
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => { setSelectedCat(""); setPage(1); }}
          className={cn("px-3 py-1.5 rounded-full text-sm font-medium border transition-all", !selectedCat ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/40")}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => { setSelectedCat(selectedCat === cat.slug ? "" : cat.slug); setPage(1); }}
            className={cn("px-3 py-1.5 rounded-full text-sm font-medium border transition-all", selectedCat === cat.slug ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/40")}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-64 rounded-2xl bg-muted animate-pulse" />)}
        </div>
      ) : vendors.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Search className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No vendors found</p>
          <p className="text-sm">Try adjusting your filters</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-4">{total} vendors found</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {vendors.map(v => <VendorCard key={v.id} vendor={v} />)}
          </div>
          {total > LIMIT && (
            <div className="flex justify-center gap-2 mt-8">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
              <span className="flex items-center px-3 text-sm text-muted-foreground">Page {page} of {Math.ceil(total / LIMIT)}</span>
              <Button variant="outline" size="sm" disabled={page >= Math.ceil(total / LIMIT)} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          )}
        </>
      )}
    </>
  );
}

export default function VendorsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-7xl w-full px-4 py-8">
        <h1 className="font-heading text-3xl font-bold text-foreground mb-6">Explore vendors</h1>
        <Suspense>
          <VendorList />
        </Suspense>
      </div>
    </div>
  );
}
