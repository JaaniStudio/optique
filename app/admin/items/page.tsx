"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import type { Category, Item } from "@/types";
import { formatPKR } from "@/lib/utils";
import { Plus, Pencil, Trash2, Search, PackageOpen } from "lucide-react";
import { ItemFormDialog } from "@/components/admin/item-form-dialog";

export default function AdminItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const supabase = createClient();
      const { data: cats } = await supabase.from("categories").select("*").order("name");
      setCategories((cats as Category[]) || []);
      const { data: itemsData } = await supabase.from("items").select("*, category:categories(*)").order("created_at", { ascending: false });
      setItems((itemsData as Item[]) || []);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load items:", err);
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const supabase = createClient();
    const channel = supabase
      .channel("admin_items")
      .on("postgres_changes", { event: "*", schema: "public", table: "items" }, load)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function deleteItem(id: string) {
    if (!confirm("Delete this item permanently?")) return;
    const supabase = createClient();
    const item = items.find((i) => i.id === id);
    if (item?.images?.length) {
      const bucketName = item.category?.bucket_name;
      if (bucketName) {
        for (const img of item.images) {
          if (img.path) { await supabase.storage.from(bucketName).remove([img.path]).catch(() => {}); }
        }
      }
    }
    await supabase.from("items").delete().eq("id", id);
  }

  async function toggleStock(item: Item, delta: number) {
    const newStock = Math.max(0, item.stock + delta);
    setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, stock: newStock } : i));
    const supabase = createClient();
    await supabase.from("items").update({ stock: newStock }).eq("id", item.id);
  }

  const filtered = items.filter((i) => {
    const matchesSearch = !search || i.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || i.category_id === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) return <div className="text-center py-20 text-ink/50">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold">Manage Items</h1>
          <p className="text-sm text-ink/50 mt-1">Add, edit, and manage your products</p>
        </div>
        <Button onClick={() => { setEditingItem(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Add Item
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/30" />
          <Input placeholder="Search items..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filtered.map((item) => (
          <div key={item.id} className="flex items-center gap-4 border border-ink/10 rounded-xl p-4 bg-white transition-all hover:shadow-sm">
            <div className="relative h-16 w-16 rounded-lg overflow-hidden shrink-0 bg-cream">
              {item.thumbnail_url && <Image src={item.thumbnail_url} alt={item.name} fill className="object-cover" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{item.name}</p>
              <p className="text-sm text-ink/50">{item.category?.name || "No category"}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-semibold">{formatPKR(item.on_sale && item.sale_price ? item.sale_price : item.price)}</p>
              {item.on_sale && <Badge variant="sale" className="mt-1">SALE</Badge>}
            </div>
            <div className="flex items-center gap-1 text-sm shrink-0">
              <button onClick={() => toggleStock(item, -1)} className="h-8 w-8 border border-ink/15 rounded-md hover:bg-cream transition-colors">-</button>
              <span className="w-10 text-center font-medium">{item.stock}</span>
              <button onClick={() => toggleStock(item, 1)} className="h-8 w-8 border border-ink/15 rounded-md hover:bg-cream transition-colors">+</button>
            </div>
            <Button size="sm" variant="outline" onClick={() => { setEditingItem(item); setDialogOpen(true); }}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" variant="destructive" onClick={() => deleteItem(item.id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-20">
            <PackageOpen className="h-10 w-10 mx-auto text-ink/20 mb-3" />
            <p className="text-ink/50">No items found.</p>
          </div>
        )}
      </div>

      <ItemFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        categories={categories}
        editingItem={editingItem}
        onSaved={load}
      />
    </div>
  );
}
