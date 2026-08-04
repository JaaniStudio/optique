"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, DollarSign, Package, Users, Clock, Truck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatPKR } from "@/lib/utils";
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
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold">Dashboard</h1>
        <p className="text-sm text-ink/50 mt-1">Overview of your store</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {cardConfigs.map(({ label, value: key, icon: Icon, color }) => {
          const val = stats[key as keyof Stats];
          const display = key === "totalSales" ? formatPKR(val as number) : val;
          return (
            <div key={label} className="rounded-xl border border-ink/10 bg-white p-5 transition-all hover:shadow-md">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold">{loading ? <span className="text-ink/20">--</span> : display}</p>
              <p className="text-sm text-ink/50">{label}</p>
            </div>
          );
        })}
      </div>

      <div className="border border-ink/10 rounded-xl bg-white p-6">
        <BannerEditor />
      </div>
    </div>
  );
}
