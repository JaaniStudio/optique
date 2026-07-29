"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Search, ShoppingCart, Heart, User, Menu, X, LayoutDashboard, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import type { Category } from "@/types";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { useUIStore } from "@/lib/store";
import { useRouter } from "next/navigation";

export function Navbar() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const { cartCount, favoritesCount } = useUIStore();
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.from("categories").select("*").order("name").then(({ data }) => {
      if (data) setCategories(data as Category[]);
    });

    supabase.auth.getUser().then(({ data: { user: u } }) => {
      if (!u) return;
      setUser(u);
      const isAdminFromAuth = (u?.app_metadata as Record<string, unknown>)?.is_admin === true;
      supabase.from("profiles").select("is_admin").eq("id", u.id).single().then(({ data: profile }) => {
        setIsAdmin(profile?.is_admin === true || isAdminFromAuth);
      });
      supabase.from("cart_items").select("id", { count: "exact", head: true }).eq("user_id", u.id).then(({ count }) => {
        if (count !== null) useUIStore.getState().setCartCount(count);
      });
      supabase.from("favorites").select("id", { count: "exact", head: true }).eq("user_id", u.id).then(({ count }) => {
        if (count !== null) useUIStore.getState().setFavoritesCount(count);
      });
    });
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    useUIStore.getState().setCartCount(0);
    useUIStore.getState().setFavoritesCount(0);
    setUser(null);
    await supabase.auth.signOut();
    router.push("/");
  }

  const navLinkClass =
    "text-sm font-medium tracking-wide hover:opacity-60 transition-opacity";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-ink/10 bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
        {/* Logo */}
        <Link href="/" className="text-xl font-display font-bold tracking-tight text-ink shrink-0">
          OPTIQUE
        </Link>

        {/* Desktop nav + search */}
        <div className="hidden md:flex items-center gap-6 flex-1 justify-center px-6">
          <nav className="flex items-center gap-6">
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

          <form action="/products" className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/40" />
            <input
              name="q"
              placeholder="Search in products..."
              className="w-full bg-ink/5 rounded-md py-1.5 pl-9 pr-3 text-sm outline-none placeholder:text-ink/40 focus:ring-1 focus:ring-ink/20 transition-all"
            />
          </form>
        </div>

        {/* Right icons */}
        <div className="flex items-center gap-4">
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}>
                <User className="h-5 w-5" />
              </motion.button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/account">My Account</Link>
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem asChild>
                  <Link href="/admin" className="flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    Admin Panel
                  </Link>
                </DropdownMenuItem>
              )}
              {user && (
                <DropdownMenuItem onClick={handleSignOut}>
                  <span className="flex items-center gap-2 text-red-600">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <button className="md:hidden" onClick={() => setMobileOpen((v) => !v)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile search bar */}
      <div className="md:hidden border-t border-ink/10 px-4 pb-3 pt-2">
        <form action="/products">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/40" />
            <input
              name="q"
              placeholder="Search in products..."
              className="w-full bg-ink/5 rounded-md py-2 pl-10 pr-4 text-sm outline-none placeholder:text-ink/40 focus:ring-1 focus:ring-ink/20 transition-all"
            />
          </div>
        </form>
      </div>

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
            {isAdmin && (
              <Link href="/admin" className="font-semibold flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                <LayoutDashboard className="h-4 w-4" /> Admin Panel
              </Link>
            )}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
