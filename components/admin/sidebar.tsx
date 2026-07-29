"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, ShoppingBag, Package, Users, LogOut, Tags } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Manage Orders", icon: ShoppingBag },
  { href: "/admin/items", label: "Add / Manage Items", icon: Package },
  { href: "/admin/categories", label: "Manage Categories", icon: Tags },
  { href: "/admin/users", label: "Manage Users", icon: Users },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="w-64 shrink-0 bg-ink text-cream min-h-screen flex flex-col">
      <div className="px-6 py-6 border-b border-cream/10">
        <p className="text-xl font-display font-bold">OPTIQUE</p>
        <p className="text-xs text-cream/50">Admin Panel</p>
      </div>
      <nav className="flex-1 px-3 py-6 space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-cream text-ink" : "text-cream/70 hover:bg-cream/10 hover:text-cream"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <button onClick={logout} className="flex items-center gap-3 px-6 py-4 text-sm text-cream/60 hover:text-cream border-t border-cream/10">
        <LogOut className="h-4 w-4" /> Sign Out
      </button>
    </aside>
  );
}
