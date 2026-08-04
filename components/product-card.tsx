"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPKR } from "@/lib/utils";
import type { Item } from "@/types";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/lib/store";
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
  }

  const price = item.on_sale && item.sale_price ? item.sale_price : item.price;

  return (
    <Link href={`/products/${item.category?.slug ?? "all"}/${item.id}`}>
      <motion.div
        whileHover={{ y: -6 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="group relative rounded-xl overflow-hidden border border-ink/10 bg-white shadow-sm hover:shadow-lg transition-shadow"
      >
        <div className="relative aspect-square bg-cream overflow-hidden">
          <Image
            src={item.thumbnail_url || item.images?.[0]?.url || "/placeholder-glasses.svg"}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {item.on_sale && (
            <Badge variant="sale" className="absolute top-3 left-3">SALE</Badge>
          )}
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={toggleFavorite}
            className="absolute top-3 right-3 rounded-full bg-white/90 p-2"
          >
            <Heart className={`h-4 w-4 ${isFav ? "fill-ink text-ink" : "text-ink"}`} />
          </motion.button>
        </div>

        <div className="p-4">
          {item.category && (
            <p className="text-xs uppercase tracking-wide text-ink/50 mb-1">{item.category.name}</p>
          )}
          <h3 className="font-medium text-ink">{item.name}</h3>
          <div className="mt-2 flex items-center gap-2">
            <span className="font-semibold">{formatPKR(price)}</span>
            {item.on_sale && (
              <span className="text-sm text-ink/40 line-through">{formatPKR(item.price)}</span>
            )}
          </div>
          {item.colors?.length ? <ColorSwatches colors={item.colors} size="sm" showNames={false} className="mt-2" /> : null}
          <span className="mt-3 inline-block text-xs font-medium underline underline-offset-4 opacity-0 group-hover:opacity-100 transition-opacity">
            View Details
          </span>
        </div>
      </motion.div>
    </Link>
  );
}
