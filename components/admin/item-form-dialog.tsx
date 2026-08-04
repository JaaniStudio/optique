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
import type { Category, Item, ItemColor, ItemImage } from "@/types";
import { colorToHex } from "@/lib/utils";
import { X, Star, UploadCloud, Loader2, Plus } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  categories: Category[];
  editingItem: Item | null;
  onSaved: () => void;
};

type PickedFile = { file: File; blobUrl: string };

export function ItemFormDialog({ open, onOpenChange, categories, editingItem, onSaved }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [stock, setStock] = useState("");
  const [onSale, setOnSale] = useState(false);
  const [salePrice, setSalePrice] = useState("");
  const [colors, setColors] = useState<ItemColor[]>([]);
  const [newColorName, setNewColorName] = useState("");
  const [newColorStock, setNewColorStock] = useState("");
  const [existingImages, setExistingImages] = useState<ItemImage[]>([]);
  const [pickedFiles, setPickedFiles] = useState<PickedFile[]>([]);
  const [thumbnailIndex, setThumbnailIndex] = useState(-1);
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
      setColors(editingItem.colors || []);
      setNewColorName("");
      setNewColorStock("");
      setExistingImages(editingItem.images || []);
      setPickedFiles([]);
      const existingIdx = editingItem.images?.findIndex((i) => i.url === editingItem.thumbnail_url) ?? -1;
      setThumbnailIndex(existingIdx >= 0 ? existingIdx : 0);
    } else {
      setName(""); setDescription(""); setPrice(""); setCategoryId(categories[0]?.id || "");
      setStock(""); setOnSale(false); setSalePrice(""); setColors([]); setNewColorName(""); setNewColorStock(""); setExistingImages([]); setPickedFiles([]); setThumbnailIndex(-1); setUploadError("");
    }
  }, [editingItem, open, categories]);

  useEffect(() => {
    return () => { pickedFiles.forEach((pf) => URL.revokeObjectURL(pf.blobUrl)); };
  }, [pickedFiles]);

  const allImages = [...existingImages, ...pickedFiles] as (ItemImage | PickedFile)[];

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

  function handlePickFiles(files: FileList | null) {
    if (!files) return;
    const total = existingImages.length + pickedFiles.length + files.length;
    if (total > 5) { alert("Max 5 images per item."); return; }
    setUploadError("");
    const newPicks: PickedFile[] = [];
    for (const file of Array.from(files)) {
      if (file.size > 5 * 1024 * 1024) { setUploadError(`"${file.name}" exceeds 5MB limit.`); continue; }
      newPicks.push({ file, blobUrl: URL.createObjectURL(file) });
    }
    const updated = [...pickedFiles, ...newPicks];
    setPickedFiles(updated);
    if (thumbnailIndex < 0 && allImages.length === 0) setThumbnailIndex(0);
  }

  function removeImage(index: number) {
    const img = allImages[index];
    if (!img) return;
    const isExisting = "url" in img && !("file" in img);
    if (isExisting) {
      const newExisting = existingImages.filter((_, i) => i !== index);
      setExistingImages(newExisting);
    } else {
      URL.revokeObjectURL((img as PickedFile).blobUrl);
      const pickStart = existingImages.length;
      const pickIdx = index - pickStart;
      setPickedFiles((prev) => prev.filter((_, i) => i !== pickIdx));
    }
    if (thumbnailIndex === index) {
      const remaining = allImages.length - 1;
      setThumbnailIndex(remaining > 0 ? Math.min(thumbnailIndex, remaining - 1) : -1);
    } else if (thumbnailIndex > index) {
      setThumbnailIndex(thumbnailIndex - 1);
    }
  }

  function getImageUrl(img: ItemImage | PickedFile): string {
    return "blobUrl" in img ? img.blobUrl : img.url;
  }

  function addColor() {
    const name = newColorName.trim();
    if (!name) return;
    if (colors.some((c) => c.name.toLowerCase() === name.toLowerCase())) { setNewColorName(""); setNewColorStock(""); return; }
    const stock = Math.max(0, Number(newColorStock) || 0);
    setColors([...colors, { name, stock }]);
    setNewColorName("");
    setNewColorStock("");
  }

  function removeColor(index: number) {
    setColors(colors.filter((_, i) => i !== index));
  }

  async function handleSave() {
    if (!name || !price || !categoryId) { alert("Name, price, and category are required."); return; }
    if (allImages.length === 0) { alert("At least one image is required."); return; }
    setSaving(true);
    setUploadError("");
    const supabase = createClient();
    const bucketName = getBucketForCurrentCategory();

    if (!bucketName) { alert("No bucket for selected category."); setSaving(false); return; }

    const bucketReady = await ensureBucket(bucketName);
    if (!bucketReady) { setSaving(false); return; }

    const uploadedImages: ItemImage[] = [...existingImages];

    for (const pf of pickedFiles) {
      const ext = pf.file.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from(bucketName).upload(path, pf.file, {
        cacheControl: "3600", upsert: false,
      });
      if (error) { setUploadError(`Upload failed for ${pf.file.name}: ${error.message}`); continue; }
      const { data: pub } = supabase.storage.from(bucketName).getPublicUrl(path);
      uploadedImages.push({ url: pub.publicUrl, path });
    }

    if (uploadedImages.length === 0) { alert("No images were uploaded successfully."); setSaving(false); return; }

    const thumbUrl = thumbnailIndex >= 0 && thumbnailIndex < uploadedImages.length
      ? uploadedImages[thumbnailIndex].url
      : uploadedImages[0].url;

    const totalStock = colors.length > 0
      ? colors.reduce((s, c) => s + c.stock, 0)
      : (Number(stock) || 0);

    const payload = {
      name,
      description,
      price: Number(price),
      category_id: categoryId,
      stock: totalStock,
      on_sale: onSale,
      sale_price: onSale && salePrice ? Number(salePrice) : null,
      colors,
      images: uploadedImages,
      thumbnail_url: thumbUrl,
      updated_at: new Date().toISOString(),
    };

    if (editingItem) {
      await supabase.from("items").update(payload).eq("id", editingItem.id);
    } else {
      await supabase.from("items").insert(payload);
    }

    pickedFiles.forEach((pf) => URL.revokeObjectURL(pf.blobUrl));
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
            {colors.length === 0 ? (
              <div>
                <Label>Stock Quantity</Label>
                <Input className="mt-1" type="number" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="e.g. 50" />
              </div>
            ) : (
              <div>
                <Label>Total Stock (auto: sum of colors)</Label>
                <Input className="mt-1" type="number" value={colors.reduce((s, c) => s + c.stock, 0)} disabled />
              </div>
            )}
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
            <Label>Available Colors &amp; Stock (optional)</Label>
            <p className="text-xs text-ink/50 mt-0.5">Give each color its own stock. Total stock is the sum.</p>
            <div className="flex flex-col gap-2 mt-2">
              {colors.map((color, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 rounded-md border border-ink/15 bg-white px-2 py-1.5 text-sm"
                >
                  <span className="h-4 w-4 rounded-full border border-ink/15 shrink-0" style={{ backgroundColor: colorToHex(color.name) }} />
                  <span className="flex-1 min-w-0">{color.name}</span>
                  <Input
                    className="w-24 h-8"
                    type="number"
                    min={0}
                    value={String(color.stock)}
                    onChange={(e) => {
                      const v = Math.max(0, Number(e.target.value) || 0);
                      setColors(colors.map((c, i) => i === idx ? { ...c, stock: v } : c));
                    }}
                  />
                  <button type="button" onClick={() => removeColor(idx)} className="text-ink/40 hover:text-red-600 transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Input
                className="max-w-[180px]"
                placeholder="Color (e.g. Black)"
                value={newColorName}
                onChange={(e) => setNewColorName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addColor(); } }}
              />
              <Input
                className="max-w-[110px]"
                type="number"
                min={0}
                placeholder="Stock"
                value={newColorStock}
                onChange={(e) => setNewColorStock(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addColor(); } }}
              />
              <Button type="button" variant="outline" onClick={addColor}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <Label>Images (max 5) &mdash; click a photo to set it as thumbnail</Label>
            {uploadError && <p className="text-sm text-red-600 mt-1">{uploadError}</p>}
            <div className="flex flex-wrap gap-3 mt-2">
              {allImages.map((img, idx) => (
                <div
                  key={getImageUrl(img)}
                  onClick={() => setThumbnailIndex(idx)}
                  className={`relative h-20 w-20 rounded-md overflow-hidden border-2 cursor-pointer transition-all hover:opacity-90 ${
                    thumbnailIndex === idx ? "border-ink ring-1 ring-ink" : "border-border"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={getImageUrl(img)} alt="" className="h-full w-full object-cover" />
                  {thumbnailIndex === idx && (
                    <span className="absolute top-1 left-1 bg-ink rounded-full p-0.5">
                      <Star className="h-3 w-3 text-cream fill-cream" />
                    </span>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                    className="absolute top-1 right-1 bg-white/90 rounded-full p-0.5 hover:bg-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {allImages.length < 5 && (
                <label className="h-20 w-20 rounded-md border-2 border-dashed border-border flex items-center justify-center cursor-pointer text-ink/40 hover:text-ink/60 hover:border-ink/40 transition-colors">
                  <UploadCloud className="h-5 w-5" />
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handlePickFiles(e.target.files)}
                  />
                </label>
              )}
            </div>
          </div>

          <Button className="w-full" size="lg" onClick={handleSave} disabled={saving}>
            {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin inline" /> Saving...</> : editingItem ? "Save Changes" : "Add Item"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
