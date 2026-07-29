"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { createClient } from "@/lib/supabase/client";
import type { Item } from "@/types";

export default function FavoritesPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase
        .from("favorites")
        .select("item:items(*, category:categories(*))")
        .eq("user_id", user.id);
      setItems((data || []).map((d: any) => d.item).filter(Boolean));
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="max-w-6xl mx-auto px-4 py-20 text-center text-ink/50">Loading...</div>;

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-ink/5 mb-6">
          <Heart className="h-8 w-8 text-ink/30" />
        </div>
        <h1 className="text-2xl font-display font-bold mb-3">No favorites yet</h1>
        <p className="text-ink/50 mb-8">
          Tap the heart icon on any product to save it here and come back to it later.
        </p>
        <Link href="/products"><Button size="lg">Browse Products <ArrowRight className="h-4 w-4 ml-2" /></Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Your Favorites</h1>
          <p className="text-ink/50 mt-1">{items.length} saved {items.length === 1 ? "item" : "items"}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {items.map((item) => <ProductCard key={item.id} item={item} />)}
      </div>
    </div>
  );
}
