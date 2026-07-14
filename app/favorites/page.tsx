"use client";

import { useEffect, useState } from "react";
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

  if (loading) return <div className="max-w-6xl mx-auto px-4 py-20 text-center">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
      <h1 className="text-2xl font-display font-bold mb-8">Your Favorites</h1>
      {items.length === 0 ? (
        <p className="text-ink/60">No favorites yet — tap the heart on any product to save it here.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {items.map((item) => <ProductCard key={item.id} item={item} />)}
        </div>
      )}
    </div>
  );
}
