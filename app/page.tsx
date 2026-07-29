import { HeroSlider } from "@/components/hero-slider";
import { ProductCard } from "@/components/product-card";
import { Testimonials } from "@/components/testimonials";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Category, Item } from "@/types";

export const revalidate = 60;

export default async function HomePage() {
  const supabase = createClient();

  const { data: categories } = await supabase.from("categories").select("*").order("name");
  const { data: items } = await supabase
    .from("items")
    .select("*, category:categories(*)")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(8);

  return (
    <div>
      <HeroSlider />

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 md:px-8 py-16">
        <h2 className="text-2xl md:text-3xl font-display font-bold mb-8">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {(categories as Category[] | null)?.map((cat) => (
            <Link
              key={cat.id}
              href={`/products/${cat.slug}`}
              className="group relative aspect-square rounded-lg overflow-hidden bg-ink"
            >
              <div className="absolute inset-0 flex items-center justify-center text-cream font-medium text-center px-2 group-hover:bg-black/50 bg-black/30 transition-colors">
                {cat.name}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-4 md:px-8 pb-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-display font-bold">New Arrivals</h2>
          <Link href="/products" className="text-sm underline underline-offset-4">View all</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {(items as Item[] | null)?.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />
    </div>
  );
}
