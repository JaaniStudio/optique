"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatPKR } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useUIStore } from "@/lib/store";
import type { Order } from "@/types";
import {
  Package, Heart, CreditCard, User, Mail, Phone, Lock,
  ChevronRight, ArrowRight,
} from "lucide-react";

const statusStyles: Record<string, "default" | "success" | "warning"> = {
  pending: "default",
  in_transit: "warning",
  completed: "success",
  cancelled: "default",
};

export default function AccountPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [pwMsg, setPwMsg] = useState("");

  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [currPw, setCurrPw] = useState("");
  const [newPw, setNewPw] = useState("");

  const router = useRouter();

  const favoritesCount = useUIStore((s) => s.favoritesCount);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("full_name, phone")
          .eq("id", user.id)
          .single();
        setProfile(prof);
        setEditName(prof?.full_name || "");
        setEditPhone(prof?.phone || "");

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

  async function saveProfile() {
    setSaving(true);
    setSaveMsg("");
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, full_name: editName, phone: editPhone });
    setSaving(false);
    if (error) { setSaveMsg("Error saving: " + error.message); return; }
    setSaveMsg("Profile updated!");
    setTimeout(() => setSaveMsg(""), 3000);
  }

  async function changePassword() {
    if (!currPw || !newPw) { setPwMsg("Fill in both fields."); return; }
    if (newPw.length < 6) { setPwMsg("New password must be at least 6 characters."); return; }
    setPwMsg("");
    const supabase = createClient();
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currPw,
    });
    if (signInErr) { setPwMsg("Current password is incorrect."); return; }
    const { error } = await supabase.auth.updateUser({ password: newPw });
    if (error) { setPwMsg(error.message); return; }
    setPwMsg("Password changed!");
    setCurrPw("");
    setNewPw("");
    setTimeout(() => setPwMsg(""), 3000);
  }

  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-20 text-center text-ink/50">Loading...</div>;

  if (!user) {
    return (
      <div className="max-w-sm mx-auto px-4 py-24 text-center">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-ink/5 mb-6">
          <User className="h-8 w-8 text-ink/30" />
        </div>
        <p className="text-lg font-medium mb-2">Not signed in</p>
        <p className="text-ink/50 mb-8">Sign in to view your orders and account details.</p>
        <Link href="/login"><Button size="lg">Sign In</Button></Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 md:px-8 py-12">
      {/* Profile header */}
      <div className="flex items-center gap-5 mb-10">
        <div className="h-16 w-16 rounded-full bg-ink/10 flex items-center justify-center shrink-0">
          <User className="h-6 w-6 text-ink/40" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">
            {profile?.full_name || "My Account"}
          </h1>
          <p className="text-ink/50 text-sm">{user.email}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { icon: Package, label: "Total Orders", value: orders.length },
          { icon: CreditCard, label: "Total Spent", value: formatPKR(totalSpent) },
          { icon: Heart, label: "Favorites", value: favoritesCount },
          { icon: Mail, label: "Member Since", value: user.created_at ? new Date(user.created_at).toLocaleDateString("en-PK", { month: "short", year: "numeric" }) : "-" },
        ].map((s) => (
          <div key={s.label} className="border border-ink/10 rounded-xl p-4 bg-white shadow-sm">
            <div className="flex items-center gap-2 text-ink/40 mb-2">
              <s.icon className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">{s.label}</span>
            </div>
            <p className="text-xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-10">
        {/* Edit Profile */}
        <div className="border border-ink/10 rounded-xl p-6 bg-white shadow-sm">
          <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <User className="h-4 w-4" /> Profile
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-ink/50 uppercase tracking-wider">Full Name</label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-ink/50 uppercase tracking-wider">Phone</label>
              <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="03XX-XXXXXXX" className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-ink/50 uppercase tracking-wider">Email</label>
              <Input value={user.email} disabled className="mt-1 opacity-60" />
            </div>
            <Button onClick={saveProfile} disabled={saving} className="w-full">
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            {saveMsg && (
              <p className={`text-sm text-center ${saveMsg === "Profile updated!" ? "text-green-600" : "text-red-600"}`}>
                {saveMsg}
              </p>
            )}
          </div>
        </div>

        {/* Change Password */}
        <div className="border border-ink/10 rounded-xl p-6 bg-white shadow-sm">
          <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Lock className="h-4 w-4" /> Change Password
          </h2>
          <div className="space-y-3">
            <Input
              type="password"
              placeholder="Current password"
              value={currPw}
              onChange={(e) => setCurrPw(e.target.value)}
            />
            <Input
              type="password"
              placeholder="New password (min 6 chars)"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
            />
            <Button onClick={changePassword} variant="outline" className="w-full">
              Update Password
            </Button>
            {pwMsg && (
              <p className={`text-sm text-center ${pwMsg === "Password changed!" ? "text-green-600" : "text-red-600"}`}>
                {pwMsg}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Order History */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <Package className="h-4 w-4" /> Order History
          </h2>
          {orders.length > 0 && (
            <span className="text-xs text-ink/40">{orders.length} total</span>
          )}
        </div>
        <div className="space-y-4">
          {orders.length === 0 && (
            <div className="border border-ink/10 rounded-xl p-8 text-center bg-white shadow-sm">
              <Package className="h-8 w-8 mx-auto mb-3 text-ink/20" />
              <p className="text-ink/50 mb-4">No orders yet. Start shopping to see your order history here.</p>
              <Link href="/products"><Button variant="outline">Start Shopping <ArrowRight className="h-4 w-4 ml-2" /></Button></Link>
            </div>
          )}
          {orders.map((o) => (
            <div key={o.id} className="border border-ink/10 rounded-xl p-5 bg-white shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">Order #{o.id.slice(0, 8)}</p>
                  <p className="text-xs text-ink/50 mt-0.5">
                    {new Date(o.created_at).toLocaleDateString("en-PK", { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                </div>
                <Badge variant={statusStyles[o.status] || "default"}>
                  {o.status === "in_transit" ? "In Transit" : o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                </Badge>
              </div>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-ink/60">
                {o.order_items?.map((oi) => (
                  <span key={oi.id}>{oi.quantity}x {oi.item_name}</span>
                ))}
              </div>
              <div className="mt-4 flex justify-between items-center border-t border-ink/5 pt-4">
                <span className="text-xs text-ink/40">{o.order_items?.length || 0} {o.order_items?.length === 1 ? "item" : "items"}</span>
                <span className="font-semibold">{formatPKR(o.total)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
