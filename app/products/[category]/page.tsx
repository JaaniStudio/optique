import { ProductCard } from "@/components/product-card";
import { createClient } from "@/lib/supabase/server";
import type { Item, Category } from "@/types";
import { notFound } from "next/navigation";

export default async function CategoryPage({ params }: { params: { category: string } }) {
  const supabase = createClient();

  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", params.category)
    .single();

  if (!category) notFound();

  const { data: items } = await supabase
    .from("items")
    .select("*, category:categories(*)")
    .eq("category_id", (category as Category).id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8 py-12">
      <h1 className="text-3xl font-display font-bold mb-8">{(category as Category).name}</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {(items as Item[] | null)?.map((item) => (
          <ProductCard key={item.id} item={item} />
        ))}
      </div>
      {items?.length === 0 && (
        <p className="text-center text-ink/50 py-20">No products in this category yet.</p>
      )}
    </div>
  );
}
