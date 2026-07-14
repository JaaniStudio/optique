"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Slide = {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
};

const slides: Slide[] = [
  {
    id: "1",
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=1600&auto=format&fit=crop",
    title: "See The World Differently",
    subtitle: "New season sunglasses collection, now live",
    cta: "Shop Sunglasses",
    href: "/products/sunglasses",
  },
  {
    id: "2",
    image: "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?q=80&w=1600&auto=format&fit=crop",
    title: "Everyday Clarity",
    subtitle: "Eyeglasses built for comfort, made for style",
    cta: "Shop Eyeglasses",
    href: "/products/eyeglasses",
  },
  {
    id: "3",
    image: "https://images.unsplash.com/photo-1577803645773-f96470509666?q=80&w=1600&auto=format&fit=crop",
    title: "Karachi's Own Eyewear",
    subtitle: "Locally curated, delivered to your door",
    cta: "Browse All",
    href: "/products",
  },
];

export function HeroSlider() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selected, setSelected] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", () => setSelected(emblaApi.selectedScrollSnap()));
    const timer = setInterval(() => emblaApi.scrollNext(), 5000);
    return () => clearInterval(timer);
  }, [emblaApi]);

  return (
    <div className="relative overflow-hidden" ref={emblaRef}>
      <div className="flex">
        {slides.map((slide) => (
          <div key={slide.id} className="relative min-w-0 flex-[0_0_100%] h-[70vh]">
            <Image src={slide.image} alt={slide.title} fill priority className="object-cover" />
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-0 flex flex-col items-start justify-center px-8 md:px-20 text-cream">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl md:text-6xl font-display font-bold max-w-xl"
              >
                {slide.title}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="mt-4 text-lg max-w-md text-cream/80"
              >
                {slide.subtitle}
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
                <Link href={slide.href}>
                  <Button size="lg" className="mt-6 bg-cream text-ink hover:bg-cream/90">
                    {slide.cta}
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        ))}
      </div>

      <button onClick={scrollPrev} className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-cream/20 p-2 text-cream hover:bg-cream/30">
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button onClick={scrollNext} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-cream/20 p-2 text-cream hover:bg-cream/30">
        <ChevronRight className="h-6 w-6" />
      </button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            className={`h-1.5 rounded-full transition-all ${i === selected ? "w-6 bg-cream" : "w-1.5 bg-cream/40"}`}
          />
        ))}
      </div>
    </div>
  );
}
