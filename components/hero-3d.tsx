"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ArrowDown, ArrowRight } from "lucide-react";

/**
 * Scroll-driven 3D hero.
 * A pair of glasses built from real CSS 3D planes (front frame + temples) is pinned
 * to the screen while the section scrolls. Scroll spins it through three "chapters",
 * the lenses tint from clear to dark, and the mouse adds a subtle parallax tilt.
 */

const chapters = [
  { kicker: "01 — Sunglasses", title: "See the world\ndifferently.", href: "/products/sunglasses", cta: "Shop Sunglasses" },
  { kicker: "02 — Eyeglasses", title: "Clarity, crafted\nfor every day.", href: "/products/eyeglasses", cta: "Shop Eyeglasses" },
  { kicker: "03 — Chashmish", title: "Karachi's own\neyewear house.", href: "/products", cta: "Explore All" },
];

export function Hero3D() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.4 });

  // Mouse parallax
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 60, damping: 15 });
  const smy = useSpring(my, { stiffness: 60, damping: 15 });

  useEffect(() => {
    if (reduce) return;
    function onMove(e: MouseEvent) {
      mx.set(e.clientX / window.innerWidth - 0.5);
      my.set(e.clientY / window.innerHeight - 0.5);
    }
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [mx, my, reduce]);

  // Glasses choreography
  const spinY = useTransform(p, [0, 0.33, 0.66, 1], [-28, 24, 200, 360]);
  const spinX = useTransform(p, [0, 0.33, 0.66, 1], [14, -6, 10, 0]);
  const tiltY = useTransform(smx, [-0.5, 0.5], [-14, 14]);
  const tiltX = useTransform(smy, [-0.5, 0.5], [10, -10]);
  const rotY = useTransform([spinY, tiltY] as MotionValue<number>[], ([a, b]: number[]) => a + b);
  const rotX = useTransform([spinX, tiltX] as MotionValue<number>[], ([a, b]: number[]) => a + b);
  const rotZ = useTransform(p, [0, 0.5, 1], [-4, 3, 0]);
  const scale = useTransform(p, [0, 0.3, 0.7, 1], [0.92, 1.12, 1.05, 0.78]);
  const gy = useTransform(p, [0, 1], ["0%", "-6%"]);

  // Lens tint: clear → sunglasses → clear
  const tint = useTransform(p, [0, 0.12, 0.33, 0.55, 0.75], [0.12, 0.85, 0.85, 0.2, 0.15]);
  const glare = useTransform(p, [0, 1], ["-80%", "180%"]);

  // Background typography + atmosphere
  const wordX = useTransform(p, [0, 1], ["8%", "-38%"]);
  const ringRot = useTransform(p, [0, 1], [0, 220]);
  const ringScale = useTransform(p, [0, 0.5, 1], [0.8, 1.15, 1.6]);
  const glowX = useTransform(smx, [-0.5, 0.5], ["35%", "65%"]);
  const glowY = useTransform(smy, [-0.5, 0.5], ["35%", "65%"]);
  const glow = useMotionTemplate`radial-gradient(600px circle at ${glowX} ${glowY}, rgba(201,183,156,0.28), transparent 60%)`;
  const progressW = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const cueOpacity = useTransform(scrollYProgress, [0, 0.06], [1, 0]);

  return (
    <section ref={ref} className="relative h-[420vh] bg-ink text-cream">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Atmosphere */}
        <motion.div className="absolute inset-0" style={{ background: glow }} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.55))]" />

        {/* Giant moving wordmark */}
        <motion.div
          style={{ x: wordX }}
          className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 whitespace-nowrap font-display text-[28vw] font-bold leading-none text-cream/[0.045] select-none"
        >
          Chashmish · Chashmish
        </motion.div>

        {/* Rotating optical rings */}
        <motion.div
          style={{ rotate: ringRot, scale: ringScale }}
          className="pointer-events-none absolute left-1/2 top-1/2 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2"
        >
          <div className="absolute inset-0 rounded-full border border-cream/10" />
          <div className="absolute inset-[12%] rounded-full border border-dashed border-cream/10" />
          <div className="absolute inset-[26%] rounded-full border border-sand/20" />
          <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sand" />
        </motion.div>

        {/* The glasses */}
        <div className="perspective absolute inset-0 flex items-center justify-center">
          <motion.div
            style={reduce ? undefined : { rotateY: rotY, rotateX: rotX, rotateZ: rotZ, scale, y: gy }}
            className="preserve-3d relative"
          >
            <Glasses tint={tint} glare={glare} />
          </motion.div>
        </div>

        {/* Chapters */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 top-0 mx-auto flex max-w-7xl flex-col justify-end px-6 pb-28 md:px-10 md:pb-28">
          <div className="relative h-[220px] md:h-[240px]">
            {chapters.map((c, i) => (
              <Chapter key={c.kicker} index={i} progress={p} {...c} />
            ))}
          </div>
        </div>

        {/* Top-right meta + bottom progress */}
        <div className="absolute right-6 top-8 hidden text-right text-[11px] uppercase tracking-[0.3em] text-cream/40 md:block md:right-10">
          <p>Est. Karachi</p>
          <p className="mt-1">Handpicked eyewear</p>
        </div>
        <motion.div
          style={{ opacity: cueOpacity }}
          className="absolute bottom-8 right-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-cream/60 md:right-10"
        >
          Scroll <ArrowDown className="h-3.5 w-3.5 animate-bounce" />
        </motion.div>
        <div className="absolute inset-x-0 bottom-0 h-px bg-cream/10">
          <motion.div style={{ width: progressW }} className="h-full bg-sand" />
        </div>
      </div>
    </section>
  );
}

