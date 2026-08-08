"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, Flame, Sparkles, MapPin, Star, ArrowRight, ChefHat, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VendorCard } from "@/components/vendor-card";
import Navbar from "@/components/navbar";
import { api } from "@/lib/api";
import type { Vendor, PaginatedResponse } from "@/lib/types";

const CATEGORIES = ["Chaat", "Momos", "Parathas", "Biryani", "Kebabs", "Sweets", "Juice", "Rolls"];

const STATS = [
  { label: "Street Vendors", value: "500+", icon: ChefHat, color: "text-primary" },
  { label: "Happy Foodies", value: "10K+", icon: Star, color: "text-[oklch(0.78_0.18_65)]" },
  { label: "AI Powered", value: "100%", icon: Zap, color: "text-[oklch(0.68_0.2_355)]" },
];

export default function HomePage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [vendors, setVendors] = useState<Vendor[]>([]);

  useEffect(() => {
    api.get<PaginatedResponse<Vendor>>("/vendors?limit=6&sort=avgRating&order=desc")
      .then(r => setVendors(r.data.items))
      .catch(() => {});
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-accent/30 to-primary/5 py-20 md:py-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-10 right-10 h-80 w-80 rounded-full bg-[oklch(0.68_0.2_355)]/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[oklch(0.78_0.18_65)]/8 blur-3xl" />
        </div>
        <div className="mx-auto max-w-4xl px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            AI-powered street food discovery
          </div>
          <h1 className="font-heading text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6">
            Delhi's best<br />
            <span className="text-primary">street food</span>,<br />
            discovered.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Ask anything — "best momos near Lajpat Nagar", "spicy chaat under ₹50" — and our AI finds it for you.
          </p>
          <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search vendors, dishes, areas..."
                className="pl-10 h-12 rounded-xl text-base"
              />
            </div>
            <Button type="submit" size="lg" className="h-12 px-6 rounded-xl">
              Search
            </Button>
          </form>
          <Link href="/ai/chat" className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:underline">
            <Flame className="h-4 w-4" />
            Try AI food chat instead
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="grid grid-cols-3 gap-4 md:gap-8">
            {STATS.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="flex flex-col items-center gap-1 text-center">
                <Icon className={`h-5 w-5 ${color} mb-1`} />
                <span className="font-heading text-2xl md:text-3xl font-bold text-foreground">{value}</span>
                <span className="text-xs md:text-sm text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 px-4">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-heading text-2xl font-bold text-foreground mb-6">Browse by category</h2>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <Link
                key={cat}
                href={`/vendors?category=${cat.toLowerCase()}`}
                className="px-4 py-2 rounded-full border border-border bg-card text-sm font-medium text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-150"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured vendors */}
      <section className="py-8 px-4 pb-20">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading text-2xl font-bold text-foreground">Top rated vendors</h2>
            <Link href="/vendors" className="flex items-center gap-1 text-sm text-primary font-medium hover:underline">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {vendors.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {vendors.map(v => <VendorCard key={v.id} vendor={v} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-16 px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Own a street food stall?
          </h2>
          <p className="text-primary-foreground/80 mb-8">
            Join DilliBites and reach thousands of hungry foodies in Delhi.
          </p>
          <Link href="/register?role=VENDOR">
            <Button variant="secondary" size="lg">
              Register your stall
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border py-8 px-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} DilliBites — Delhi's AI Street Food Platform
      </footer>
    </div>
  );
}
