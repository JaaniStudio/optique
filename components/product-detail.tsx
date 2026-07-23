"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, ShoppingCart, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPKR } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useUIStore } from "@/lib/store";
import type { Item } from "@/types";

export function ProductDetail({ item }: { item: Item }) {
  const images = item.images?.length ? item.images : [{ url: "/placeholder-glasses.svg", path: "" }];
  const [activeImg, setActiveImg] = useState(item.thumbnail_url || images[0].url);
  const [qty, setQty] = useState(1);
  const [isFav, setIsFav] = useState(false);
  const [adding, setAdding] = useState(false);
  const router = useRouter();
  const setCartCount = useUIStore((s) => s.setCartCount);

  const price = item.on_sale && item.sale_price ? item.sale_price : item.price;

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from("favorites").select("id").eq("user_id", user.id).eq("item_id", item.id).maybeSingle().then(({ data }) => {
        if (data) setIsFav(true);
      });
    });
  }, [item.id]);

  async function addToCart() {
    setAdding(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      setAdding(false);
      return;
    }
    const { data: existing } = await supabase
      .from("cart_items").select("*").eq("user_id", user.id).eq("item_id", item.id).single();

    if (existing) {
      await supabase.from("cart_items").update({ quantity: existing.quantity + qty }).eq("id", existing.id);
    } else {
      await supabase.from("cart_items").insert({ user_id: user.id, item_id: item.id, quantity: qty });
    }
    setAdding(false);
    const { count } = await supabase.from("cart_items").select("id", { count: "exact", head: true }).eq("user_id", user.id);
    if (count !== null) setCartCount(count);
    router.push("/cart");
  }

  async function toggleFavorite() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    if (isFav) {
      await supabase.from("favorites").delete().eq("user_id", user.id).eq("item_id", item.id);
    } else {
      await supabase.from("favorites").insert({ user_id: user.id, item_id: item.id });
    }
    setIsFav(!isFav);
  }

  return (
    <div className="grid md:grid-cols-2 gap-10 mx-auto max-w-6xl px-4 md:px-8 py-12">
      {/* Gallery */}
      <div>
        <div className="relative aspect-square rounded-lg overflow-hidden bg-white border border-ink/10">
          <Image src={activeImg} alt={item.name} fill className="object-cover" />
          {item.on_sale && <Badge variant="sale" className="absolute top-4 left-4">SALE</Badge>}
        </div>
        <div className="flex gap-3 mt-4">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveImg(img.url)}
              className={`relative h-20 w-20 rounded-md overflow-hidden border-2 ${
                activeImg === img.url ? "border-ink" : "border-transparent"
              }`}
            >
              <Image src={img.url} alt={`${item.name} ${i + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Info */}
      <div>
        {item.category && (
          <p className="text-sm uppercase tracking-wide text-ink/50 mb-2">{item.category.name}</p>
        )}
        <h1 className="text-3xl font-display font-bold">{item.name}</h1>

        <div className="mt-4 flex items-center gap-3">
          <span className="text-2xl font-semibold">{formatPKR(price)}</span>
          {item.on_sale && <span className="text-lg text-ink/40 line-through">{formatPKR(item.price)}</span>}
        </div>

        <p className="mt-6 text-ink/70 leading-relaxed">{item.description}</p>

        <p className={`mt-4 text-sm font-medium ${item.stock > 0 ? "text-green-700" : "text-red-600"}`}>
          {item.stock > 0 ? `In Stock (${item.stock} available)` : "Out of Stock"}
        </p>

        <div className="mt-6 flex items-center gap-4">
          <div className="flex items-center border border-ink/20 rounded-md">
            <button className="p-2" onClick={() => setQty((q) => Math.max(1, q - 1))}><Minus className="h-4 w-4" /></button>
            <span className="px-4">{qty}</span>
            <button className="p-2" onClick={() => setQty((q) => Math.min(item.stock, q + 1))}><Plus className="h-4 w-4" /></button>
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
            <Button size="lg" className="w-full" disabled={item.stock === 0 || adding} onClick={addToCart}>
              <ShoppingCart className="h-4 w-4 mr-2" /> Add to Cart
            </Button>
          </motion.div>

          <motion.button whileTap={{ scale: 0.85 }} onClick={toggleFavorite} className="border border-ink/20 rounded-md p-3">
            <Heart className={`h-5 w-5 ${isFav ? "fill-ink text-ink" : ""}`} />
          </motion.button>
        </div>

        <p className="mt-6 text-xs text-ink/50">
          Payment is manual: place your order, then send a payment screenshot via WhatsApp to confirm.
        </p>
      </div>
    </div>
  );
}
