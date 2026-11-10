"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * Soft follower cursor (desktop / fine pointers only). Grows over links and buttons.
 * The native cursor stays visible, so usability is unaffected.
 */
export function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [hover, setHover] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.3 });
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.3 });

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;
    setEnabled(true);
    function move(e: MouseEvent) {
      x.set(e.clientX);
      y.set(e.clientY);
      const t = e.target as HTMLElement | null;
      setHover(!!t?.closest("a,button,[role=button],input,select,textarea"));
    }
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);

  if (!enabled) return null;
  return (
    <motion.div
      aria-hidden
      style={{ x: sx, y: sy }}
      className="pointer-events-none fixed left-0 top-0 z-[80] mix-blend-difference"
    >
      <motion.div
        animate={{ width: hover ? 48 : 10, height: hover ? 48 : 10 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="-translate-x-1/2 -translate-y-1/2 rounded-full bg-cream"
      />
    </motion.div>
  );
}
