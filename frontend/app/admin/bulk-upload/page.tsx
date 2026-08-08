"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { Upload, CheckCircle2, XCircle, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type UploadType = "customers" | "vendors" | "foods" | "reviews";

interface UploadResult { success: boolean; message: string; count?: number; }

export default function AdminBulkUploadPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [selected, setSelected] = useState<UploadType>("vendors");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    if (user.role !== "ADMIN") { router.push("/"); return; }
  }, [user]);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setResult(null);
    const form = new FormData();
    form.append("file", file);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE}/bulk-upload/${selected}`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });
      const json = await res.json();
      setResult({ success: res.ok, message: json.message ?? (res.ok ? "Upload successful" : "Upload failed"), count: json.data?.count });
    } catch {
      setResult({ success: false, message: "Network error" });
    } finally {
      setUploading(false);
    }
  }

  const types: { value: UploadType; label: string }[] = [
    { value: "vendors", label: "Vendors" },
    { value: "customers", label: "Customers" },
    { value: "foods", label: "Food Items" },
    { value: "reviews", label: "Reviews" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-xl w-full px-4 py-8">
        <h1 className="font-heading text-3xl font-bold mb-2">Bulk Upload</h1>
        <p className="text-muted-foreground text-sm mb-8">Upload CSV files to import data in bulk.</p>

        <div className="rounded-2xl border border-border bg-card p-6">
          {/* Type selector */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            {types.map(t => (
              <button
                key={t.value}
                onClick={() => { setSelected(t.value); setFile(null); setResult(null); }}
                className={cn("rounded-xl border p-3 text-sm font-medium text-left transition-all", selected === t.value ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/40")}
              >
                {t.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleUpload} className="space-y-4">
            <div
              onClick={() => fileRef.current?.click()}
              className={cn("rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors", file ? "border-primary bg-primary/5" : "border-border hover:border-primary/40")}
            >
              {file ? (
                <div className="flex items-center justify-center gap-2 text-primary">
                  <FileText className="h-5 w-5" />
                  <span className="text-sm font-medium">{file.name}</span>
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">Click to select a CSV file</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">for {selected} import</p>
                </>
              )}
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => setFile(e.target.files?.[0] ?? null)} />
            </div>

            {result && (
              <div className={cn("flex items-center gap-2 rounded-xl px-4 py-3 text-sm", result.success ? "bg-[oklch(0.55_0.18_145)]/10 text-[oklch(0.45_0.18_145)]" : "bg-destructive/10 text-destructive")}>
                {result.success ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <XCircle className="h-4 w-4 shrink-0" />}
                <span>{result.message}{result.count !== undefined && ` (${result.count} records)`}</span>
              </div>
            )}

            <Button type="submit" loading={uploading} disabled={!file} className="w-full">
              <Upload className="h-4 w-4" /> Upload {selected}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
