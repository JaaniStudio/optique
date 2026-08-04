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
import { Plus, Pencil, Trash2, FolderOpen, UploadCloud, X } from "lucide-react";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [bucketName, setBucketName] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [pickedFile, setPickedFile] = useState<File | null>(null);
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
    setImageUrl(null); setImagePath(null); setPickedFile(null);
    setDialogOpen(true);
  }

  function openEdit(cat: Category) {
    setEditingCategory(cat);
    setName(cat.name); setSlug(cat.slug); setBucketName(cat.bucket_name);
    setImageUrl(cat.image_url || null); setImagePath(cat.image_path || null); setPickedFile(null);
    setDialogOpen(true);
  }

  function handlePickImage(file: File | null) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("Image must be under 5MB."); return; }
    setImageUrl(URL.createObjectURL(file));
    setPickedFile(file);
  }

  async function handleSave() {
    if (!name || !slug || !bucketName) { alert("Name, slug, and bucket name are required."); return; }
    setSaving(true);
    const supabase = createClient();

    let finalImageUrl = imageUrl;
    let finalImagePath = imagePath;

    if (pickedFile) {
      const res = await fetch("/api/admin/create-bucket", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bucketName: "category-images" }),
      });
      if (!res.ok) { const e = await res.json(); alert("Could not ensure storage bucket: " + (e.error || "unknown")); setSaving(false); return; }

      const ext = pickedFile.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("category-images").upload(path, pickedFile, {
        cacheControl: "3600", upsert: false,
      });
      if (uploadErr) { alert("Image upload failed: " + uploadErr.message); setSaving(false); return; }
      const { data: pub } = supabase.storage.from("category-images").getPublicUrl(path);
      finalImageUrl = pub.publicUrl;
      finalImagePath = path;

      if (editingCategory && imagePath) {
        await supabase.storage.from("category-images").remove([imagePath]);
      }
    }

    if (editingCategory) {
      const { error } = await supabase
        .from("categories")
        .update({ name, slug, bucket_name: bucketName, image_url: finalImageUrl, image_path: finalImagePath })
        .eq("id", editingCategory.id);
      if (error) { alert(error.message); setSaving(false); return; }
    } else {
      const { error } = await supabase.from("categories").insert({
        name, slug, bucket_name: bucketName, image_url: finalImageUrl, image_path: finalImagePath,
      });
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
    if (cat.image_path) {
      await supabase.storage.from("category-images").remove([cat.image_path]);
    }
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
            {cat.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cat.image_url} alt={cat.name} className="h-10 w-10 rounded-lg object-cover shrink-0" />
            ) : (
              <div className="h-10 w-10 rounded-lg bg-cream flex items-center justify-center shrink-0">
                <FolderOpen className="h-5 w-5 text-ink/40" />
              </div>
            )}
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
            <div>
              <Label>Category Image (shown on homepage)</Label>
              <div className="flex items-center gap-3 mt-1">
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageUrl} alt="Category preview" className="h-16 w-16 rounded-lg object-cover border border-ink/10" />
                ) : (
                  <div className="h-16 w-16 rounded-lg bg-cream border border-ink/10 flex items-center justify-center">
                    <FolderOpen className="h-6 w-6 text-ink/30" />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 rounded-md border border-ink/15 bg-white px-3 py-2 text-sm cursor-pointer hover:bg-ink/5 transition-colors">
                    <UploadCloud className="h-4 w-4" />
                    {pickedFile ? "Change Image" : imageUrl ? "Replace Image" : "Upload Image"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handlePickImage(e.target.files?.[0] || null)}
                    />
                  </label>
                  {imageUrl && (
                    <button
                      type="button"
                      onClick={() => { setImageUrl(null); setImagePath(null); setPickedFile(null); }}
                      className="rounded-md border border-ink/15 p-2 text-ink/40 hover:text-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-xs text-ink/50 mt-1">Optional. Uploaded to the category-images bucket.</p>
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
