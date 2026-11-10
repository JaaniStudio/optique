"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, DollarSign, Package, Users, Clock, Truck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatPKR } from "@/lib/utils";
import { motion } from "framer-motion";
import { BannerEditor } from "@/components/admin/banner-editor";

type Stats = {
  totalOrders: number;
  totalSales: number;
  totalStock: number;
  totalUsers: number;
  pendingOrders: number;
  inTransitOrders: number;
};

const cardConfigs = [
  { label: "Total Orders", value: "totalOrders", icon: ShoppingBag, color: "bg-blue-50 text-blue-600" },
  { label: "Orders Pending", value: "pendingOrders", icon: Clock, color: "bg-amber-50 text-amber-600" },
  { label: "In Transit", value: "inTransitOrders", icon: Truck, color: "bg-orange-50 text-orange-600" },
  { label: "Total Sales", value: "totalSales", icon: DollarSign, color: "bg-emerald-50 text-emerald-600" },
  { label: "Items in Stock", value: "totalStock", icon: Package, color: "bg-violet-50 text-violet-600" },
  { label: "Total Users", value: "totalUsers", icon: Users, color: "bg-rose-50 text-rose-600" },
] as const;

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0, totalSales: 0, totalStock: 0, totalUsers: 0,
    pendingOrders: 0, inTransitOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  async function loadStats() {
    try {
      const supabase = createClient();
      const { count: totalOrders } = await supabase.from("orders").select("*", { count: "exact", head: true });
      const { count: pendingOrders } = await supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending");
      const { count: inTransitOrders } = await supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "in_transit");
      const { data: completedOrders } = await supabase.from("orders").select("total").eq("status", "completed");
      const totalSales = (completedOrders || []).reduce((s, o) => s + Number(o.total), 0);
      const { data: items } = await supabase.from("items").select("stock");
      const totalStock = (items || []).reduce((s, i) => s + Number(i.stock), 0);
      const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact", head: true });
      setStats({
        totalOrders: totalOrders || 0,
        pendingOrders: pendingOrders || 0,
        inTransitOrders: inTransitOrders || 0,
        totalSales, totalStock, totalUsers: totalUsers || 0,
      });
      setLoading(false);
    } catch (err) {
      console.error("Failed to load stats:", err);
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStats();
    const supabase = createClient();
    const channel = supabase
      .channel("admin_dashboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, loadStats)
      .on("postgres_changes", { event: "*", schema: "public", table: "items" }, loadStats)
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, loadStats)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div>
      <div className="relative mb-10 overflow-hidden rounded-[2rem] bg-ink p-8 text-cream md:p-10">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 animate-spin-slow rounded-full border border-dashed border-cream/15" />
        <div className="pointer-events-none absolute -right-4 -top-4 h-40 w-40 rounded-full border border-cream/10" />
        <p className="eyebrow mb-4 text-cream/50">Overview</p>
        <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">Dashboard</h1>
        <p className="mt-2 text-sm text-cream/60">Overview of your store — updates live as orders come in.</p>
        <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-cream/15 bg-cream/5 px-3 py-1 text-xs text-cream/70">
          <span className="relative flex h-2 w-2"><span className="absolute inset-0 animate-ping rounded-full bg-green-400/70" /><span className="relative h-2 w-2 rounded-full bg-green-400" /></span>
          Live
        </span>
      </div>

      <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-3">
        {cardConfigs.map(({ label, value: key, icon: Icon }, i) => {
          const val = stats[key as keyof Stats];
          const display = key === "totalSales" ? formatPKR(val as number) : val;
          return (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4 }}
              className="group relative overflow-hidden rounded-[1.5rem] border border-ink/10 bg-white p-5 shadow-soft transition-shadow duration-500 hover:shadow-lift md:p-6"
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-ink/5 text-ink transition-all duration-500 ease-expo group-hover:bg-ink group-hover:text-cream">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="font-display text-xs text-ink/30">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <p className="font-display text-2xl font-bold md:text-3xl">{loading ? <span className="inline-block h-7 w-16 animate-pulse rounded bg-ink/10 align-middle" /> : display}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-ink/45">{label}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="rounded-[1.5rem] border border-ink/10 bg-white p-6 shadow-soft md:p-8">
        <BannerEditor />
      </div>
    </div>
  );
}
