"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatPKR } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useUIStore } from "@/lib/store";

type CartRow = {
  id: string;
  quantity: number;
  item: {
    id: string; name: string; price: number; on_sale: boolean;
    sale_price: number | null; thumbnail_url: string | null; images: any[];
  };
};

export default function CartPage() {
  const [rows, setRows] = useState<CartRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [placing, setPlacing] = useState(false);
  const setCartCount = useUIStore((s) => s.setCartCount);

  async function load() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data } = await supabase
      .from("cart_items")
      .select("id, quantity, item:items(id, name, price, on_sale, sale_price, thumbnail_url, images)")
      .eq("user_id", user.id);

    setRows((data as any) || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function removeItem(id: string) {
    const supabase = createClient();
    await supabase.from("cart_items").delete().eq("id", id);
    const next = rows.filter((r) => r.id !== id);
    setRows(next);
    setCartCount(next.length);
  }

  const total = rows.reduce((sum, r) => {
    const price = r.item.on_sale && r.item.sale_price ? r.item.sale_price : r.item.price;
    return sum + price * r.quantity;
  }, 0);

  async function placeOrder() {
    if (!name || !phone || !address) {
      alert("Please fill in your name, phone, and address.");
      return;
    }
    setPlacing(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = "/login"; return; }

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: user.id, status: "pending", total,
        customer_name: name, customer_phone: phone, shipping_address: address,
      })
      .select()
      .single();

    if (error || !order) { alert("Something went wrong placing the order."); setPlacing(false); return; }

    const orderItems = rows.map((r) => ({
      order_id: order.id,
      item_id: r.item.id,
      item_name: r.item.name,
      item_price: r.item.on_sale && r.item.sale_price ? r.item.sale_price : r.item.price,
      quantity: r.quantity,
    }));
    await supabase.from("order_items").insert(orderItems);
    await supabase.from("cart_items").delete().eq("user_id", user.id);

    const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
    const summary = rows.map((r) => `${r.quantity}x ${r.item.name}`).join(", ");
    const message = encodeURIComponent(
      `Hi! I placed order #${order.id.slice(0, 8)} for: ${summary}. Total: ${formatPKR(total)}. I'll send my payment screenshot here.`
    );
    window.location.href = `https://wa.me/${waNumber}?text=${message}`;
  }

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-20 text-center">Loading cart...</div>;

  if (rows.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <p className="text-ink/60 mb-4">Your cart is empty.</p>
        <Link href="/products"><Button>Browse Products</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-12 grid md:grid-cols-3 gap-10">
      <div className="md:col-span-2 space-y-4">
        <h1 className="text-2xl font-display font-bold mb-6">Your Cart</h1>
        {rows.map((r) => {
          const price = r.item.on_sale && r.item.sale_price ? r.item.sale_price : r.item.price;
          return (
            <div key={r.id} className="flex items-center gap-4 border border-ink/10 rounded-lg p-4 bg-white">
              <div className="relative h-20 w-20 rounded-md overflow-hidden shrink-0 bg-cream">
                <Image src={r.item.thumbnail_url || r.item.images?.[0]?.url || "/placeholder-glasses.png"} alt={r.item.name} fill className="object-cover" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{r.item.name}</p>
                <p className="text-sm text-ink/60">Qty: {r.quantity}</p>
              </div>
              <p className="font-semibold">{formatPKR(price * r.quantity)}</p>
              <button onClick={() => removeItem(r.id)}><Trash2 className="h-4 w-4 text-ink/50 hover:text-red-600" /></button>
            </div>
          );
        })}
      </div>

      <div className="border border-ink/10 rounded-lg p-6 bg-white h-fit space-y-4">
        <h2 className="font-semibold text-lg">Order Summary</h2>
        <div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatPKR(total)}</span></div>
        <div className="flex justify-between font-semibold text-base border-t border-ink/10 pt-3"><span>Total</span><span>{formatPKR(total)}</span></div>

        <div className="space-y-3 pt-2">
          <Input placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Textarea placeholder="Delivery Address" value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>

        <Button className="w-full" size="lg" onClick={placeOrder} disabled={placing}>
          {placing ? "Placing Order..." : "Place Order via WhatsApp"}
        </Button>
        <p className="text-xs text-ink/50 text-center">
          You'll be redirected to WhatsApp to confirm payment with a screenshot.
        </p>
      </div>
    </div>
  );
}
