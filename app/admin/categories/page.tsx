"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import type { Category } from "@/types";
import { Plus, Pencil, Trash2, FolderOpen } from "lucide-react";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [bucketName, setBucketName] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const supabase = createClient();
      const { data } = await supabase.from("categories").select("*").order("name");
      setCategories((data as Category[]) || []);
    } catch (err) {
      console.error("Failed to load categories:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openNew() {
    setEditingCategory(null);
    setName(""); setSlug(""); setBucketName("");
    setDialogOpen(true);
  }

  function openEdit(cat: Category) {
    setEditingCategory(cat);
    setName(cat.name); setSlug(cat.slug); setBucketName(cat.bucket_name);
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!name || !slug || !bucketName) { alert("Name, slug, and bucket name are required."); return; }
    setSaving(true);
    const supabase = createClient();

    if (editingCategory) {
      await supabase.from("categories").update({ name, slug, bucket_name: bucketName }).eq("id", editingCategory.id);
    } else {
      const { error } = await supabase.from("categories").insert({ name, slug, bucket_name: bucketName });
      if (error) { alert(error.message); setSaving(false); return; }
      const res = await fetch("/api/admin/create-bucket", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bucketName }),
      });
      if (!res.ok) { const e = await res.json(); alert("Category created, but bucket creation failed: " + (e.error || "unknown")); }
    }

    setSaving(false);
    setDialogOpen(false);
    load();
  }

  async function handleDelete(cat: Category) {
    if (!confirm(`Delete category "${cat.name}"? Items in this category will lose their category.`)) return;
    const supabase = createClient();
    await supabase.from("categories").delete().eq("id", cat.id);
    load();
  }

  if (loading) return <div className="text-center py-20 text-ink/50">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold">Manage Categories</h1>
          <p className="text-sm text-ink/50 mt-1">Create and organize product categories</p>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-1" /> Add Category</Button>
      </div>

      <div className="grid gap-3">
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center gap-4 border border-ink/10 rounded-lg p-4 bg-white">
            <div className="h-10 w-10 rounded-lg bg-cream flex items-center justify-center shrink-0">
              <FolderOpen className="h-5 w-5 text-ink/40" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium">{cat.name}</p>
              <p className="text-sm text-ink/50">/{cat.slug} &middot; Bucket: {cat.bucket_name}</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => openEdit(cat)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleDelete(cat)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
        {categories.length === 0 && (
          <p className="text-ink/50 text-center py-16">No categories yet. Create one to get started.</p>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Category" : "Add Category"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Category Name</Label>
              <Input className="mt-1" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sunglasses" />
            </div>
            <div>
              <Label>Slug</Label>
              <Input className="mt-1" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="e.g. sunglasses" />
            </div>
            <div>
              <Label>Storage Bucket Name</Label>
              <Input className="mt-1" value={bucketName} onChange={(e) => setBucketName(e.target.value)} placeholder="e.g. sunglasses-images" />
              {!editingCategory && <p className="text-xs text-ink/50 mt-1">A public storage bucket will be created automatically.</p>}
            </div>
            <Button className="w-full" size="lg" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editingCategory ? "Save Changes" : "Create Category"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
