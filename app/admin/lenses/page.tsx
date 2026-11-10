"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, GripVertical, UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { formatPKR } from "@/lib/utils";
import type { LensOption } from "@/types";

const LENS_BUCKET = "lens-images";

export default function AdminLensesPage() {
  const [lensOptions, setLensOptions] = useState<LensOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOption, setEditingOption] = useState<LensOption | null>(null);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [pickedFile, setPickedFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const supabase = createClient();
    const { data, error } = await supabase.from("lens_options").select("*").order("sort_order", { ascending: true });
    if (error) {
      console.error("Failed to load lens options:", error.message);
    }
    setLensOptions((data as LensOption[]) || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openNew() {
    setEditingOption(null);
    setTitle("");
    setPrice("");
    setImageUrl(null);
    setImagePath(null);
    setPickedFile(null);
    setDialogOpen(true);
  }

  function openEdit(opt: LensOption) {
    setEditingOption(opt);
    setTitle(opt.title);
    setPrice(String(opt.price));
    setImageUrl(opt.image_url);
    setImagePath(opt.image_path || null);
    setPickedFile(null);
    setDialogOpen(true);
  }

  function handlePickImage(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) { alert("Please select an image file."); return; }
    if (file.size > 5 * 1024 * 1024) { alert("Image must be under 5MB."); return; }
    setImageUrl(URL.createObjectURL(file));
    setPickedFile(file);
  }

  async function handleSave() {
    if (!title.trim()) { alert("Title is required."); return; }
    const numericPrice = Number(price);
    if (!Number.isFinite(numericPrice) || numericPrice < 0) { alert("Please enter a valid price."); return; }
    if (!imageUrl && !pickedFile) { alert("Please upload an image for this lens option."); return; }

    setSaving(true);
    const supabase = createClient();

    let finalImageUrl = imageUrl;
    let finalImagePath = imagePath;

    if (pickedFile) {
      const res = await fetch("/api/admin/create-bucket", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bucketName: LENS_BUCKET }),
      });
      if (!res.ok) {
        const e = await res.json();
        alert("Could not ensure storage bucket: " + (e.error || "unknown"));
        setSaving(false);
        return;
      }

      const ext = pickedFile.name.split(".").pop() || "jpg";
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from(LENS_BUCKET).upload(path, pickedFile, {
        cacheControl: "3600", upsert: false,
      });
      if (uploadErr) {
        alert("Image upload failed: " + uploadErr.message);
        setSaving(false);
        return;
      }
      const { data: pub } = supabase.storage.from(LENS_BUCKET).getPublicUrl(path);
      finalImageUrl = pub.publicUrl;
      finalImagePath = path;

      if (editingOption && imagePath) {
        await supabase.storage.from(LENS_BUCKET).remove([imagePath]);
      }
    }

    if (!finalImageUrl) {
      alert("Please upload an image for this lens option.");
      setSaving(false);
      return;
    }

    const sortOrder = editingOption
      ? editingOption.sort_order
      : Math.max(0, ...lensOptions.map((o) => o.sort_order)) + 1;

    const payload = {
      title: title.trim(),
      price: numericPrice,
      image_url: finalImageUrl,
      image_path: finalImagePath,
      sort_order: sortOrder,
    };

    const { error } = editingOption
      ? await supabase.from("lens_options").update(payload).eq("id", editingOption.id)
      : await supabase.from("lens_options").insert(payload);

    if (error) {
      alert(error.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    setDialogOpen(false);
    load();
  }

  async function handleDelete(opt: LensOption) {
    if (!confirm(`Delete lens option "${opt.title}"?`)) return;
    const supabase = createClient();
    if (opt.image_path) {
      await supabase.storage.from(LENS_BUCKET).remove([opt.image_path]);
    }
    await supabase.from("lens_options").delete().eq("id", opt.id);
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold">Manage Lenses</h1>
          <p className="text-sm text-ink/50 mt-1">Add, edit, and remove lens options shown to customers</p>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-1" /> Add Lens Option</Button>
      </div>

      <div className="grid gap-4">
        {lensOptions.map((opt, idx) => (
          <div key={opt.id} className="flex items-center gap-4 rounded-xl border border-ink/10 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-ink/30">
              <GripVertical className="h-4 w-4" />
              <span className="text-sm font-medium">{idx + 1}</span>
            </div>

            <div className="relative h-20 w-20 rounded-lg overflow-hidden shrink-0 bg-cream">
              <Image src={opt.image_url || "/placeholder-glasses.svg"} alt={opt.title} fill className="object-cover" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{opt.title}</p>
              <p className="text-sm text-ink/50">{opt.price > 0 ? formatPKR(opt.price) : "Free"}</p>
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => openEdit(opt)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleDelete(opt)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {lensOptions.length === 0 && (
        <div className="text-center py-12 text-ink/50">
          <p>No lens options yet. Add one to get started.</p>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingOption ? "Edit Lens Option" : "Add Lens Option"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                className="mt-1"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Blue Light Blocking"
              />
            </div>
            <div>
              <Label>Price (PKR)</Label>
              <Input
                className="mt-1"
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 1000"
              />
            </div>
            <div>
              <Label>Lens Image</Label>
              <div className="flex items-center gap-3 mt-1">
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageUrl} alt="Lens preview" className="h-16 w-16 rounded-lg object-cover border border-ink/10" />
                ) : (
                  <div className="h-16 w-16 rounded-lg bg-cream border border-ink/10 flex items-center justify-center">
                    <UploadCloud className="h-6 w-6 text-ink/30" />
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
              <p className="text-xs text-ink/50 mt-1">Uploaded to the lens-images bucket. Max 5MB.</p>
            </div>
            <Button className="w-full" size="lg" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editingOption ? "Save Changes" : "Add Lens Option"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
