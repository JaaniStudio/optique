import { PageHeader } from "@/components/page-header";
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
      <PageHeader eyebrow="The collection" title="All products" description="Every frame we carry — filter by category, price and colour to find your pair." />
      <ProductGrid
        items={(items as Item[]) || []}
        categories={(categories as Category[]) || []}
      />
    </div>
  );
}
