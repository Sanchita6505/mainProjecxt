"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useRequireAuth } from "@/hooks/use-require-auth";
import type { PaginatedResponse } from "@/lib/types";
import { Users, Store, MessageSquare, Tag, Upload, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const ready = useRequireAuth("ADMIN");
  const [stats, setStats] = useState({ vendors: 0, customers: 0, reviews: 0, categories: 0 });

  useEffect(() => {
    if (!ready) return;
    Promise.all([
      api.get<PaginatedResponse<unknown>>("/vendors?limit=1"),
      api.get<PaginatedResponse<unknown>>("/admin/users?limit=1&role=CUSTOMER"),
      api.get<PaginatedResponse<unknown>>("/admin/reviews?limit=1"),
      api.get<{ data: unknown[] }>("/categories"),
    ]).then(([v, u, r, c]) => {
      setStats({
        vendors: v.data.pagination.totalItems,
        customers: u.data.pagination.totalItems,
        reviews: r.data.pagination.totalItems,
        categories: (c.data as unknown[]).length,
      });
    }).catch(() => {});
  }, [ready]);

  const statCards = [
    { label: "Total Vendors", value: stats.vendors, icon: Store, color: "text-primary", bg: "bg-primary/10", href: "/admin/vendors" },
    { label: "Customers", value: stats.customers, icon: Users, color: "text-[oklch(0.55_0.18_355)]", bg: "bg-[oklch(0.68_0.2_355)]/15", href: "/admin/customers" },
    { label: "Reviews", value: stats.reviews, icon: MessageSquare, color: "text-[oklch(0.55_0.15_65)]", bg: "bg-[oklch(0.78_0.18_65)]/15", href: "/admin/reviews" },
    { label: "Categories", value: stats.categories, icon: Tag, color: "text-[oklch(0.45_0.18_145)]", bg: "bg-[oklch(0.55_0.18_145)]/10", href: "/admin/categories" },
  ];

  const quickLinks = [
    { href: "/admin/vendors", label: "Manage Vendors", icon: Store, color: "bg-primary/10 text-primary" },
    { href: "/admin/customers", label: "Manage Customers", icon: Users, color: "bg-[oklch(0.68_0.2_355)]/15 text-[oklch(0.55_0.18_355)]" },
    { href: "/admin/reviews", label: "Manage Reviews", icon: MessageSquare, color: "bg-[oklch(0.78_0.18_65)]/15 text-[oklch(0.55_0.15_65)]" },
    { href: "/admin/categories", label: "Categories", icon: Tag, color: "bg-[oklch(0.55_0.18_145)]/10 text-[oklch(0.45_0.18_145)]" },
    { href: "/admin/bulk-upload", label: "Bulk Upload", icon: Upload, color: "bg-muted text-muted-foreground" },
  ];

  if (!ready) return (
    <div className="flex flex-col min-h-screen"><Navbar />
      <div className="mx-auto max-w-5xl w-full px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />)}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-5xl w-full px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground text-sm">Platform overview</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map(({ label, value, icon: Icon, color, bg, href }) => (
            <Link key={label} href={href}>
              <Card className="hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer">
                <CardContent className="p-4">
                  <div className={`h-9 w-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                    <Icon className={`h-4 w-4 ${color}`} />
                  </div>
                  <p className="font-heading text-2xl font-bold">{value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickLinks.map(({ href, label, icon: Icon, color }) => (
            <Link key={href} href={href}>
              <div className="rounded-2xl border border-border bg-card p-5 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer">
                <div className={`h-10 w-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
                  <Icon className="h-5 w-5" />
                </div>
                <p className="font-semibold text-sm">{label}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
