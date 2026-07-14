"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPKR } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { Order } from "@/types";

export default function AccountPage() {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data } = await supabase
          .from("orders")
          .select("*, order_items(*)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        setOrders((data as Order[]) || []);
      }
      setLoading(false);
    })();
  }, []);

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-20 text-center">Loading...</div>;

  if (!user) {
    return (
      <div className="max-w-sm mx-auto px-4 py-20 text-center">
        <p className="mb-4 text-ink/60">You need to sign in to view your account.</p>
        <Link href="/login"><Button>Sign In</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-display font-bold">My Account</h1>
        <Button variant="outline" onClick={logout}>Sign Out</Button>
      </div>
      <p className="text-ink/60 mb-10">{user.email}</p>

      <h2 className="font-semibold mb-4">Order History</h2>
      <div className="space-y-4">
        {orders.length === 0 && <p className="text-ink/50">No orders yet.</p>}
        {orders.map((o) => (
          <div key={o.id} className="border border-ink/10 rounded-lg p-4 bg-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">Order #{o.id.slice(0, 8)}</p>
                <p className="text-sm text-ink/50">{new Date(o.created_at).toLocaleDateString()}</p>
              </div>
              <Badge variant={o.status === "completed" ? "success" : "warning"}>{o.status}</Badge>
            </div>
            <ul className="mt-3 text-sm text-ink/70 space-y-1">
              {o.order_items?.map((oi) => (
                <li key={oi.id}>{oi.quantity}x {oi.item_name}</li>
              ))}
            </ul>
            <p className="mt-3 font-semibold">{formatPKR(o.total)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
