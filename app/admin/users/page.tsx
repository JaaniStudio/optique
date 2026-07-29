"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";
import { Ban, CheckCircle, Search, Users as UsersIcon, Pencil } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  async function load() {
    try {
      const supabase = createClient();
      const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      setUsers((data as Profile[]) || []);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load users:", err);
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const supabase = createClient();
    const channel = supabase
      .channel("admin_users")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, load)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function toggleBan(user: Profile) {
    const supabase = createClient();
    await supabase.from("profiles").update({ is_banned: !user.is_banned }).eq("id", user.id);
  }

  function startEdit(user: Profile) {
    setEditing(user.id);
    setEditName(user.full_name || "");
    setEditPhone(user.phone || "");
  }

  async function saveEdit(id: string) {
    const supabase = createClient();
    await supabase.from("profiles").update({ full_name: editName, phone: editPhone }).eq("id", id);
    setEditing(null);
  }

  const filtered = users.filter((u) =>
    !search ||
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search)
  );

  if (loading) return <div className="text-center py-20 text-ink/50">Loading...</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold">Manage Users</h1>
        <p className="text-sm text-ink/50 mt-1">View and manage registered users</p>
      </div>

      <div className="relative max-w-sm mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/30" />
        <Input placeholder="Search by name or phone..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="space-y-3">
        {filtered.map((u) => (
          <div key={u.id} className="border border-ink/10 rounded-xl bg-white p-5 transition-all hover:shadow-sm">
            {editing === u.id ? (
              <div className="flex flex-wrap items-center gap-3">
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Full name" className="w-48" />
                <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="Phone" className="w-40" />
                <Button size="sm" onClick={() => saveEdit(u.id)}>Save</Button>
                <Button size="sm" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{u.full_name || "Unnamed User"}</p>
                    {u.is_admin && <Badge variant="success">Admin</Badge>}
                    {u.is_banned && <Badge variant="warning">Banned</Badge>}
                  </div>
                  <p className="text-sm text-ink/50">{u.phone || "No phone"} &middot; Joined {new Date(u.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button size="sm" variant="outline" onClick={() => startEdit(u)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant={u.is_banned ? "default" : "destructive"} onClick={() => toggleBan(u)}>
                    {u.is_banned ? <><CheckCircle className="h-3.5 w-3.5 mr-1" /> Unban</> : <><Ban className="h-3.5 w-3.5 mr-1" /> Ban</>}
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-20">
            <UsersIcon className="h-10 w-10 mx-auto text-ink/20 mb-3" />
            <p className="text-ink/50">No users found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
