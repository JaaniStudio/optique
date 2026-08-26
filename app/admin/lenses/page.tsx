"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { formatPKR } from "@/lib/utils";
import type { LensOption } from "@/types";

export default function AdminLensesPage() {
  const [lensOptions, setLensOptions] = useState<LensOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editTitle, setEditTitle] = useState<Record<string, string>>({});
  const [editPrice, setEditPrice] = useState<Record<string, string>>({});

  async function load() {
    const supabase = createClient();
    const { data, error } = await supabase.from("lens_options").select("*").order("sort_order", { ascending: true });
    if (error) {
      console.error("Failed to load lens options:", error.message);
    }
    if (data) {
      setLensOptions(data as LensOption[]);
      const titles: Record<string, string> = {};
      const prices: Record<string, string> = {};
      (data as LensOption[]).forEach((o) => {
        titles[o.id] = o.title;
        prices[o.id] = String(o.price);
      });
      setEditTitle(titles);
      setEditPrice(prices);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function saveOption(id: string) {
    setSaving(true);
    const supabase = createClient();
    await supabase.from("lens_options").update({
      title: editTitle[id] || "Untitled",
      price: parseFloat(editPrice[id]) || 0,
    }).eq("id", id);
    setSaving(false);
    load();
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-display font-bold mb-2">Manage Lenses</h1>
        <p className="text-sm text-ink/50">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold">Manage Lenses</h1>
        <p className="text-sm text-ink/50 mt-1">Edit lens option titles and prices shown to customers</p>
      </div>

      <div className="grid gap-4">
        {lensOptions.map((opt, idx) => (
          <div key={opt.id} className="flex items-center gap-4 rounded-xl border border-ink/10 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-ink/30">
              <GripVertical className="h-4 w-4" />
              <span className="text-sm font-medium">{idx + 1}</span>
            </div>

            <div className="relative h-20 w-20 rounded-lg overflow-hidden shrink-0 bg-cream">
              <Image src={opt.image_url} alt={opt.title} fill className="object-cover" />
            </div>

            <div className="flex-1 grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-ink/60 mb-1 block">Title</Label>
                <Input
                  value={editTitle[opt.id] || ""}
                  onChange={(e) => setEditTitle((prev) => ({ ...prev, [opt.id]: e.target.value }))}
                />
              </div>
              <div>
                <Label className="text-xs text-ink/60 mb-1 block">Price (PKR)</Label>
                <Input
                  type="number"
                  min="0"
                  value={editPrice[opt.id] || ""}
                  onChange={(e) => setEditPrice((prev) => ({ ...prev, [opt.id]: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => saveOption(opt.id)}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {lensOptions.length === 0 && (
        <div className="text-center py-12 text-ink/50">
          <p>No lens options found. Run the seed SQL to create default options.</p>
        </div>
      )}
    </div>
  );
}
