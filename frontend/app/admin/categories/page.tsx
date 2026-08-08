"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import type { Category, ApiResponse } from "@/lib/types";
import { Plus, Trash2, Tag } from "lucide-react";

export default function AdminCategoriesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    if (user.role !== "ADMIN") { router.push("/"); return; }
    api.get<ApiResponse<Category[]>>("/categories")
      .then(r => setCategories(r.data as Category[]))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await api.post<ApiResponse<Category>>("/categories", { name, slug: slug || name.toLowerCase().replace(/\s+/g, "-") });
      setCategories(prev => [...prev, r.data]);
      setName(""); setSlug("");
    } catch {}
    setSaving(false);
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this category?")) return;
    await api.delete(`/categories/${id}`);
    setCategories(prev => prev.filter(c => c.id !== id));
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-2xl w-full px-4 py-8">
        <h1 className="font-heading text-3xl font-bold mb-6">Categories</h1>

        <div className="rounded-2xl border border-border bg-card p-5 mb-6">
          <h2 className="font-semibold text-sm mb-3">Add category</h2>
          <form onSubmit={handleCreate} className="flex gap-2">
            <Input placeholder="Name (e.g. Chaat)" value={name} onChange={e => setName(e.target.value)} required />
            <Input placeholder="Slug (auto)" value={slug} onChange={e => setSlug(e.target.value)} className="w-32" />
            <Button type="submit" loading={saving}><Plus className="h-4 w-4" /></Button>
          </form>
        </div>

        {loading ? (
          <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 rounded-xl bg-muted animate-pulse" />)}</div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Tag className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>No categories yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
                <div>
                  <span className="font-medium text-sm">{cat.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground font-mono">/{cat.slug}</span>
                </div>
                <button onClick={() => handleDelete(cat.id)} className="text-muted-foreground hover:text-destructive p-1 rounded-lg hover:bg-destructive/10 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
