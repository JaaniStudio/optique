"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Truck, ShieldCheck, Landmark, Glasses } from "lucide-react";

const words = "We bring you handpicked eyewear that blends quality, comfort and style — simple ordering, direct bank payment and delivery right to your door.".split(" ");

const perks = [
  { icon: Glasses, title: "Handpicked", text: "Every frame curated for fit & finish" },
  { icon: Landmark, title: "Bank Transfer", text: "Simple, direct and secure payment" },
  { icon: Truck, title: "Doorstep Delivery", text: "Across Karachi and Pakistan" },
  { icon: ShieldCheck, title: "Quality Promise", text: "Built to be worn every day" },
];

/** Scroll-scrubbed manifesto: each word lights up as you scroll through. */
export function BrandStory() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.6"] });
  const circle = useTransform(scrollYProgress, [0, 1], [0.6, 1.4]);

  return (
    <section ref={ref} className="relative overflow-hidden bg-ink py-28 text-cream md:py-40">
      <motion.div
        style={{ scale: circle }}
        className="pointer-events-none absolute -right-40 -top-40 h-[40rem] w-[40rem] rounded-full bg-sand/10 blur-3xl"
      />
      <div className="relative mx-auto max-w-6xl px-6 md:px-10">
        <p className="eyebrow mb-10 text-cream/50">The Chashmish way</p>
        <p className="font-display text-3xl font-bold leading-[1.15] md:text-6xl">
          {words.map((w, i) => (
            <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
              {w}
            </Word>
          ))}
        </p>

        <div className="mt-20 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-cream/10 bg-cream/10 md:grid-cols-4">
          {perks.map((perk, i) => (
            <motion.div
              key={perk.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group bg-ink p-6 transition-colors duration-500 hover:bg-accent md:p-8"
            >
              <perk.icon className="mb-6 h-6 w-6 text-sand transition-transform duration-500 group-hover:-translate-y-1" />
              <h3 className="font-semibold">{perk.title}</h3>
              <p className="mt-1 text-sm text-cream/50">{perk.text}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-14">
          <Link href="/about" className="btn-pill btn-ghost-light">
            Our story <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Word({
  children,
  progress,
  range,
}: {
  children: string;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.15, 1]);
  return (
    <motion.span style={{ opacity }} className="mr-[0.25em] inline-block">
      {children}
    </motion.span>
  );
}
