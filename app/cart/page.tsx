"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, ShoppingBag, Minus, Plus, ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatPKR, normalizePhone } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useUIStore } from "@/lib/store";

type CartRow = {
  id: string;
  quantity: number;
  color: string;
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
  const router = useRouter();
  const setCartCount = useUIStore((s) => s.setCartCount);

  async function load() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data } = await supabase
      .from("cart_items")
      .select("id, quantity, color, item:items(id, name, price, on_sale, sale_price, thumbnail_url, images)")
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

  async function updateQty(id: string, delta: number) {
    const supabase = createClient();
    const row = rows.find((r) => r.id === id);
    if (!row) return;
    const newQty = Math.max(1, row.quantity + delta);
    if (newQty === row.quantity) return;
    await supabase.from("cart_items").update({ quantity: newQty }).eq("id", id);
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, quantity: newQty } : r));
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
    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) {
      alert("Please enter a valid Pakistani phone number (e.g. +92 3XX XXXXXXX).");
      return;
    }
    setPlacing(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: user.id, status: "pending", total,
        customer_name: name, customer_phone: normalizedPhone, shipping_address: address,
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
      color: r.color || "",
    }));
    await supabase.from("order_items").insert(orderItems);
    await supabase.from("cart_items").delete().eq("user_id", user.id);
    setCartCount(0);

    const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
    const summary = rows.map((r) => `${r.quantity}x ${r.item.name}${r.color ? ` (${r.color})` : ""}`).join(", ");
    const message = encodeURIComponent(
      `Hi! I placed order #${order.id.slice(0, 8)} for: ${summary}. Total: ${formatPKR(total)}. I'll send my payment screenshot here.`
    );
    window.location.href = `https://wa.me/${waNumber}?text=${message}`;
  }

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-20 text-center">Loading cart...</div>;

  if (rows.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-ink/5 mb-6">
          <ShoppingBag className="h-8 w-8 text-ink/30" />
        </div>
        <h1 className="text-2xl font-display font-bold mb-3">Your cart is empty</h1>
        <p className="text-ink/50 mb-8">Looks like you haven't added anything yet. Browse our collection and find your perfect pair.</p>
        <Link href="/products"><Button size="lg">Browse Products <ArrowRight className="h-4 w-4 ml-2" /></Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 grid md:grid-cols-3 gap-10">
      <div className="md:col-span-2">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-display font-bold">Your Cart</h1>
          <p className="text-sm text-ink/50">{rows.length} {rows.length === 1 ? "item" : "items"}</p>
        </div>
        <div className="space-y-4">
          {rows.map((r) => {
            const price = r.item.on_sale && r.item.sale_price ? r.item.sale_price : r.item.price;
            return (
              <div key={r.id} className="flex items-center gap-4 border border-ink/10 rounded-xl p-4 bg-white shadow-sm">
                <div className="relative h-20 w-20 rounded-lg overflow-hidden shrink-0 bg-cream">
                  <Image src={r.item.thumbnail_url || r.item.images?.[0]?.url || "/placeholder-glasses.svg"} alt={r.item.name} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{r.item.name}</p>
                  {r.color && (
                    <p className="text-xs text-ink/50 mt-0.5">Color: <span className="font-medium text-ink/70">{r.color}</span></p>
                  )}
                  <p className="text-sm text-ink/60 mt-0.5">{formatPKR(price)} each</p>
                </div>
                <div className="flex items-center border border-ink/20 rounded-lg">
                  <button className="p-1.5 hover:bg-ink/5 transition-colors rounded-l-lg" onClick={() => updateQty(r.id, -1)}>
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="px-3 text-sm font-medium min-w-[1.5rem] text-center">{r.quantity}</span>
                  <button className="p-1.5 hover:bg-ink/5 transition-colors rounded-r-lg" onClick={() => updateQty(r.id, 1)}>
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="font-semibold min-w-[5rem] text-right">{formatPKR(price * r.quantity)}</p>
                <button onClick={() => removeItem(r.id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="h-4 w-4 text-ink/40 hover:text-red-600" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <div className="border border-ink/10 rounded-xl p-6 bg-white shadow-sm sticky top-28 space-y-4">
          <h2 className="font-semibold text-lg">Order Summary</h2>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-ink/60">
              <span>Subtotal</span>
              <span>{formatPKR(total)}</span>
            </div>
            <div className="flex justify-between text-ink/60">
              <span>Shipping</span>
              <span className="text-green-700 font-medium">Free</span>
            </div>
            <div className="flex justify-between font-semibold text-base border-t border-ink/10 pt-3">
              <span>Total</span>
              <span>{formatPKR(total)}</span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <Input placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input
              placeholder="+92 3XX XXXXXXX"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^\d+]/g, ""))}
            />
            <Textarea placeholder="Delivery Address" value={address} onChange={(e) => setAddress(e.target.value)} rows={3} />
          </div>

          <Button className="w-full" size="lg" onClick={placeOrder} disabled={placing}>
            {placing ? "Placing Order..." : "Place Order via WhatsApp"}
          </Button>
          <div className="flex items-center gap-2 justify-center text-xs text-ink/50">
            <MessageCircle className="h-3.5 w-3.5" />
            <span>You'll be redirected to WhatsApp to confirm payment</span>
          </div>
        </div>
      </div>
    </div>
  );
}
