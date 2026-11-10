"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingCart, Minus, Plus, ChevronRight, Shield, Truck, MessageCircle, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPKR, colorToHex } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useUIStore } from "@/lib/store";
import { toast } from "@/components/ui/toast";
import type { Item, LensSelection } from "@/types";
import { ProductReviews } from "@/components/product-reviews";
import { LensSelectionDialog } from "@/components/lens-selection-dialog";

export function ProductDetail({ item }: { item: Item }) {
  const images = item.images?.length ? item.images : [{ url: "/placeholder-glasses.svg", path: "" }];
  const [activeImg, setActiveImg] = useState(item.thumbnail_url || images[0].url);
  const [qty, setQty] = useState(1);
  const [isFav, setIsFav] = useState(false);
  const [adding, setAdding] = useState(false);
  const [lensDialogOpen, setLensDialogOpen] = useState(false);
  const [pendingLensSelection, setPendingLensSelection] = useState<LensSelection | null>(null);
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
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    setLensDialogOpen(true);
  }

  async function confirmAddToCart(selection: LensSelection) {
    setLensDialogOpen(false);
    setAdding(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); setAdding(false); return; }

    const color = hasColors ? selectedColor : "";
    const { data: existing } = await supabase
      .from("cart_items").select("*").eq("user_id", user.id).eq("item_id", item.id).eq("color", color).single();

    const lensData = {
      lens_type: selection.lens_type,
      prescription_method: selection.prescription_method || null,
      right_eye: selection.right_eye ?? null,
      left_eye: selection.left_eye ?? null,
      eyesight_type: selection.eyesight_type || null,
      selected_lens_option_id: selection.selected_lens_option_id || null,
      prescription_image_url: selection.prescription_image_url || null,
    };

    if (existing) {
      await supabase.from("cart_items").update({ quantity: existing.quantity + qty, ...lensData }).eq("id", existing.id);
    } else {
      await supabase.from("cart_items").insert({ user_id: user.id, item_id: item.id, color, quantity: qty, ...lensData });
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

  const zoomRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);

  const perks = [
    { icon: MessageCircle, title: "WhatsApp Ordering", desc: "Place your order, then send a payment screenshot via WhatsApp to confirm." },
    { icon: Truck, title: "Free shipping", desc: "Free shipping across Pakistan on all orders" },
    { icon: Shield, title: "Easy returns", desc: "7-day easy returns. Quality guaranteed." },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 md:px-8 md:pt-10">
      {/* Breadcrumbs */}
      <motion.nav
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8 flex flex-wrap items-center gap-1.5 text-xs font-medium uppercase tracking-[0.18em] text-ink/40 md:mb-12"
      >
        <Link href="/" className="link-underline hover:text-ink">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/products" className="link-underline hover:text-ink">Products</Link>
        {item.category && (
          <>
            <ChevronRight className="h-3 w-3" />
            <Link href={`/products/${item.category.slug}`} className="link-underline hover:text-ink">
              {item.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-3 w-3" />
        <span className="max-w-[200px] truncate text-ink/70">{item.name}</span>
      </motion.nav>

      <div className="grid gap-10 md:grid-cols-2 lg:gap-16">
        {/* Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="md:sticky md:top-24 md:self-start"
        >
          <div
            ref={zoomRef}
            onMouseMove={(e) => {
              const r = zoomRef.current!.getBoundingClientRect();
              setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
            }}
            onMouseLeave={() => setZoom(null)}
            className="group relative aspect-square cursor-zoom-in overflow-hidden rounded-[2rem] border border-ink/10 bg-white shadow-soft"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeImg}
                initial={{ opacity: 0, scale: 1.06 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0"
              >
                <Image
                  src={activeImg}
                  alt={item.name}
                  fill
                  priority
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover transition-transform duration-300 ease-out"
                  style={zoom ? { transform: "scale(1.8)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
                />
              </motion.div>
            </AnimatePresence>
            {item.on_sale && <Badge variant="sale" className="absolute left-5 top-5 z-10">SALE</Badge>}
            <span className="pointer-events-none absolute bottom-5 right-5 z-10 rounded-full bg-cream/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/60 opacity-100 backdrop-blur transition-opacity duration-300 group-hover:opacity-0">
              Hover to zoom
            </span>
          </div>
          {images.length > 1 && (
            <div className="hide-scrollbar mt-4 flex gap-3 overflow-x-auto pb-1">
              {images.map((img, i) => {
                const active = activeImg === img.url;
                return (
                  <motion.button
                    key={i}
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveImg(img.url)}
                    className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition-all duration-300 ${
                      active ? "border-ink" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image src={img.url} alt={`${item.name} ${i + 1}`} fill sizes="80px" className="object-cover" />
                  </motion.button>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Info */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } } }}
        >
          {[
            item.category && (
              <p key="cat" className="eyebrow mb-4">{item.category.name}</p>
            ),
            <h1 key="title" className="font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl lg:text-6xl">{item.name}</h1>,
            <div key="price" className="mt-6 flex flex-wrap items-baseline gap-3">
              <span className="font-display text-3xl font-bold">{formatPKR(price)}</span>
              {item.on_sale && (
                <>
                  <span className="text-lg text-ink/40 line-through">{formatPKR(item.price)}</span>
                  <Badge variant="sale">Save {formatPKR(item.price - (item.sale_price || 0))}</Badge>
                </>
              )}
            </div>,
            item.description && (
              <p key="desc" className="mt-6 max-w-xl leading-relaxed text-ink/65">{item.description}</p>
            ),
            <div key="divider" className="my-8 h-px bg-ink/10" />,
            hasColors && (
              <div key="colors">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink/50">
                  Colour — <span className="text-ink">{selectedColor}</span>
                </p>
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
                        className={`group inline-flex items-center gap-2.5 rounded-full border py-1.5 pl-1.5 pr-4 text-sm transition-all duration-300 ${
                          active ? "border-ink bg-ink text-cream" : disabled
                            ? "cursor-not-allowed border-ink/10 opacity-45" : "border-ink/20 hover:border-ink"
                        }`}
                      >
                        <span className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-ink/15" style={{ backgroundColor: colorToHex(c.name) }}>
                          {active && <Check className="h-3 w-3 text-cream mix-blend-difference" />}
                        </span>
                        <span>{c.name}</span>
                        <span className={`text-xs ${active ? "text-cream/60" : "text-ink/40"}`}>{disabled ? "Out of stock" : `${c.stock} left`}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ),
            <p key="stock" className={`mt-6 flex items-center gap-2 text-sm font-medium ${availableStock > 0 ? "text-green-700" : "text-red-600"}`}>
              <span className="relative flex h-2.5 w-2.5">
                {availableStock > 0 && <span className="absolute inset-0 animate-ping rounded-full bg-green-500/60" />}
                <span className={`relative h-2.5 w-2.5 rounded-full ${availableStock > 0 ? "bg-green-600" : "bg-red-600"}`} />
              </span>
              {hasColors
                ? (availableStock > 0 ? `In Stock (${availableStock} available in ${selectedColor})` : `Out of stock (${selectedColor})`)
                : (availableStock > 0 ? `In Stock (${availableStock} available)` : "Out of Stock")}
            </p>,
            <div key="actions" className="mt-6 flex flex-wrap items-center gap-3">
              <div className="flex items-center rounded-full border border-ink/20 bg-white/60">
                <button aria-label="Decrease" className="rounded-l-full p-3.5 transition-colors hover:bg-ink/5" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                  <Minus className="h-4 w-4" />
                </button>
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={qty}
                    initial={{ y: 12, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -12, opacity: 0 }}
                    className="min-w-[2.5rem] text-center font-semibold"
                  >
                    {qty}
                  </motion.span>
                </AnimatePresence>
                <button aria-label="Increase" className="rounded-r-full p-3.5 transition-colors hover:bg-ink/5" onClick={() => setQty((q) => Math.min(Math.max(1, availableStock), q + 1))}>
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                disabled={outOfStock || adding}
                onClick={addToCart}
                className="btn-pill btn-ink min-w-[12rem] flex-1 py-4 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShoppingCart className="h-4 w-4" /> {adding ? "Adding..." : "Add to Cart"}
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={toggleFavorite}
                aria-label="Favourite"
                className={`rounded-full border p-4 transition-all duration-300 ${isFav ? "border-ink bg-ink text-cream" : "border-ink/20 hover:border-ink"}`}
              >
                <motion.span key={String(isFav)} initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 15 }} className="block">
                  <Heart className={`h-5 w-5 ${isFav ? "fill-current" : ""}`} />
                </motion.span>
              </motion.button>
            </div>,
            <div key="perks" className="mt-10 divide-y divide-ink/10 overflow-hidden rounded-[1.5rem] border border-ink/10 bg-white/60">
              {perks.map((p) => (
                <div key={p.title} className="group flex items-start gap-4 p-5 transition-colors duration-300 hover:bg-white">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink/5 transition-all duration-500 ease-expo group-hover:bg-ink group-hover:text-cream">
                    <p.icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{p.title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-ink/55">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>,
          ]
            .filter(Boolean)
            .map((node, idx) => (
              <motion.div
                key={idx}
                variants={{
                  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
                  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
                }}
              >
                {node}
              </motion.div>
            ))}
        </motion.div>
      </div>

      <div className="mt-24 border-t border-ink/10 pt-4">
        <ProductReviews itemId={item.id} />
      </div>

      <LensSelectionDialog
        open={lensDialogOpen}
        onClose={() => setLensDialogOpen(false)}
        onConfirm={confirmAddToCart}
      />
    </div>
  );
}
