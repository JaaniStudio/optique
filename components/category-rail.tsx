"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { Category } from "@/types";

/**
 * Pinned horizontal-scroll gallery: vertical scroll drives the cards sideways
 * on desktop; on mobile it falls back to a native swipe row.
 */
export function CategoryRail({ categories }: { categories: Category[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 100, damping: 28 });
  const track = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  useEffect(() => {
    function measure() {
      if (track.current) setDistance(Math.max(0, track.current.scrollWidth - window.innerWidth));
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [categories.length]);
  const x = useTransform(p, [0, 1], [0, -distance]);

  const cards = categories.map((cat, i) => <CategoryCard key={cat.id} cat={cat} index={i} />);

  return (
    <>
      {/* Desktop: pinned horizontal scroll */}
      <section ref={ref} className="relative hidden md:block" style={{ height: `${100 + categories.length * 35}vh` }}>
        <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
          <div className="mx-auto mb-10 flex w-full max-w-7xl items-end justify-between px-8">
            <div>
              <p className="eyebrow mb-4">Collections</p>
              <h2 className="section-title">
                Shop by <span className="italic text-ink/40">category</span>
              </h2>
            </div>
            <Link href="/products" className="link-underline text-sm font-semibold">
              View all collections
            </Link>
          </div>
          <motion.div ref={track} style={{ x }} className="flex w-max gap-6 pl-8 pr-8 lg:pl-[max(2rem,calc((100vw-80rem)/2+2rem))]">
            {cards}
          </motion.div>
        </div>
      </section>

      {/* Mobile: swipe row */}
      <section className="py-20 md:hidden">
        <div className="mb-8 px-4">
          <p className="eyebrow mb-4">Collections</p>
          <h2 className="section-title">Shop by category</h2>
        </div>
        <div className="hide-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4">{cards}</div>
      </section>
    </>
  );
}

function CategoryCard({ cat, index }: { cat: Category; index: number }) {
  return (
    <Link
      href={`/products/${cat.slug}`}
      className="group relative aspect-[3/4] w-[72vw] shrink-0 snap-start overflow-hidden rounded-[1.75rem] bg-ink md:w-[28vw] lg:w-[24vw]"
    >
      {cat.image_url ? (
        <Image
          src={cat.image_url}
          alt={cat.name}
          fill
          sizes="(min-width: 768px) 28vw, 72vw"
          className="object-cover transition-transform duration-[1.2s] ease-expo group-hover:scale-110"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-accent via-ink to-black" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
      <span className="absolute left-6 top-6 font-display text-sm text-cream/70">
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-cream/15 text-cream backdrop-blur transition-all duration-500 ease-expo group-hover:rotate-45 group-hover:bg-cream group-hover:text-ink">
        <ArrowUpRight className="h-5 w-5" />
      </span>
      <div className="absolute inset-x-6 bottom-6 text-cream">
        <h3 className="font-display text-3xl font-bold md:text-4xl">{cat.name}</h3>
        <p className="mt-2 max-h-0 overflow-hidden text-sm text-cream/70 transition-all duration-500 ease-expo group-hover:max-h-10">
          Browse the collection →
        </p>
      </div>
    </Link>
  );
}
