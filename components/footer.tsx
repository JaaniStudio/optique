import Link from "next/link";
import { Instagram, Facebook, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-ink text-cream mt-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <h3 className="text-xl font-display font-bold mb-3">OPTIQUE</h3>
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
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-sm tracking-wide">FOLLOW US</h4>
          <div className="flex gap-4">
            <Instagram className="h-5 w-5 hover:opacity-70 cursor-pointer" />
            <Facebook className="h-5 w-5 hover:opacity-70 cursor-pointer" />
            <MessageCircle className="h-5 w-5 hover:opacity-70 cursor-pointer" />
          </div>
        </div>
      </div>
      <div className="border-t border-cream/10 py-4 text-center text-xs text-cream/40">
        © {new Date().getFullYear()} Optique. All rights reserved.
      </div>
    </footer>
  );
}
