"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

/** Card that tilts in 3D toward the cursor with a soft moving highlight. */
export function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [8, -8]), { stiffness: 200, damping: 20 });
  const ry = useSpring(useTransform(mx, [0, 1], [-8, 8]), { stiffness: 200, damping: 20 });
  const glow = useTransform([mx, my], ([x, y]: number[]) =>
    `radial-gradient(400px circle at ${x * 100}% ${y * 100}%, rgba(201,183,156,0.25), transparent 60%)`
  );

  return (
    <div className="perspective h-full">
      <motion.div
        ref={ref}
        onMouseMove={(e) => {
          const r = ref.current!.getBoundingClientRect();
          mx.set((e.clientX - r.left) / r.width);
          my.set((e.clientY - r.top) / r.height);
        }}
        onMouseLeave={() => { mx.set(0.5); my.set(0.5); }}
        style={{ rotateX: rx, rotateY: ry }}
        className={`preserve-3d relative h-full ${className}`}
      >
        <motion.div className="pointer-events-none absolute inset-0 rounded-[inherit]" style={{ background: glow }} />
        {children}
      </motion.div>
    </div>
  );
}
