"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/star-rating";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { useRequireAuth } from "@/hooks/use-require-auth";
import type { Vendor, ApiResponse, PaginatedResponse } from "@/lib/types";
import { Star, MessageSquare, UtensilsCrossed, TrendingUp, ChefHat } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function VendorDashboardPage() {
  const { user } = useAuth();
  const ready = useRequireAuth("VENDOR");
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    api.get<PaginatedResponse<Vendor>>(`/vendors?ownerId=${user!.id}&limit=1`)
      .then(r => {
        const v = r.data.items[0];
        if (!v) return null;
        return api.get<ApiResponse<Vendor>>(`/vendors/${v.id}`);
      })
      .then(r => setVendor(r ? r.data : null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [ready]);

  if (!ready || loading) return (
    <div className="flex flex-col min-h-screen"><Navbar />
      <div className="mx-auto max-w-5xl w-full px-4 py-8 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />)}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-5xl w-full px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-3xl font-bold">Vendor Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">Welcome back, {user?.name}</p>
          </div>
        </div>

        {!vendor ? (
          <div className="text-center py-20 rounded-2xl border border-dashed border-border">
            <ChefHat className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
            <p className="font-medium text-lg">No stall registered yet</p>
            <p className="text-muted-foreground text-sm mb-4">Contact admin to register your stall</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Avg Rating", value: vendor.avgRating.toFixed(1), icon: Star, color: "text-[oklch(0.78_0.18_65)]", bg: "bg-[oklch(0.78_0.18_65)]/10" },
                { label: "Total Reviews", value: vendor.reviewCount, icon: MessageSquare, color: "text-primary", bg: "bg-primary/10" },
                { label: "Status", value: vendor.isActive ? "Active" : "Inactive", icon: TrendingUp, color: vendor.isActive ? "text-[oklch(0.55_0.18_145)]" : "text-muted-foreground", bg: vendor.isActive ? "bg-[oklch(0.55_0.18_145)]/10" : "bg-muted" },
                { label: "City", value: vendor.city, icon: UtensilsCrossed, color: "text-[oklch(0.68_0.2_355)]", bg: "bg-[oklch(0.68_0.2_355)]/10" },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <Card key={label}>
                  <CardContent className="p-4">
                    <div className={`h-9 w-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                      <Icon className={`h-4 w-4 ${color}`} />
                    </div>
                    <p className="font-heading text-2xl font-bold text-foreground">{value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="mb-6">
              <CardHeader><CardTitle>Your Stall</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{vendor.name}</h3>
                    {vendor.description && <p className="text-sm text-muted-foreground mt-1">{vendor.description}</p>}
                  </div>
                  <Badge variant={vendor.isActive ? "success" : "secondary"}>{vendor.isActive ? "Active" : "Inactive"}</Badge>
                </div>
                <StarRating rating={vendor.avgRating} size="md" />
                <div className="flex gap-3 pt-2">
                  <Link href="/vendor/foods"><Button variant="outline" size="sm">Manage Menu</Button></Link>
                  <Link href="/vendor/reviews"><Button variant="outline" size="sm">View Reviews</Button></Link>
                  <Link href={`/vendors/${vendor.id}`}><Button variant="ghost" size="sm">Public page</Button></Link>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
