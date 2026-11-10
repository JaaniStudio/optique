"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/** Dark inner-page hero: oversized outline word drifts sideways, rings spin, content lifts away on scroll. */
export function ParallaxHero({
  bigWord,
  children,
}: {
  bigWord: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const wordX = useTransform(scrollYProgress, [0, 1], ["0%", "-25%"]);
  const lift = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const ringScale = useTransform(scrollYProgress, [0, 1], [1, 1.5]);

  return (
    <section ref={ref} className="relative overflow-hidden bg-ink text-cream">
      <motion.div style={{ scale: ringScale }} className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="h-[44rem] w-[44rem] animate-spin-slow rounded-full border border-dashed border-cream/10" />
        <div className="absolute inset-24 rounded-full border border-cream/10" />
        <div className="absolute inset-48 rounded-full bg-sand/10 blur-3xl" />
      </motion.div>
      <motion.p
        style={{ x: wordX }}
        aria-hidden
        className="text-outline pointer-events-none absolute bottom-0 left-0 whitespace-nowrap font-display text-[22vw] font-bold leading-none text-cream/15"
      >
        {bigWord} {bigWord}
      </motion.p>
      <motion.div style={{ y: lift, opacity: fade }} className="relative mx-auto max-w-5xl px-4 pb-36 pt-28 text-center md:px-8 md:pb-48 md:pt-36">
        {children}
      </motion.div>
    </section>
  );
}
