"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./use-auth";
import type { Role } from "@/lib/types";

/** Redirects to /login if not authenticated, or / if wrong role. Returns true when safe to render. */
export function useRequireAuth(role?: Role): boolean {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace("/login"); return; }
    if (role && user.role !== role) router.replace("/");
  }, [loading, user, role, router]);

  if (loading) return false;
  if (!user) return false;
  if (role && user.role !== role) return false;
  return true;
}

/** Redirects already-authenticated users away from auth pages to their dashboard. */
export function useRedirectIfAuthed() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || !user) return;
    if (user.role === "ADMIN") router.replace("/admin/dashboard");
    else if (user.role === "VENDOR") router.replace("/vendor/dashboard");
    else router.replace("/");
  }, [loading, user, router]);
}
