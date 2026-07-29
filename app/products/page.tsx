import { ProductGrid } from "@/components/product-grid";
import { createClient } from "@/lib/supabase/server";
import type { Item, Category } from "@/types";

export default async function ProductsPage() {
  const supabase = createClient();

  const { data: categories } = await supabase.from("categories").select("*").order("name");
  const { data: items } = await supabase
    .from("items")
    .select("*, category:categories(*)")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8 py-12">
      <h1 className="text-3xl font-display font-bold mb-2">All Products</h1>
      <ProductGrid
        items={(items as Item[]) || []}
        categories={(categories as Category[]) || []}
      />
    </div>
  );
}
