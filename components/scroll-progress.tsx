"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { usePathname } from "next/navigation";

/** Thin page-scroll progress bar pinned to the very top of the viewport. */
export function ScrollProgress() {
  const pathname = usePathname();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  if (pathname?.startsWith("/admin")) return null;
  return (
    <motion.div
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[70] h-[2px] origin-left bg-gradient-to-r from-sand via-ink to-sand"
    />
  );
}
