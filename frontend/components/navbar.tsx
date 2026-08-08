"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Flame, Search, Menu, X, ChefHat, LayoutDashboard, Heart, User, LogOut, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function handleLogout() {
    logout();
    router.push("/");
  }

  const navLinks = user?.role === "VENDOR"
    ? [
        { href: "/vendor/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/vendor/foods", label: "Menu", icon: ChefHat },
        { href: "/vendor/reviews", label: "Reviews", icon: Search },
      ]
    : user?.role === "ADMIN"
    ? [
        { href: "/admin/dashboard", label: "Dashboard", icon: ShieldCheck },
        { href: "/admin/vendors", label: "Vendors", icon: ChefHat },
        { href: "/admin/customers", label: "Users", icon: LayoutDashboard },
        { href: "/admin/reviews", label: "Reviews", icon: Search },
        { href: "/admin/categories", label: "Categories", icon: LayoutDashboard },
        { href: "/admin/bulk-upload", label: "Bulk Upload", icon: Search },
      ]
    : [
        { href: "/vendors", label: "Explore", icon: Search },
        { href: "/ai/chat", label: "AI Chat", icon: Flame },
        { href: "/favorites", label: "Favorites", icon: Heart },
      ];

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-heading font-bold text-xl">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Flame className="h-4 w-4" />
            </span>
            <span className="text-foreground">Dilli<span className="text-primary">Bites</span></span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                <Link href="/profile" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium hover:bg-accent transition-colors">
                  <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                    {user.name[0].toUpperCase()}
                  </div>
                  <span className="text-foreground">{user.name.split(" ")[0]}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <Link href="/login" className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                  Sign in
                </Link>
                <Link href="/register" className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                  Get started
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden p-2 rounded-lg hover:bg-accent" onClick={() => setOpen(!open)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-background px-4 py-3 space-y-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
          <div className="pt-2 border-t border-border mt-2">
            {user ? (
              <>
                <Link href="/profile" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-accent transition-colors">
                  <User className="h-4 w-4" /> Profile
                </Link>
                <button onClick={() => { handleLogout(); setOpen(false); }} className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors">
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-accent transition-colors">Sign in</Link>
                <Link href="/register" onClick={() => setOpen(false)} className="flex items-center justify-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-primary text-primary-foreground mt-1">Get started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
