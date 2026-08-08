"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import { VendorCard } from "@/components/vendor-card";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import type { Vendor, ApiResponse } from "@/lib/types";
import { Heart } from "lucide-react";

export default function FavoritesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    api.get<ApiResponse<{ vendorId: number; vendor: Vendor }[]>>("/users/favorites")
      .then(r => setVendors(r.data.map((f: any) => f.vendor ?? f)))
      .catch(() => setVendors([]))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-5xl w-full px-4 py-8">
        <h1 className="font-heading text-3xl font-bold text-foreground mb-6">My Favorites</h1>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-64 rounded-2xl bg-muted animate-pulse" />)}
          </div>
        ) : vendors.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Heart className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No favorites yet</p>
            <p className="text-sm">Heart a vendor to save it here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {vendors.map(v => <VendorCard key={v.id} vendor={v} />)}
          </div>
        )}
      </div>
    </div>
  );
}
