"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { useRequireAuth } from "@/hooks/use-require-auth";
import type { User } from "@/lib/types";
import { Save } from "lucide-react";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const ready = useRequireAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [city, setCity] = useState(user?.city ?? "");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) { setName(user.name); setCity(user.city ?? ""); }
  }, [user]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.patch("/users/profile", { name, city });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!ready) return null;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-lg w-full px-4 py-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
            {user.name[0].toUpperCase()}
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold">{user.name}</h1>
            <p className="text-sm text-muted-foreground capitalize">{user.role.toLowerCase()}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold text-base mb-4">Edit profile</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user.email} disabled className="opacity-60" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city">City</Label>
              <Input id="city" value={city} onChange={e => setCity(e.target.value)} placeholder="Delhi" />
            </div>
            {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}
            {success && <p className="text-sm text-[oklch(0.45_0.18_145)] bg-[oklch(0.55_0.18_145)]/10 rounded-lg px-3 py-2">Profile updated!</p>}
            <Button type="submit" loading={saving} className="w-full">
              <Save className="h-4 w-4" /> Save changes
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
