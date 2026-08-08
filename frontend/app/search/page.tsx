"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/navbar";
import { VendorCard } from "@/components/vendor-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { Vendor, ApiResponse } from "@/lib/types";
import { Search as SearchIcon } from "lucide-react";

function SearchResults() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [input, setInput] = useState(searchParams.get("q") ?? "");
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    api.get<ApiResponse<{ vendors: Vendor[]; foods: unknown[] }>>(`/search?q=${encodeURIComponent(query)}`)
      .then(r => setVendors(r.data.vendors ?? []))
      .catch(() => setVendors([]))
      .finally(() => setLoading(false));
  }, [query]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setQuery(input.trim());
  }

  return (
    <>
      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={input} onChange={e => setInput(e.target.value)} placeholder="Search vendors, dishes, areas..." className="pl-10 h-12" />
        </div>
        <Button type="submit" size="lg" className="h-12">Search</Button>
      </form>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-64 rounded-2xl bg-muted animate-pulse" />)}
        </div>
      ) : query && vendors.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <SearchIcon className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No results for "{query}"</p>
        </div>
      ) : vendors.length > 0 ? (
        <>
          <p className="text-sm text-muted-foreground mb-4">{vendors.length} results for "{query}"</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {vendors.map(v => <VendorCard key={v.id} vendor={v} />)}
          </div>
        </>
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          <SearchIcon className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>Enter a search term to find vendors</p>
        </div>
      )}
    </>
  );
}

export default function SearchPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-5xl w-full px-4 py-8">
        <h1 className="font-heading text-3xl font-bold text-foreground mb-6">Search</h1>
        <Suspense>
          <SearchResults />
        </Suspense>
      </div>
    </div>
  );
}
