"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Bell, CheckCheck, Inbox } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { AppNotification } from "@/types";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-PK", { month: "short", day: "numeric" });
}

export function NotificationsDropdown() {
  const [notifs, setNotifs] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const channelRef = useRef<any>(null);

  function clearTimer() { if (timer.current) clearTimeout(timer.current); }
  function openMenu() { clearTimer(); setOpen(true); }
  function scheduleClose() { clearTimer(); timer.current = setTimeout(() => setOpen(false), 160); }

  useEffect(() => {
    let mounted = true;
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      if (!mounted) return;
      setLoggedIn(true);

      supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20)
        .then(({ data }) => {
          if (!mounted || !data) return;
          setNotifs(data as AppNotification[]);
          setUnread((data as AppNotification[]).filter((n) => !n.is_read).length);
        });

      const channel = supabase
        .channel("notifications-changes")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
          (payload) => {
            const n = payload.new as AppNotification;
            setNotifs((prev) => [n, ...prev].slice(0, 20));
            setUnread((u) => u + 1);
          }
        )
        .subscribe();
      channelRef.current = channel;
    });

    return () => {
      mounted = false;
      if (channelRef.current) channelRef.current.remove();
    };
  }, []);

  async function markAllRead() {
    if (unread === 0) return;
    const supabase = createClient();
    await supabase.from("notifications").update({ is_read: true }).eq("is_read", false);
    setNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnread(0);
  }

  async function openNotification(n: AppNotification) {
    if (!n.is_read) {
      const supabase = createClient();
      await supabase.from("notifications").update({ is_read: true }).eq("id", n.id);
      setNotifs((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)));
      setUnread((u) => Math.max(0, u - 1));
    }
    setOpen(false);
    if (n.link) router.push(n.link);
  }

  return (
    <div className="relative" onMouseEnter={openMenu} onMouseLeave={scheduleClose}>
      <motion.button
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        className="relative flex h-5 w-5 items-center justify-center"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </motion.button>

      {open && (
        <div
          className="absolute right-0 top-full pt-3 z-50"
          onClick={() => setOpen(false)}
        >
          <div className="w-[340px] max-w-[85vw] overflow-hidden rounded-xl border border-ink/10 bg-white text-ink shadow-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-ink/10">
              <p className="font-semibold text-sm">Notifications</p>
              {unread > 0 && (
                <button
                  onClick={(e) => { e.stopPropagation(); markAllRead(); }}
                  className="inline-flex items-center gap-1 text-xs font-medium text-ink/50 hover:text-ink transition-colors"
                >
                  <CheckCheck className="h-3.5 w-3.5" /> Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {!loggedIn ? (
                <div className="px-4 py-6 text-center">
                  <Inbox className="h-6 w-6 mx-auto mb-2 text-ink/30" />
                  <p className="text-sm text-ink/50">Log in to view notifications</p>
                </div>
              ) : notifs.length === 0 ? (
                <div className="px-4 py-6 text-center">
                  <Inbox className="h-6 w-6 mx-auto mb-2 text-ink/30" />
                  <p className="text-sm text-ink/50">No notifications yet</p>
                </div>
              ) : (
                notifs.map((n) => (
                  <button
                    key={n.id}
                    onClick={(e) => { e.stopPropagation(); openNotification(n); }}
                    className={`block w-full text-left px-4 py-3 border-b border-ink/5 last:border-b-0 transition-colors ${n.is_read ? "bg-white hover:bg-ink/5" : "bg-ink/5 hover:bg-ink/10"}`}
                  >
                    <div className="flex items-start gap-2">
                      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.is_read ? "bg-ink/15" : "bg-red-500"}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium leading-snug">{n.title}</p>
                        {n.message && (
                          <p className="text-xs text-ink/60 leading-snug mt-0.5">{n.message}</p>
                        )}
                        <p className="text-[11px] text-ink/40 mt-1">{timeAgo(n.created_at)}</p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>

            <Link
              href="/account"
              className="block border-t border-ink/10 px-4 py-2.5 text-center text-xs font-medium text-ink/50 hover:text-ink hover:bg-ink/5 transition-colors"
            >
              View all
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}