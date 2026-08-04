"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Search, ShoppingCart, Heart, User, Menu, X, LayoutDashboard, LogOut, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import type { Category } from "@/types";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { useUIStore } from "@/lib/store";
import { useRouter } from "next/navigation";

const navLinkClass = "text-sm font-medium tracking-wide hover:opacity-60 transition-opacity outline-none";

const menuBoxClass =
  "absolute top-full pt-2 z-50";

const menuPanelClass =
  "min-w-[190px] overflow-hidden rounded-xl border border-ink/10 bg-white p-1.5 text-ink shadow-xl";

const menuItemClass =
  "block w-full rounded-lg px-3 py-2 text-left text-sm text-ink transition-colors hover:bg-ink hover:text-cream";

export function HoverMenu({
  href,
  trigger,
  items,
  align = "left",
}: {
  href?: string;
  trigger: React.ReactNode;
  items: React.ReactNode;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearTimer() {
    if (timer.current) clearTimeout(timer.current);
  }
  function openMenu() { clearTimer(); setOpen(true); }
  function scheduleClose() {
    clearTimer();
    timer.current = setTimeout(() => setOpen(false), 120);
  }

  return (
    <div
      className="relative"
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
    >
      {href ? (
        <Link href={href} className="flex items-center gap-1 outline-none">
          {trigger}
        </Link>
      ) : (
        <button className="flex items-center outline-none" aria-haspopup="menu" aria-expanded={open}>
          {trigger}
        </button>
      )}

      {open && (
        <div
          className={`${menuBoxClass} ${align === "right" ? "right-0" : "left-0"}`}
          onMouseEnter={openMenu}
          onClick={() => setOpen(false)}
        >
          <div className={menuPanelClass}>{items}</div>
        </div>
      )}
    </div>
  );
}

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

  return (
    <header className="sticky top-0 z-40 w-full border-b border-ink/10 bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
        {/* Logo */}
        <Link href="/" className="text-xl font-display font-bold tracking-tight text-ink shrink-0">
          CHASHMISH
        </Link>

        {/* Desktop nav + search */}
        <div className="hidden md:flex items-center gap-6 flex-1 justify-center px-6">
          <nav className="flex items-center gap-6">
            <Link href="/" className={navLinkClass}>Home</Link>

            <HoverMenu
              href="/products"
              trigger={
                <>
                  Products
                  <ChevronDown className="h-3.5 w-3.5 text-ink/50" />
                </>
              }
              items={
                <>
                  {categories.map((c) => (
                    <Link
                      key={c.id}
                      href={`/products/${c.slug}`}
                      className={menuItemClass}
                    >
                      {c.name}
                    </Link>
                  ))}
                  <div className="my-1 h-px bg-ink/10" />
                  <Link href="/products" className={`${menuItemClass} font-medium`}>
                    View All Products
                  </Link>
                </>
              }
            />

            <Link href="/about" className={navLinkClass}>About</Link>
            <Link href="/contact" className={navLinkClass}>Contact</Link>
          </nav>

          <form action="/products" className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/40" />
            <input
              name="q"
              placeholder="Search in products..."
              className="w-full rounded-md bg-ink/5 py-1.5 pl-9 pr-3 text-sm outline-none placeholder:text-ink/40 focus:ring-1 focus:ring-ink/20 transition-all"
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

          <HoverMenu
            align="right"
            trigger={
              <motion.span whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} className="block">
                <User className="h-5 w-5" />
              </motion.span>
            }
            items={
              <>
                <Link href="/account" className={menuItemClass}>My Account</Link>
                {isAdmin && (
                  <Link href="/admin" className={`${menuItemClass} flex items-center gap-2`}>
                    <LayoutDashboard className="h-4 w-4" />
                    Admin Panel
                  </Link>
                )}
                {user && (
                  <button onClick={handleSignOut} className={`${menuItemClass} flex items-center gap-2 text-red-600`}>
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                )}
              </>
            }
          />

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
              className="w-full rounded-md bg-ink/5 py-2 pl-10 pr-4 text-sm outline-none placeholder:text-ink/40 focus:ring-1 focus:ring-ink/20 transition-all"
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