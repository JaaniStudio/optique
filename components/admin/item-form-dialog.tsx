"use client";

import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import type { Category, Item, ItemImage } from "@/types";
import { X, Star, UploadCloud, Loader2 } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  categories: Category[];
  editingItem: Item | null;
  onSaved: () => void;
};

export function ItemFormDialog({ open, onOpenChange, categories, editingItem, onSaved }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [stock, setStock] = useState("");
  const [onSale, setOnSale] = useState(false);
  const [salePrice, setSalePrice] = useState("");
  const [images, setImages] = useState<ItemImage[]>([]);
  const [thumbnail, setThumbnail] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    if (!open) return;
    if (editingItem) {
      setName(editingItem.name);
      setDescription(editingItem.description || "");
      setPrice(String(editingItem.price));
      setCategoryId(editingItem.category_id || "");
      setStock(String(editingItem.stock));
      setOnSale(editingItem.on_sale);
      setSalePrice(editingItem.sale_price ? String(editingItem.sale_price) : "");
      setImages(editingItem.images || []);
      setThumbnail(editingItem.thumbnail_url || editingItem.images?.[0]?.url || "");
    } else {
      setName(""); setDescription(""); setPrice(""); setCategoryId(categories[0]?.id || "");
      setStock(""); setOnSale(false); setSalePrice(""); setImages([]); setThumbnail(""); setUploadError("");
    }
  }, [editingItem, open, categories]);

  function getBucketForCurrentCategory(): string | null {
    return categories.find((c) => c.id === categoryId)?.bucket_name ?? null;
  }

  async function ensureBucket(bucketName: string): Promise<boolean> {
    const res = await fetch("/api/admin/create-bucket", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bucketName }),
    });
    const data = await res.json();
    if (!res.ok) { setUploadError(data.error || "Failed to ensure bucket"); return false; }
    return true;
  }

  async function handleUpload(files: FileList | null) {
    if (!files || !categoryId) return;
    const bucketName = getBucketForCurrentCategory();
    if (!bucketName) { setUploadError("Select a category first."); return; }
    if (images.length + files.length > 5) { alert("Max 5 images per item."); return; }

    setUploadError("");
    setUploading(true);
    const supabase = createClient();
    const newImages: ItemImage[] = [];

    const bucketReady = await ensureBucket(bucketName);
    if (!bucketReady) { setUploading(false); return; }

    for (const file of Array.from(files)) {
      if (file.size > 5 * 1024 * 1024) { setUploadError(`"${file.name}" exceeds 5MB limit.`); continue; }
      const ext = file.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from(bucketName).upload(path, file, {
        cacheControl: "3600", upsert: false,
      });
      if (error) { setUploadError(`Upload failed: ${error.message}`); continue; }
      const { data: pub } = supabase.storage.from(bucketName).getPublicUrl(path);
      newImages.push({ url: pub.publicUrl, path });
    }

    const updated = [...images, ...newImages];
    setImages(updated);
    if (!thumbnail && updated[0]) setThumbnail(updated[0].url);
    setUploading(false);
  }

  function removeImage(img: ItemImage) {
    const updated = images.filter((i) => i.url !== img.url);
    setImages(updated);
    if (thumbnail === img.url) setThumbnail(updated[0]?.url || "");
  }

  async function handleSave() {
    if (!name || !price || !categoryId) { alert("Name, price, and category are required."); return; }
    if (images.length === 0) { alert("At least one image is required."); return; }
    setSaving(true);
    const supabase = createClient();

    const payload = {
      name,
      description,
      price: Number(price),
      category_id: categoryId,
      stock: Number(stock) || 0,
      on_sale: onSale,
      sale_price: onSale && salePrice ? Number(salePrice) : null,
      images,
      thumbnail_url: thumbnail || images[0]?.url || null,
      updated_at: new Date().toISOString(),
    };

    if (editingItem) {
      await supabase.from("items").update(payload).eq("id", editingItem.id);
    } else {
      await supabase.from("items").insert(payload);
    }

    setSaving(false);
    onOpenChange(false);
    onSaved();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingItem ? "Edit Item" : "Add New Item"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input className="mt-1" value={name} onChange={(e) => setName(e.target.value)} placeholder="Product name" />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea className="mt-1" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Product description" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Price (PKR)</Label>
              <Input className="mt-1" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 2999" />
            </div>
            <div>
              <Label>Stock Quantity</Label>
              <Input className="mt-1" type="number" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="e.g. 50" />
            </div>
          </div>

          <div>
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox checked={onSale} onCheckedChange={(v) => setOnSale(!!v)} />
            <Label>On Sale</Label>
            {onSale && (
              <Input
                className="ml-3 w-32"
                type="number"
                placeholder="Sale price"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
              />
            )}
          </div>

          <div>
            <Label>Images (max 5) &mdash; click a photo to set it as thumbnail</Label>
            {uploadError && <p className="text-sm text-red-600 mt-1">{uploadError}</p>}
            <div className="flex flex-wrap gap-3 mt-2">
              {images.map((img) => (
                <div
                  key={img.url}
                  onClick={() => setThumbnail(img.url)}
                  className={`relative h-20 w-20 rounded-md overflow-hidden border-2 cursor-pointer transition-all hover:opacity-90 ${
                    thumbnail === img.url ? "border-ink ring-1 ring-ink" : "border-border"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                  {thumbnail === img.url && (
                    <span className="absolute top-1 left-1 bg-ink rounded-full p-0.5">
                      <Star className="h-3 w-3 text-cream fill-cream" />
                    </span>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); removeImage(img); }}
                    className="absolute top-1 right-1 bg-white/90 rounded-full p-0.5 hover:bg-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {images.length < 5 && (
                <label className="h-20 w-20 rounded-md border-2 border-dashed border-border flex items-center justify-center cursor-pointer text-ink/40 hover:text-ink/60 hover:border-ink/40 transition-colors">
                  {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <UploadCloud className="h-5 w-5" />}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => handleUpload(e.target.files)}
                  />
                </label>
              )}
            </div>
            {uploading && <p className="text-xs text-ink/50 mt-1">Uploading images...</p>}
          </div>

          <Button className="w-full" size="lg" onClick={handleSave} disabled={saving || uploading}>
            {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin inline" /> Saving...</> : editingItem ? "Save Changes" : "Add Item"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
