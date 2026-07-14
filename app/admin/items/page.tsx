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
import { Plus, Pencil, Trash2 } from "lucide-react";
import { ItemFormDialog } from "@/components/admin/item-form-dialog";

export default function AdminItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  async function load() {
    const supabase = createClient();
    const { data: cats } = await supabase.from("categories").select("*").order("name");
    setCategories((cats as Category[]) || []);

    let query = supabase.from("items").select("*, category:categories(*)").order("created_at", { ascending: false });
    const { data: itemsData } = await query;
    setItems((itemsData as Item[]) || []);
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
    await supabase.from("items").delete().eq("id", id);
  }

  async function toggleStock(item: Item, delta: number) {
    const supabase = createClient();
    await supabase.from("items").update({ stock: Math.max(0, item.stock + delta) }).eq("id", item.id);
  }

  const filtered = items.filter((i) => {
    const matchesSearch = !search || i.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || i.category_id === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-display font-bold">Manage Items</h1>
        <Button onClick={() => { setEditingItem(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Add Item
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Input placeholder="Search items..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
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
          <div key={item.id} className="flex items-center gap-4 border border-ink/10 rounded-lg p-3 bg-white">
            <div className="relative h-16 w-16 rounded-md overflow-hidden shrink-0 bg-cream">
              {item.thumbnail_url && <Image src={item.thumbnail_url} alt={item.name} fill className="object-cover" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{item.name}</p>
              <p className="text-sm text-ink/50">{item.category?.name}</p>
            </div>
            <div className="text-sm">
              <p className="font-semibold">{formatPKR(item.on_sale && item.sale_price ? item.sale_price : item.price)}</p>
              {item.on_sale && <Badge variant="sale" className="mt-1">SALE</Badge>}
            </div>
            <div className="flex items-center gap-1 text-sm">
              <button onClick={() => toggleStock(item, -1)} className="px-2 border border-ink/15 rounded">-</button>
              <span className="w-8 text-center">{item.stock}</span>
              <button onClick={() => toggleStock(item, 1)} className="px-2 border border-ink/15 rounded">+</button>
            </div>
            <Button size="sm" variant="outline" onClick={() => { setEditingItem(item); setDialogOpen(true); }}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" variant="destructive" onClick={() => deleteItem(item.id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-ink/50 text-center py-16">No items found.</p>}
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
