import { cn } from "@/lib/utils";
import type { Vendor } from "@/lib/types";
import { StarRating } from "./star-rating";
import { MapPin, Clock, Leaf, Flame } from "lucide-react";
import Link from "next/link";

interface VendorCardProps {
  vendor: Vendor;
  className?: string;
}

export function VendorCard({ vendor, className }: VendorCardProps) {
  const isOpen = (() => {
    if (!vendor.openingTime || !vendor.closingTime) return null;
    const now = new Date();
    const [oh, om] = vendor.openingTime.split(":").map(Number);
    const [ch, cm] = vendor.closingTime.split(":").map(Number);
    const cur = now.getHours() * 60 + now.getMinutes();
    return cur >= oh * 60 + om && cur <= ch * 60 + cm;
  })();

  return (
    <Link href={`/vendors/${vendor.id}`}>
      <div className={cn("group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5 transition-all duration-200", className)}>
        <div className="relative h-44 bg-gradient-to-br from-primary/20 via-[oklch(0.78_0.18_65)]/20 to-[oklch(0.68_0.2_355)]/20 overflow-hidden">
          {vendor.imageUrl ? (
            <img src={vendor.imageUrl} alt={vendor.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <Flame className="h-12 w-12 text-primary/40" />
            </div>
          )}
          {isOpen !== null && (
            <span className={cn("absolute top-3 right-3 text-xs font-semibold px-2 py-0.5 rounded-full", isOpen ? "bg-[oklch(0.55_0.18_145)] text-white" : "bg-muted text-muted-foreground")}>
              {isOpen ? "Open" : "Closed"}
            </span>
          )}
          {vendor.categories && vendor.categories.length > 0 && (
            <span className="absolute top-3 left-3 text-xs font-medium px-2 py-0.5 rounded-full bg-background/80 backdrop-blur-sm text-foreground">
              {vendor.categories[0].name}
            </span>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-heading font-semibold text-base text-foreground truncate">{vendor.name}</h3>
          <div className="flex items-center gap-1.5 mt-1">
            <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground truncate">{vendor.address ?? vendor.city}</span>
          </div>
          <div className="flex items-center justify-between mt-3">
            <StarRating rating={vendor.avgRating} />
            <span className="text-xs text-muted-foreground">{vendor.reviewCount} reviews</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
