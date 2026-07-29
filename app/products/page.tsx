import { ProductCard } from "@/components/product-card";
import { ProductFilters } from "@/components/product-filters";
import { createClient } from "@/lib/supabase/server";
import type { Item, Category } from "@/types";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string; min_price?: string; max_price?: string };
}) {
  const supabase = createClient();

  const { data: categories } = await supabase.from("categories").select("*").order("name");

  let query = supabase.from("items").select("*, category:categories(*)").eq("is_active", true);

  if (searchParams.q) {
    query = query.ilike("name", `%${searchParams.q}%`);
  }

  if (searchParams.category) {
    query = query.eq("category.slug", searchParams.category);
  }

  if (searchParams.min_price) {
    query = query.gte("price", Number(searchParams.min_price));
  }

  if (searchParams.max_price) {
    query = query.lte("price", Number(searchParams.max_price));
  }

  const { data: items } = await query.order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8 py-12">
      <h1 className="text-3xl font-display font-bold mb-2">All Products</h1>
      {searchParams.q && (
        <p className="text-ink/60 mb-8">Results for &quot;{searchParams.q}&quot;</p>
      )}
      <div className="flex flex-col md:flex-row gap-8 mt-8">
        <div className="w-full md:w-56 shrink-0">
          <ProductFilters categories={(categories as Category[]) || []} />
        </div>
        <div className="flex-1">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {(items as Item[] | null)?.map((item) => (
              <ProductCard key={item.id} item={item} />
            ))}
          </div>
          {items?.length === 0 && (
            <p className="text-center text-ink/50 py-20">No products found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
