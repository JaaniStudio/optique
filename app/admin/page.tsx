"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingBag, DollarSign, Package, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatPKR } from "@/lib/utils";
import { BannerEditor } from "@/components/admin/banner-editor";

type Stats = { totalOrders: number; totalSales: number; totalStock: number; totalUsers: number };

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ totalOrders: 0, totalSales: 0, totalStock: 0, totalUsers: 0 });

  async function loadStats() {
    const supabase = createClient();

    const { count: totalOrders } = await supabase.from("orders").select("*", { count: "exact", head: true });
    const { data: completedOrders } = await supabase.from("orders").select("total").eq("status", "completed");
    const totalSales = (completedOrders || []).reduce((s, o) => s + Number(o.total), 0);
    const { data: items } = await supabase.from("items").select("stock");
    const totalStock = (items || []).reduce((s, i) => s + Number(i.stock), 0);
    const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact", head: true });

    setStats({ totalOrders: totalOrders || 0, totalSales, totalStock, totalUsers: totalUsers || 0 });
  }

  useEffect(() => {
    loadStats();
    const supabase = createClient();
    // Live-updating stats: refresh whenever orders/items/profiles change anywhere
    const channel = supabase
      .channel("admin_dashboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, loadStats)
      .on("postgres_changes", { event: "*", schema: "public", table: "items" }, loadStats)
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, loadStats)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const cards = [
    { label: "Total Orders", value: stats.totalOrders, icon: ShoppingBag },
    { label: "Total Sales", value: formatPKR(stats.totalSales), icon: DollarSign },
    { label: "Items in Stock", value: stats.totalStock, icon: Package },
    { label: "Total Users", value: stats.totalUsers, icon: Users },
  ];

  return (
    <div>
      <h1 className="text-2xl font-display font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {cards.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="pt-6">
              <Icon className="h-5 w-5 text-ink/50 mb-3" />
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-sm text-ink/50">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <BannerEditor />
    </div>
  );
}
