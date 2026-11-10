"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Instagram, Facebook, MessageCircle, Heart, ArrowUpRight } from "lucide-react";

type FloatingHeart = { id: number; x: number };

export function Footer() {
  const pathname = usePathname();
  const [hearts, setHearts] = useState<FloatingHeart[]>([]);
  const [loving, setLoving] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const wordY = useTransform(scrollYProgress, [0, 1], ["60%", "0%"]);
  const wordOpacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  if (pathname.startsWith("/admin")) return null;

  function loveBurst() {
    const id = Date.now();
    const x = Math.round((Math.random() * 2 - 1) * 40);
    setHearts((h) => [...h, { id, x }]);
    setLoving(true);
    setTimeout(() => {
      setHearts((h) => h.filter((heart) => heart.id !== id));
      setLoving(false);
    }, 1200);
  }

  return (
    <footer ref={ref} className="relative overflow-hidden rounded-t-[2.5rem] bg-ink text-cream">
      <div className="mx-auto max-w-7xl px-4 pt-20 md:px-8">
        <div className="flex flex-col gap-8 border-b border-cream/10 pb-14 md:flex-row md:items-end md:justify-between">
          <h3 className="max-w-xl font-display text-4xl font-bold leading-[1.05] md:text-6xl">
            Frames for the way <span className="italic text-sand">you</span> see.
          </h3>
          <Link href="/products" className="btn-pill btn-cream self-start md:self-end">
            Shop the collection <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <Link href="/" className="h-16">
            <img
              src="/logo.png"
              alt="Chashmish"
              className="h-28 w-auto invert -mt-6"
            />
          </Link>
          <p className="text-cream/60 text-sm leading-relaxed -mt-3">
            Premium eyewear from Karachi — sunglasses, eyeglasses & more,
            crafted for everyday style.
          </p>
        </div>

        <div>
          <h4 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.3em] text-sand">SHOP</h4>
          <ul className="space-y-2 text-sm text-cream/60">
            <li>
              <Link href="/products" className="link-underline transition-colors hover:text-cream">
                All Products
              </Link>
            </li>
            <li>
              <Link href="/products/sunglasses" className="link-underline transition-colors hover:text-cream">
                Sunglasses
              </Link>
            </li>
            <li>
              <Link href="/products/eyeglasses" className="link-underline transition-colors hover:text-cream">
                Eyeglasses
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.3em] text-sand">COMPANY</h4>
          <ul className="space-y-2 text-sm text-cream/60">
            <li>
              <Link href="/about" className="link-underline transition-colors hover:text-cream">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/contact" className="link-underline transition-colors hover:text-cream">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/terms" className="link-underline transition-colors hover:text-cream">
                Terms &amp; Conditions
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="link-underline transition-colors hover:text-cream">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.3em] text-sand">
            FOLLOW US
          </h4>
          <div className="flex gap-3 [&>a]:flex [&>a]:h-11 [&>a]:w-11 [&>a]:items-center [&>a]:justify-center [&>a]:rounded-full [&>a]:border [&>a]:border-cream/15 [&>a]:transition-all [&>a]:duration-500 hover:[&>a]:border-cream [&>a:hover]:bg-cream [&>a:hover]:text-ink [&>a:hover]:-translate-y-1">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "923249276352"}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
            >
              <MessageCircle className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>

      <motion.div
        style={{ y: wordY, opacity: wordOpacity }}
        aria-hidden
        className="pointer-events-none select-none whitespace-nowrap text-center font-display text-[19vw] font-bold leading-[0.8] text-cream/[0.06]"
      >
        Chashmish
      </motion.div>

      <div className="relative border-t border-cream/10 py-4 flex flex-col items-center gap-2 text-center text-xs text-cream/40">
        <p>&copy; {new Date().getFullYear()} Chashmish. All rights reserved.</p>
        <div className="relative">
          <AnimatePresence>
            {hearts.map((h) => (
              <motion.span
                key={h.id}
                initial={{ opacity: 1, y: 0, scale: 0.6 }}
                animate={{ opacity: 0, y: -42, scale: 1.3 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.1, ease: "easeOut" }}
                className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 text-sm"
                style={{ marginLeft: h.x }}
              >
                ❤️
              </motion.span>
            ))}
          </AnimatePresence>
          <motion.button
            onClick={loveBurst}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.8 }}
            className="inline-flex items-center gap-1.5 rounded-full bg-cream/5 px-3 py-1 text-cream/60 transition-colors hover:bg-cream/10 hover:text-cream/90"
          >
            Created with
            <motion.span
              className="inline-block"
              animate={loving ? { scale: [1, 1.5, 1] } : { scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <Heart className="h-3.5 w-3.5 fill-current text-red-400" />
            </motion.span>
            in Karachi
          </motion.button>
        </div>
      </div>
    </footer>
  );
}
