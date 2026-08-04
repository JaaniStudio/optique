"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Instagram, Facebook, MessageCircle, Heart } from "lucide-react";

type FloatingHeart = { id: number; x: number };

export function Footer() {
  const pathname = usePathname();
  const [hearts, setHearts] = useState<FloatingHeart[]>([]);
  const [loving, setLoving] = useState(false);
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
    <footer className="bg-ink text-cream">
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <h3 className="text-xl font-display font-bold mb-3">CHASHMISH</h3>
          <p className="text-cream/60 text-sm leading-relaxed">
            Premium eyewear from Karachi — sunglasses, eyeglasses & more, crafted for everyday style.
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-sm tracking-wide">SHOP</h4>
          <ul className="space-y-2 text-sm text-cream/60">
            <li><Link href="/products" className="hover:text-cream">All Products</Link></li>
            <li><Link href="/products/sunglasses" className="hover:text-cream">Sunglasses</Link></li>
            <li><Link href="/products/eyeglasses" className="hover:text-cream">Eyeglasses</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-sm tracking-wide">COMPANY</h4>
          <ul className="space-y-2 text-sm text-cream/60">
            <li><Link href="/about" className="hover:text-cream">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-cream">Contact</Link></li>
            <li><Link href="/terms" className="hover:text-cream">Terms &amp; Conditions</Link></li>
            <li><Link href="/privacy" className="hover:text-cream">Privacy Policy</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-sm tracking-wide">FOLLOW US</h4>
          <div className="flex gap-4">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <Instagram className="h-5 w-5 hover:opacity-70" />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <Facebook className="h-5 w-5 hover:opacity-70" />
            </a>
            <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "923249276352"}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
              <MessageCircle className="h-5 w-5 hover:opacity-70" />
            </a>
          </div>
        </div>
      </div>

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
