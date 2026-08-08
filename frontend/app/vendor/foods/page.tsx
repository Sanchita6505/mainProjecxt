"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { useRequireAuth } from "@/hooks/use-require-auth";
import type { Food, Vendor, ApiResponse, PaginatedResponse } from "@/lib/types";
import { Plus, Pencil, Trash2, Leaf, Flame, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FoodForm { name: string; description: string; price: string; isVeg: boolean; isAvailable: boolean; }
const empty: FoodForm = { name: "", description: "", price: "", isVeg: true, isAvailable: true };

export default function VendorFoodsPage() {
  const { user } = useAuth();
  const ready = useRequireAuth("VENDOR");
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Food | null>(null);
  const [form, setForm] = useState<FoodForm>(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!ready) return;
    api.get<PaginatedResponse<Vendor>>(`/vendors?ownerId=${user!.id}&limit=1`)
      .then(r => {
        const v = r.data.items[0];
        setVendor(v ?? null);
        if (v) return api.get<PaginatedResponse<Food>>(`/foods?vendorId=${v.id}&limit=100`);
      })
      .then(r => r && setFoods(r.data.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [ready]);

  function openEdit(food: Food) {
    setEditing(food);
    setForm({ name: food.name, description: food.description ?? "", price: String(food.price), isVeg: food.isVeg, isAvailable: food.isAvailable });
    setShowForm(true);
  }

  function openNew() { setEditing(null); setForm(empty); setShowForm(true); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!vendor) return;
    setSaving(true);
    const payload = { ...form, price: parseFloat(form.price), vendorId: vendor.id };
    try {
      if (editing) {
        const r = await api.put<ApiResponse<Food>>(`/foods/${editing.id}`, payload);
        setFoods(prev => prev.map(f => f.id === editing.id ? r.data : f));
      } else {
        const r = await api.post<ApiResponse<Food>>("/foods", payload);
        setFoods(prev => [...prev, r.data]);
      }
      setShowForm(false);
    } catch {}
    setSaving(false);
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this item?")) return;
    await api.delete(`/foods/${id}`);
    setFoods(prev => prev.filter(f => f.id !== id));
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-4xl w-full px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-heading text-3xl font-bold">Menu Management</h1>
          <Button onClick={openNew}><Plus className="h-4 w-4" /> Add item</Button>
        </div>

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-semibold text-lg">{editing ? "Edit item" : "Add item"}</h2>
                <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-1.5"><Label>Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
                <div className="space-y-1.5"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
                <div className="space-y-1.5"><Label>Price (₹)</Label><Input type="number" min="0" step="0.5" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required /></div>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isVeg} onChange={e => setForm(f => ({ ...f, isVeg: e.target.checked }))} className="rounded" />
                    <span className="text-sm">Vegetarian</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isAvailable} onChange={e => setForm(f => ({ ...f, isAvailable: e.target.checked }))} className="rounded" />
                    <span className="text-sm">Available</span>
                  </label>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button type="submit" loading={saving} className="flex-1">{editing ? "Save" : "Add"}</Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {!ready || loading ? (
          <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}</div>
        ) : foods.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border border-dashed border-border text-muted-foreground">
            <p className="font-medium">No menu items yet</p>
            <p className="text-sm">Add your first item to get started</p>
          </div>
        ) : (
          <div className="space-y-2">
            {foods.map(food => (
              <div key={food.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                <span className={cn("h-3 w-3 rounded-sm border-2 shrink-0", food.isVeg ? "border-[oklch(0.55_0.18_145)]" : "border-destructive")}>
                  <span className={cn("block h-1.5 w-1.5 rounded-full m-px", food.isVeg ? "bg-[oklch(0.55_0.18_145)]" : "bg-destructive")} />
                </span>
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-sm">{food.name}</span>
                  {food.description && <p className="text-xs text-muted-foreground truncate">{food.description}</p>}
                </div>
                <span className="text-sm font-semibold">₹{food.price}</span>
                <Badge variant={food.isAvailable ? "success" : "secondary"}>{food.isAvailable ? "Available" : "Unavailable"}</Badge>
                <button onClick={() => openEdit(food)} className="text-muted-foreground hover:text-foreground p-1"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => handleDelete(food.id)} className="text-muted-foreground hover:text-destructive p-1"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