function Chapter({
  index,
  progress,
  kicker,
  title,
  href,
  cta,
}: {
  index: number;
  progress: MotionValue<number>;
  kicker: string;
  title: string;
  href: string;
  cta: string;
}) {
  const start = index / 3;
  const end = (index + 1) / 3;
  const fadeIn = index === 0 ? [-1, 0] : [start - 0.04, start + 0.04];
  const fadeOut = index === 2 ? [2, 3] : [end - 0.05, end + 0.02];
  const opacity = useTransform(progress, [fadeIn[0], fadeIn[1], fadeOut[0], fadeOut[1]], [0, 1, 1, 0]);
  const y = useTransform(progress, [fadeIn[0], fadeIn[1], fadeOut[0], fadeOut[1]], [60, 0, 0, -60]);
  const blur = useTransform(progress, [fadeIn[0], fadeIn[1], fadeOut[0], fadeOut[1]], [12, 0, 0, 12]);
  const filter = useMotionTemplate`blur(${blur}px)`;
  const pointer = useTransform(opacity, (o) => (o > 0.6 ? "auto" : "none"));

  return (
    <motion.div style={{ opacity, y, filter, pointerEvents: pointer }} className="absolute inset-x-0 bottom-0">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.35em] text-sand">{kicker}</p>
          <h1 className="whitespace-pre-line font-display text-5xl font-bold leading-[0.95] tracking-tight md:text-7xl xl:text-[5.5rem]">
            {title}
          </h1>
        </div>
        <Link href={href} className="btn-pill btn-cream self-start md:self-end">
          {cta} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </motion.div>
  );
}

/** Glasses made from CSS 3D planes. Size scales with the viewport via --w. */
function Glasses({ tint, glare }: { tint: MotionValue<number>; glare: MotionValue<string> }) {
  const lensBg = useMotionTemplate`linear-gradient(160deg, rgba(60,44,30,${tint}) 0%, rgba(20,14,9,${tint}) 60%, rgba(201,183,156,${tint}) 140%)`;

  const lens = (side: "l" | "r") => (
    <div
      className={`relative h-[calc(var(--w)*0.34)] w-[calc(var(--w)*0.41)] overflow-hidden border-[calc(var(--w)*0.026)] border-[#2c241a] bg-cream/[0.04] shadow-[inset_0_0_30px_rgba(247,242,234,0.12)] ${
        side === "l" ? "rounded-[42%_38%_46%_52%/48%_44%_56%_52%]" : "rounded-[38%_42%_52%_46%/44%_48%_52%_56%]"
      }`}
    >
      <motion.div className="absolute inset-0" style={{ background: lensBg }} />
      <motion.div
        style={{ x: glare }}
        className="absolute -inset-y-4 left-0 w-1/3 -skew-x-[20deg] bg-gradient-to-r from-transparent via-cream/40 to-transparent"
      />
      <div className="absolute left-[14%] top-[12%] h-[18%] w-[30%] rounded-full bg-cream/25 blur-[2px]" />
    </div>
  );

  const temple = (side: "l" | "r") => (
    <div
      className={`absolute top-[16%] h-[calc(var(--w)*0.035)] w-[calc(var(--w)*0.62)] rounded-full bg-gradient-to-r from-[#3a2f23] to-[#1a140e] ${
        side === "l" ? "left-[1%] origin-left" : "right-[1%] origin-right"
      }`}
      style={{ transform: side === "l" ? "rotateY(90deg)" : "rotateY(-90deg)" }}
    >
      {/* ear tip */}
      <div
        className={`absolute top-0 h-full w-[22%] rounded-full bg-[#1a140e] ${side === "l" ? "right-0 origin-left" : "left-0 origin-right"}`}
        style={{ transform: `rotateZ(${side === "l" ? 24 : -24}deg)` }}
      />
    </div>
  );

  return (
    <div className="preserve-3d relative [--w:min(84vw,560px)]" style={{ width: "var(--w)" }}>
      {/* back plate for thickness */}
      <div className="absolute inset-0 flex items-center justify-between opacity-90" style={{ transform: "translateZ(-10px)" }}>
        <div className="h-[calc(var(--w)*0.34)] w-[calc(var(--w)*0.41)] rounded-[45%] border-[calc(var(--w)*0.026)] border-[#140f0a]" />
        <div className="h-[calc(var(--w)*0.34)] w-[calc(var(--w)*0.41)] rounded-[45%] border-[calc(var(--w)*0.026)] border-[#140f0a]" />
      </div>

      {/* front */}
      <div className="preserve-3d relative flex items-center justify-between drop-shadow-[0_40px_60px_rgba(0,0,0,0.6)]">
        {lens("l")}
        <div className="absolute left-1/2 top-[30%] h-[calc(var(--w)*0.05)] w-[calc(var(--w)*0.2)] -translate-x-1/2 rounded-t-full border-t-[calc(var(--w)*0.024)] border-[#2c241a]" />
        {lens("r")}
        {/* hinges */}
        <span className="absolute left-0 top-[14%] h-[calc(var(--w)*0.05)] w-[calc(var(--w)*0.04)] -translate-x-1/2 rounded-sm bg-sand/80" />
        <span className="absolute right-0 top-[14%] h-[calc(var(--w)*0.05)] w-[calc(var(--w)*0.04)] translate-x-1/2 rounded-sm bg-sand/80" />
      </div>

      {temple("l")}
      {temple("r")}
    </div>
  );
}
