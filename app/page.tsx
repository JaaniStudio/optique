import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Hero3D } from "@/components/hero-3d";
import { ProductCard } from "@/components/product-card";
import { Testimonials } from "@/components/testimonials";
import { CategoryRail } from "@/components/category-rail";
import { BrandStory } from "@/components/brand-story";
import { Marquee } from "@/components/marquee";
import { RevealText } from "@/components/reveal-text";
import { FadeIn, FadeInItem, FadeInStagger } from "@/components/fade-in";
import { createClient } from "@/lib/supabase/server";
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
      <Hero3D />

      {/* Ticker */}
      <div className="border-y border-ink/10 bg-cream py-3 font-display text-base italic tracking-wide text-ink/70 md:py-4 md:text-lg">
        <Marquee items={["Sunglasses", "Eyeglasses", "Blue-light", "Made for Karachi", "Delivered to your door"]} />
      </div>

      <CategoryRail categories={(categories as Category[]) || []} />

      {/* New arrivals */}
      <section className="mx-auto max-w-7xl px-4 py-24 md:px-8 md:py-32">
        <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow mb-4">Just added</p>
            <RevealText text="New arrivals" className="section-title" />
          </div>
          <FadeIn delay={0.2}>
            <p className="max-w-sm leading-relaxed text-ink/60">
              The latest frames to land at Chashmish — fresh shapes, new tints, same everyday comfort.
            </p>
          </FadeIn>
        </div>

        <FadeInStagger className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
          {(items as Item[] | null)?.map((item) => (
            <FadeInItem key={item.id}>
              <ProductCard item={item} />
            </FadeInItem>
          ))}
        </FadeInStagger>

        <FadeIn className="mt-16 text-center">
          <Link href="/products" className="btn-pill btn-ink">
            Explore all products <ArrowRight className="h-4 w-4" />
          </Link>
        </FadeIn>
      </section>

      <BrandStory />

      <Testimonials />

      {/* Closing CTA */}
      <section className="relative overflow-hidden px-4 py-28 text-center md:py-40">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 animate-spin-slow rounded-full border border-dashed border-ink/10" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[24rem] w-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-ink/10" />
        <p className="eyebrow mb-6 justify-center">Find your pair</p>
        <RevealText
          text="Your next favourite frame is waiting."
          className="section-title mx-auto max-w-3xl md:text-7xl"
        />
        <FadeIn delay={0.3} className="mt-10 flex flex-wrap justify-center gap-3">
          <Link href="/products" className="btn-pill btn-ink">
            Shop now <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/contact" className="btn-pill btn-ghost">
            Talk to us
          </Link>
        </FadeIn>
      </section>
    </div>
  );
}
