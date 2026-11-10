"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, ShoppingBag, Package, Users, LogOut, Tags, Glasses, Menu, X, ArrowUpRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Manage Orders", icon: ShoppingBag },
  { href: "/admin/items", label: "Add / Manage Items", icon: Package },
  { href: "/admin/categories", label: "Manage Categories", icon: Tags },
  { href: "/admin/lenses", label: "Manage Lenses", icon: Glasses },
  { href: "/admin/users", label: "Manage Users", icon: Users },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const panel = (
    <div className="relative flex h-full flex-col overflow-hidden bg-ink text-cream">
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 animate-spin-slow rounded-full border border-dashed border-cream/10" />
      <div className="border-b border-cream/10 px-6 py-7">
        <p className="font-display text-2xl font-bold tracking-tight">Chashmish</p>
        <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-cream/40">Admin Panel</p>
      </div>
      <nav className="relative flex-1 space-y-1 px-3 py-6">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex items-center gap-3 rounded-full px-4 py-3 text-sm font-medium transition-colors duration-300",
                active ? "text-ink" : "text-cream/65 hover:bg-cream/5 hover:text-cream"
              )}
            >
              {active && (
                <motion.span
                  layoutId="admin-active"
                  transition={{ type: "spring", stiffness: 400, damping: 34 }}
                  className="absolute inset-0 rounded-full bg-cream"
                />
              )}
              <Icon className="relative h-4 w-4" />
              <span className="relative">{label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="relative space-y-1 border-t border-cream/10 p-3">
        <Link href="/" className="flex items-center gap-3 rounded-full px-4 py-3 text-sm text-cream/60 transition-colors hover:bg-cream/5 hover:text-cream">
          <ArrowUpRight className="h-4 w-4" /> View store
        </Link>
        <button onClick={logout} className="flex w-full items-center gap-3 rounded-full px-4 py-3 text-sm text-cream/60 transition-colors hover:bg-cream/5 hover:text-cream">
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 md:block">{panel}</aside>

      {/* Mobile top bar */}
      <div className="glass fixed inset-x-0 top-0 z-40 flex items-center justify-between px-4 py-3 md:hidden">
        <p className="font-display text-lg font-bold">Chashmish <span className="text-xs font-normal text-ink/50">Admin</span></p>
        <button onClick={() => setOpen(true)} aria-label="Open menu" className="rounded-full border border-ink/15 p-2">
          <Menu className="h-5 w-5" />
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-sm md:hidden" />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 36 }}
              className="fixed inset-y-0 left-0 z-50 w-72 md:hidden"
            >
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="absolute right-4 top-6 z-10 rounded-full p-1 text-cream/70">
                <X className="h-5 w-5" />
              </button>
              {panel}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
