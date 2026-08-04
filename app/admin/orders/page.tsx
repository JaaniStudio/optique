"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { formatPKR } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { Order } from "@/types";
import { Trash2, Check, Search, PackageOpen, Truck } from "lucide-react";

const statusStyles: Record<string, "success" | "warning" | "default"> = {
  completed: "success",
  in_transit: "warning",
  pending: "default",
  cancelled: "default",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"pending" | "in_transit" | "completed" | "all">("pending");
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const supabase = createClient();
      let query = supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false });
      if (statusFilter !== "all") query = query.eq("status", statusFilter);
      const { data } = await query;
      setOrders((data as Order[]) || []);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load orders:", err);
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const supabase = createClient();
    const channel = supabase
      .channel("admin_orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, load)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [statusFilter]);

  async function markInTransit(id: string) {
    const supabase = createClient();
    await supabase.from("orders").update({ status: "in_transit" }).eq("id", id);
  }

  async function completeOrder(id: string) {
    const supabase = createClient();
    await supabase.from("orders").update({ status: "completed", completed_at: new Date().toISOString() }).eq("id", id);
  }

  async function deleteOrder(id: string) {
    if (!confirm("Delete this order permanently?")) return;
    const supabase = createClient();
    await supabase.from("orders").delete().eq("id", id);
  }

  const filtered = orders.filter((o) =>
    !search ||
    o.id.toLowerCase().includes(search.toLowerCase()) ||
    o.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
    o.customer_phone?.includes(search)
  );

  if (loading) return <div className="text-center py-20 text-ink/50">Loading...</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold">Manage Orders</h1>
        <p className="text-sm text-ink/50 mt-1">Track and fulfill customer orders</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/30" />
          <Input
            placeholder="Search by ID, name, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_transit">In Transit</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="all">All Orders</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filtered.map((o) => (
          <div key={o.id} className="border border-ink/10 rounded-xl bg-white p-5 transition-all hover:shadow-sm">
            <div className="flex flex-wrap justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold">#{o.id.slice(0, 8)}</p>
                  <span className="text-ink/30">&middot;</span>
                  <p>{o.customer_name || "Unknown"}</p>
                  {o.customer_phone && (
                    <>
                      <span className="text-ink/30">&middot;</span>
                      <p className="text-sm text-ink/50">{o.customer_phone}</p>
                    </>
                  )}
                </div>
                <p className="text-sm text-ink/50 mt-1">{new Date(o.created_at).toLocaleString()}</p>
                {o.shipping_address && (
                  <p className="text-sm text-ink/60 mt-1 line-clamp-1">{o.shipping_address}</p>
                )}
              </div>
              <div className="text-right shrink-0">
                <Badge variant={statusStyles[o.status] || "default"}>{o.status.replace("_", " ")}</Badge>
                <p className="font-bold mt-2">{formatPKR(o.total)}</p>
              </div>
            </div>
            {o.order_items && o.order_items.length > 0 && (
              <div className="text-sm text-ink/60 mt-3 pt-3 border-t border-ink/5 space-y-0.5">
                {o.order_items.map((oi) => (
                  <p key={oi.id} className="flex justify-between">
                    <span>{oi.quantity}x {oi.item_name}{oi.color ? ` (${oi.color})` : ""}</span>
                    <span>{formatPKR(oi.item_price * oi.quantity)}</span>
                  </p>
                ))}
              </div>
            )}
            <div className="flex gap-2 mt-4 pt-3 border-t border-ink/5">
              {o.status === "pending" && (
                <Button size="sm" onClick={() => markInTransit(o.id)}>
                  <Truck className="h-3.5 w-3.5 mr-1" /> Mark In Transit
                </Button>
              )}
              {o.status === "in_transit" && (
                <Button size="sm" onClick={() => completeOrder(o.id)}>
                  <Check className="h-3.5 w-3.5 mr-1" /> Mark Completed
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={() => deleteOrder(o.id)}>
                <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
              </Button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-20">
            <PackageOpen className="h-10 w-10 mx-auto text-ink/20 mb-3" />
            <p className="text-ink/50">No orders found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
