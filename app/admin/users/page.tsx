"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";
import { Ban, CheckCircle } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  async function load() {
    const supabase = createClient();
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    setUsers((data as Profile[]) || []);
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

  return (
    <div>
      <h1 className="text-2xl font-display font-bold mb-8">Manage Users</h1>

      <Input placeholder="Search by name or phone..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm mb-6" />

      <div className="space-y-3">
        {filtered.map((u) => (
          <div key={u.id} className="border border-ink/10 rounded-lg p-4 bg-white">
            {editing === u.id ? (
              <div className="flex flex-wrap items-center gap-3">
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Full name" className="w-48" />
                <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="Phone" className="w-40" />
                <Button size="sm" onClick={() => saveEdit(u.id)}>Save</Button>
                <Button size="sm" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{u.full_name || "Unnamed User"}</p>
                  <p className="text-sm text-ink/50">{u.phone || "No phone"} · Joined {new Date(u.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  {u.is_banned && <Badge variant="warning">Banned</Badge>}
                  <Button size="sm" variant="outline" onClick={() => startEdit(u)}>Edit</Button>
                  <Button size="sm" variant={u.is_banned ? "default" : "destructive"} onClick={() => toggleBan(u)}>
                    {u.is_banned ? (<><CheckCircle className="h-3.5 w-3.5 mr-1" /> Unban</>) : (<><Ban className="h-3.5 w-3.5 mr-1" /> Ban</>)}
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && <p className="text-ink/50 text-center py-16">No users found.</p>}
      </div>
    </div>
  );
}
