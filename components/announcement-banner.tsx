"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { SiteSettings } from "@/types";

export function AnnouncementBanner() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase.from("site_settings").select("*").eq("id", 1).single().then(({ data }) => {
      if (data) setSettings(data as SiteSettings);
    });

    // Live updates: when admin edits the banner, it changes instantly for everyone
    const channel = supabase
      .channel("site_settings_changes")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "site_settings" },
        (payload) => setSettings(payload.new as SiteSettings)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (!settings?.banner_enabled || !settings.banner_text) return null;

  return (
    <div
      className="w-full text-center text-sm py-2 px-4 font-medium"
      style={{ backgroundColor: settings.banner_bg_color, color: settings.banner_text_color }}
    >
      {settings.banner_text}
    </div>
  );
}
