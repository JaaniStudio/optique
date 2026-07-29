import { HeroSlider } from "@/components/hero-slider";
import { ProductCard } from "@/components/product-card";
import { Testimonials } from "@/components/testimonials";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowRight, Shield, Truck, RefreshCw, MessageCircle } from "lucide-react";
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
      <section className="mx-auto max-w-7xl px-4 md:px-8 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-display font-bold">Shop by Category</h2>
            <p className="text-ink/50 mt-2">Find your perfect pair from our curated collections</p>
          </div>
          <Link
            href="/products"
            className="hidden md:flex items-center gap-1 text-sm font-medium text-ink/60 hover:text-ink transition-colors"
          >
            View All <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {(categories as Category[] | null)?.map((cat, i) => (
            <Link
              key={cat.id}
              href={`/products/${cat.slug}`}
              className="group relative aspect-[4/5] rounded-xl overflow-hidden bg-gradient-to-br from-ink/90 to-ink"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10" />
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 z-20">
                <span className="text-cream font-semibold text-lg tracking-wide">{cat.name}</span>
                <span className="text-cream/60 text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Browse Collection
                </span>
              </div>
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity z-10" />
            </Link>
          ))}
        </div>
        <div className="mt-6 text-center md:hidden">
          <Link href="/products" className="inline-flex items-center gap-1 text-sm font-medium text-ink/60 hover:text-ink">
            View All Categories <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-4 md:px-8 pb-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-display font-bold">New Arrivals</h2>
            <p className="text-ink/50 mt-2">The latest styles added to our collection</p>
          </div>
          <Link
            href="/products"
            className="hidden md:flex items-center gap-1 text-sm font-medium text-ink/60 hover:text-ink transition-colors"
          >
            View All <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {(items as Item[] | null)?.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* Features / Trust badges */}
      <section className="border-y border-ink/10 bg-ink/5">
        <div className="mx-auto max-w-7xl px-4 md:px-8 py-14 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { icon: Shield, title: "Quality Guaranteed", desc: "Premium eyewear you can trust" },
            { icon: Truck, title: "Fast Delivery", desc: "Free shipping across Pakistan" },
            { icon: RefreshCw, title: "Easy Returns", desc: "7-day hassle-free returns" },
            { icon: MessageCircle, title: "WhatsApp Support", desc: "Instant help when you need it" },
          ].map((feat) => (
            <div key={feat.title} className="text-center">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-ink/10 mb-4">
                <feat.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold mb-1">{feat.title}</h3>
              <p className="text-sm text-ink/50">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Brand story / CTA */}
      <section className="mx-auto max-w-7xl px-4 md:px-8 py-20">
        <div className="relative rounded-2xl bg-gradient-to-br from-ink to-ink/80 overflow-hidden">
          <div className="relative z-10 px-8 md:px-16 py-14 md:py-20 text-center">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-cream mb-4">
              Karachi's Eyewear Destination
            </h2>
            <p className="text-cream/70 max-w-2xl mx-auto mb-8 leading-relaxed">
              We bring you handpicked eyewear that blends quality, comfort, and style.
              Simple ordering, direct bank payment, and delivery right to your door.
            </p>
            <Link href="/products">
              <span className="inline-flex items-center gap-2 bg-cream text-ink font-semibold px-8 py-3 rounded-lg hover:bg-cream/90 transition-colors">
                Explore Collection <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />
    </div>
  );
}
