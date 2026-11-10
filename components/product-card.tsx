"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Heart, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPKR } from "@/lib/utils";
import type { Item } from "@/types";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/lib/store";
import { toast } from "@/components/ui/toast";
import { ColorSwatches } from "@/components/color-swatches";

export function ProductCard({ item }: { item: Item }) {
  const [isFav, setIsFav] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from("favorites").select("id").eq("user_id", user.id).eq("item_id", item.id).maybeSingle().then(({ data }) => {
        if (data) setIsFav(true);
      });
    });
  }, [item.id]);

  async function toggleFavorite(e: React.MouseEvent) {
    e.preventDefault();
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

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-8, 8]), { stiffness: 200, damping: 20 });
  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  }
  function onLeave() {
    mx.set(0);
    my.set(0);
  }

  const price = item.on_sale && item.sale_price ? item.sale_price : item.price;

  return (
    <Link href={`/products/${item.category?.slug ?? "all"}/${item.id}`} className="block perspective">
      <motion.div
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ rotateX, rotateY }}
        className="group preserve-3d relative"
      >
        <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-bone shadow-soft transition-shadow duration-700 ease-expo group-hover:shadow-lift">
          <Image
            src={item.thumbnail_url || item.images?.[0]?.url || "/placeholder-glasses.svg"}
            alt={item.name}
            fill
            sizes="(min-width: 768px) 25vw, 50vw"
            className="object-cover transition-transform duration-[1.2s] ease-expo group-hover:scale-110"
          />
          {item.images?.[1]?.url && (
            <Image
              src={item.images[1].url}
              alt=""
              fill
              sizes="(min-width: 768px) 25vw, 50vw"
              className="object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          {item.on_sale && (
            <Badge variant="sale" className="absolute left-3 top-3 rounded-full px-3">SALE</Badge>
          )}
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={toggleFavorite}
            aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
            className="absolute right-3 top-3 rounded-full bg-cream/90 p-2.5 shadow-soft backdrop-blur transition-transform duration-300 hover:scale-110"
            style={{ transform: "translateZ(40px)" }}
          >
            <Heart className={`h-4 w-4 ${isFav ? "fill-ink text-ink" : "text-ink"}`} />
          </motion.button>
          <span className="absolute bottom-3 left-3 right-3 flex translate-y-4 items-center justify-between rounded-full bg-cream/95 px-4 py-2.5 text-xs font-semibold text-ink opacity-0 backdrop-blur transition-all duration-500 ease-expo group-hover:translate-y-0 group-hover:opacity-100">
            View details <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>

        <div className="px-1 pt-4">
          {item.category && (
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-ink/40">{item.category.name}</p>
          )}
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-lg font-semibold leading-tight text-ink">{item.name}</h3>
            <div className="shrink-0 text-right">
              <span className="block text-sm font-semibold">{formatPKR(price)}</span>
              {item.on_sale && (
                <span className="text-xs text-ink/40 line-through">{formatPKR(item.price)}</span>
              )}
            </div>
          </div>
          {item.colors?.length ? <ColorSwatches colors={item.colors} size="sm" showNames={false} className="mt-3" /> : null}
        </div>
      </motion.div>
    </Link>
  );
}
