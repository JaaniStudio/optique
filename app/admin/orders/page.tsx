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
import { Trash2, Check } from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"pending" | "completed" | "all">("pending");

  async function load() {
    const supabase = createClient();
    let query = supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false });
    if (statusFilter !== "all") query = query.eq("status", statusFilter);
    const { data } = await query;
    setOrders((data as Order[]) || []);
  }

  useEffect(() => {
    load();
    const supabase = createClient();
    const channel = supabase
      .channel("admin_orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, load)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

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

  return (
    <div>
      <h1 className="text-2xl font-display font-bold mb-8">Manage Orders</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Input
          placeholder="Search by order ID, name, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="all">All Orders</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filtered.map((o) => (
          <div key={o.id} className="border border-ink/10 rounded-lg p-4 bg-white">
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <p className="font-medium">#{o.id.slice(0, 8)} — {o.customer_name}</p>
                <p className="text-sm text-ink/50">{o.customer_phone} · {new Date(o.created_at).toLocaleString()}</p>
                <p className="text-sm text-ink/60 mt-1">{o.shipping_address}</p>
              </div>
              <div className="text-right">
                <Badge variant={o.status === "completed" ? "success" : "warning"}>{o.status}</Badge>
                <p className="font-semibold mt-2">{formatPKR(o.total)}</p>
              </div>
            </div>
            <ul className="text-sm text-ink/70 mt-3 space-y-0.5">
              {o.order_items?.map((oi) => <li key={oi.id}>{oi.quantity}x {oi.item_name}</li>)}
            </ul>
            <div className="flex gap-2 mt-4">
              {o.status !== "completed" && (
                <Button size="sm" onClick={() => completeOrder(o.id)}>
                  <Check className="h-3.5 w-3.5 mr-1" /> Mark Completed
                </Button>
              )}
              <Button size="sm" variant="destructive" onClick={() => deleteOrder(o.id)}>
                <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
              </Button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-ink/50 text-center py-16">No orders found.</p>}
      </div>
    </div>
  );
}
