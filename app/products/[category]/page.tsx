import { ProductGrid } from "@/components/product-grid";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Item, Category } from "@/types";
import { notFound } from "next/navigation";

export default async function CategoryPage({ params }: { params: { category: string } }) {
  const supabase = createClient();

  const { data: categories } = await supabase.from("categories").select("*").order("name");

  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", params.category)
    .single();

  if (!category) notFound();

  const cat = category as Category;

  const { data: items } = await supabase
    .from("items")
    .select("*, category:categories(*)")
    .eq("category_id", cat.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm text-ink/40 mb-8">
        <Link href="/" className="hover:text-ink/70 transition-colors">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/products" className="hover:text-ink/70 transition-colors">Products</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-ink/70">{cat.name}</span>
      </nav>

      <h1 className="text-3xl md:text-4xl font-display font-bold">{cat.name}</h1>
      <ProductGrid
        items={(items as Item[]) || []}
        categories={(categories as Category[]) || []}
      />
    </div>
  );
}
