"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Search, ShoppingCart, Heart, User, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import type { Category } from "@/types";
import { useUIStore } from "@/lib/store";

export function Navbar() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { cartCount, favoritesCount } = useUIStore();

  useEffect(() => {
    const supabase = createClient();
    supabase.from("categories").select("*").order("name").then(({ data }) => {
      if (data) setCategories(data as Category[]);
    });
  }, []);

  const navLinkClass =
    "text-sm font-medium tracking-wide hover:opacity-60 transition-opacity";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-ink/10 bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
        {/* Logo */}
        <Link href="/" className="text-xl font-display font-bold tracking-tight text-ink">
          OPTIQUE
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className={navLinkClass}>Home</Link>

          <DropdownMenu>
            <DropdownMenuTrigger className={navLinkClass + " outline-none"}>
              Products
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <Link href="/products">All Products</Link>
              </DropdownMenuItem>
              {categories.map((c) => (
                <DropdownMenuItem key={c.id} asChild>
                  <Link href={`/products/${c.slug}`}>{c.name}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/about" className={navLinkClass}>About</Link>
          <Link href="/contact" className={navLinkClass}>Contact</Link>
        </nav>

        {/* Right icons */}
        <div className="flex items-center gap-4">
          <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={() => setSearchOpen((s) => !s)}>
            <Search className="h-5 w-5" />
          </motion.button>

          <Link href="/favorites" className="relative">
            <motion.div whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}>
              <Heart className="h-5 w-5" />
              {favoritesCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-ink text-[10px] text-cream">
                  {favoritesCount}
                </span>
              )}
            </motion.div>
          </Link>

          <Link href="/cart" className="relative">
            <motion.div whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}>
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-ink text-[10px] text-cream">
                  {cartCount}
                </span>
              )}
            </motion.div>
          </Link>

          <Link href="/account">
            <motion.div whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}>
              <User className="h-5 w-5" />
            </motion.div>
          </Link>

          <button className="md:hidden" onClick={() => setMobileOpen((v) => !v)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Search bar */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-ink/10 px-4 md:px-8"
          >
            <form action="/products" className="mx-auto max-w-7xl py-3">
              <input
                name="q"
                autoFocus
                placeholder="Search glasses..."
                className="w-full bg-transparent text-lg outline-none placeholder:text-ink/40"
              />
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden flex flex-col gap-4 border-t border-ink/10 px-4 py-4 overflow-hidden"
          >
            <Link href="/" onClick={() => setMobileOpen(false)}>Home</Link>
            <Link href="/products" onClick={() => setMobileOpen(false)}>Products</Link>
            {categories.map((c) => (
              <Link key={c.id} href={`/products/${c.slug}`} className="pl-4 text-ink/70" onClick={() => setMobileOpen(false)}>
                {c.name}
              </Link>
            ))}
            <Link href="/about" onClick={() => setMobileOpen(false)}>About</Link>
            <Link href="/contact" onClick={() => setMobileOpen(false)}>Contact</Link>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
