import { ProductCard } from "@/components/product-card";
import { createClient } from "@/lib/supabase/server";
import type { Item } from "@/types";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const supabase = createClient();
  let query = supabase.from("items").select("*, category:categories(*)").eq("is_active", true);

  if (searchParams.q) {
    query = query.ilike("name", `%${searchParams.q}%`);
  }

  const { data: items } = await query.order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8 py-12">
      <h1 className="text-3xl font-display font-bold mb-2">All Products</h1>
      {searchParams.q && (
        <p className="text-ink/60 mb-8">Results for &quot;{searchParams.q}&quot;</p>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-8">
        {(items as Item[] | null)?.map((item) => (
          <ProductCard key={item.id} item={item} />
        ))}
      </div>
      {items?.length === 0 && (
        <p className="text-center text-ink/50 py-20">No products found.</p>
      )}
    </div>
  );
}
