"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, ShoppingCart, Minus, Plus, ChevronRight, Shield, Truck, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPKR, colorToHex } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useUIStore } from "@/lib/store";
import { toast } from "@/components/ui/toast";
import type { Item } from "@/types";
import { ProductReviews } from "@/components/product-reviews";

export function ProductDetail({ item }: { item: Item }) {
  const images = item.images?.length ? item.images : [{ url: "/placeholder-glasses.svg", path: "" }];
  const [activeImg, setActiveImg] = useState(item.thumbnail_url || images[0].url);
  const [qty, setQty] = useState(1);
  const [isFav, setIsFav] = useState(false);
  const [adding, setAdding] = useState(false);
  const router = useRouter();
  const setCartCount = useUIStore((s) => s.setCartCount);

  const colors = item.colors || [];
  const hasColors = colors.length > 0;
  const [selectedColor, setSelectedColor] = useState<string>(
    () => colors.find((c) => c.stock > 0)?.name ?? colors[0]?.name ?? ""
  );

  const selectedColorObj = colors.find((c) => c.name === selectedColor);
  const availableStock = hasColors ? (selectedColorObj?.stock ?? 0) : item.stock;
  const outOfStock = availableStock <= 0;

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
    if (hasColors && !selectedColor) { alert("Please select a color."); return; }
    setAdding(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      setAdding(false);
      return;
    }
    const color = hasColors ? selectedColor : "";
    const { data: existing } = await supabase
      .from("cart_items").select("*").eq("user_id", user.id).eq("item_id", item.id).eq("color", color).single();

    if (existing) {
      await supabase.from("cart_items").update({ quantity: existing.quantity + qty }).eq("id", existing.id);
    } else {
      await supabase.from("cart_items").insert({ user_id: user.id, item_id: item.id, color, quantity: qty });
    }
    setAdding(false);
    const { count } = await supabase.from("cart_items").select("id", { count: "exact", head: true }).eq("user_id", user.id);
    if (count !== null) setCartCount(count);
    toast({
      title: "Added to cart",
      description: `${qty}x ${item.name}${hasColors && selectedColor ? ` (${selectedColor})` : ""}`,
      variant: "success",
    });
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
    const { count } = await supabase.from("favorites").select("id", { count: "exact", head: true }).eq("user_id", user.id);
    if (count !== null) useUIStore.getState().setFavoritesCount(count);
    toast({
      title: isFav ? "Removed from favorites" : "Added to favorites",
      variant: "success",
    });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm text-ink/40 mb-8">
        <Link href="/" className="hover:text-ink/70 transition-colors">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/products" className="hover:text-ink/70 transition-colors">Products</Link>
        {item.category && (
          <>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href={`/products/${item.category.slug}`} className="hover:text-ink/70 transition-colors">
              {item.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-ink/70 truncate max-w-[200px]">{item.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Gallery */}
        <div>
          <div className="relative aspect-square rounded-xl overflow-hidden bg-white border border-ink/10">
            <Image src={activeImg} alt={item.name} fill className="object-cover" />
            {item.on_sale && <Badge variant="sale" className="absolute top-4 left-4">SALE</Badge>}
          </div>
          <div className="flex gap-3 mt-4">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(img.url)}
                className={`relative h-20 w-20 rounded-lg overflow-hidden border-2 transition-all ${
                  activeImg === img.url ? "border-ink ring-1 ring-ink" : "border-transparent hover:border-ink/30"
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
            <p className="text-xs uppercase tracking-wider text-ink/50 mb-2 font-medium">{item.category.name}</p>
          )}
          <h1 className="text-3xl md:text-4xl font-display font-bold">{item.name}</h1>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-2xl font-semibold">{formatPKR(price)}</span>
            {item.on_sale && (
              <>
                <span className="text-lg text-ink/40 line-through">{formatPKR(item.price)}</span>
                <Badge variant="sale">Save {formatPKR(item.price - (item.sale_price || 0))}</Badge>
              </>
            )}
          </div>

          <p className="mt-6 text-ink/70 leading-relaxed">{item.description}</p>

          {hasColors && (
            <div className="mt-5">
              <p className="text-xs uppercase tracking-wider text-ink/50 mb-2 font-medium">Select Color</p>
              <div className="flex flex-wrap gap-2">
                {colors.map((c) => {
                  const active = selectedColor === c.name;
                  const disabled = c.stock <= 0;
                  return (
                    <button
                      key={c.name}
                      type="button"
                      disabled={disabled}
                      onClick={() => { setSelectedColor(c.name); setQty(1); }}
                      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all ${
                        active ? "border-ink ring-1 ring-ink" : disabled
                          ? "border-ink/10 opacity-45 cursor-not-allowed" : "border-ink/20 hover:border-ink/50"
                      }`}
                    >
                      <span className="h-4 w-4 rounded-full border border-ink/15 shrink-0" style={{ backgroundColor: colorToHex(c.name) }} />
                      <span>{c.name}</span>
                      <span className="text-xs text-ink/40">{disabled ? "Out of stock" : `${c.stock} left`}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <p className={`mt-4 text-sm font-medium flex items-center gap-2 ${availableStock > 0 ? "text-green-700" : "text-red-600"}`}>
            <span className={`inline-block h-2 w-2 rounded-full ${availableStock > 0 ? "bg-green-600" : "bg-red-600"}`} />
            {hasColors
              ? (availableStock > 0 ? `In Stock (${availableStock} available in ${selectedColor})` : `Out of stock (${selectedColor})`)
              : (availableStock > 0 ? `In Stock (${availableStock} available)` : "Out of Stock")}
          </p>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center border border-ink/20 rounded-lg">
              <button className="p-2.5 hover:bg-ink/5 transition-colors rounded-l-lg" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                <Minus className="h-4 w-4" />
              </button>
              <span className="px-5 font-medium min-w-[2.5rem] text-center">{qty}</span>
              <button className="p-2.5 hover:bg-ink/5 transition-colors rounded-r-lg" onClick={() => setQty((q) => Math.min(Math.max(1, availableStock), q + 1))}>
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
              <Button size="lg" className="w-full" disabled={outOfStock || adding} onClick={addToCart}>
                <ShoppingCart className="h-4 w-4 mr-2" /> {adding ? "Adding..." : "Add to Cart"}
              </Button>
            </motion.div>

            <motion.button whileTap={{ scale: 0.85 }} onClick={toggleFavorite} className="border border-ink/20 rounded-lg p-3 hover:bg-ink/5 transition-colors">
              <Heart className={`h-5 w-5 ${isFav ? "fill-ink text-ink" : ""}`} />
            </motion.button>
          </div>

          {/* Info boxes */}
          <div className="mt-8 space-y-3">
            <div className="flex items-start gap-3 p-4 bg-ink/5 rounded-lg">
              <MessageCircle className="h-5 w-5 shrink-0 mt-0.5 text-ink/60" />
              <div>
                <p className="text-sm font-medium">WhatsApp Ordering</p>
                <p className="text-xs text-ink/50 mt-0.5">
                  Place your order, then send a payment screenshot via WhatsApp to confirm.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-ink/5 rounded-lg">
              <Truck className="h-5 w-5 shrink-0 text-ink/60" />
              <p className="text-sm">Free shipping across Pakistan on all orders</p>
            </div>
            <div className="flex items-center gap-3 p-4 bg-ink/5 rounded-lg">
              <Shield className="h-5 w-5 shrink-0 text-ink/60" />
              <p className="text-sm">7-day easy returns. Quality guaranteed.</p>
            </div>
          </div>
        </div>
      </div>

      <ProductReviews itemId={item.id} />
    </div>
  );
}
