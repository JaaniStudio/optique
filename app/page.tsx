import { HeroSlider } from "@/components/hero-slider";
import { ProductCard } from "@/components/product-card";
import { Testimonials } from "@/components/testimonials";
import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Category, Item } from "@/types";
import { FadeIn } from "@/components/fade-in";

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
      <section className="mx-auto max-w-7xl px-4 md:px-8 py-20">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/40 mb-2">Collections</p>
          <h2 className="text-3xl md:text-4xl font-display font-bold">Shop by Category</h2>
          <p className="text-ink/50 mt-2">Find your perfect pair from our curated collections</p>
        </div>
        <FadeIn>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {(categories as Category[] | null)?.map((cat) => (
            <Link
              key={cat.id}
              href={`/products/${cat.slug}`}
              className="group relative aspect-[4/5] rounded-xl overflow-hidden bg-gradient-to-br from-ink/90 to-ink shadow-sm hover:shadow-lg transition-shadow"
            >
              {cat.image_url && (
                <Image
                  src={cat.image_url}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10" />
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 z-20">
                <span className="text-cream font-semibold text-lg tracking-wide drop-shadow-sm">{cat.name}</span>
                <span className="text-cream/80 text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Browse Collection →
                </span>
              </div>
              {!cat.image_url && (
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity z-10" />
              )}
            </Link>
          ))}
          </div>
        </FadeIn>
        <div className="mt-8 text-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-1 text-sm font-semibold text-ink/70 hover:text-ink transition-colors"
          >
            View All Categories <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-4 md:px-8 pb-20">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/40 mb-2">Just Added</p>
          <h2 className="text-3xl md:text-4xl font-display font-bold">New Arrivals</h2>
          <p className="text-ink/50 mt-2">The latest styles added to our collection</p>
        </div>
        <FadeIn delay={0.1}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {(items as Item[] | null)?.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>
      </FadeIn>
        <div className="mt-10 text-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-full bg-ink px-8 py-3 text-sm font-semibold text-cream transition-colors hover:bg-ink/85"
          >
            Explore All Products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Brand story / CTA */}
      <section className="mx-auto max-w-7xl px-4 md:px-8 pb-20">
        <FadeIn>
        <div className="relative rounded-2xl bg-gradient-to-br from-ink to-ink/80 overflow-hidden">
          <div className="relative z-10 px-8 md:px-16 py-14 md:py-16 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cream/50 mb-3">Chashmish</p>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-cream mb-4">
              Karachi's Eyewear Destination
            </h2>
            <p className="text-cream/70 max-w-2xl mx-auto mb-8 leading-relaxed">
              We bring you handpicked eyewear that blends quality, comfort, and style.
              Simple ordering, direct bank payment, and delivery right to your door.
            </p>
            <Link href="/products">
              <span className="inline-flex items-center gap-2 rounded-full bg-cream text-ink font-semibold px-8 py-3 transition-colors hover:bg-cream/90">
                Explore Collection <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </div>
        </div>
        </FadeIn>
      </section>

      {/* Testimonials */}
      <Testimonials />
    </div>
  );
}
