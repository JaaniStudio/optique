"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { createClient } from "@/lib/supabase/client";
import type { SiteSettings } from "@/types";

export function BannerEditor() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.from("site_settings").select("*").eq("id", 1).single().then(({ data }) => {
      if (data) setSettings(data as SiteSettings);
    });
  }, []);

  async function save() {
    if (!settings) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("site_settings").update({
      banner_enabled: settings.banner_enabled,
      banner_text: settings.banner_text,
      banner_bg_color: settings.banner_bg_color,
      banner_text_color: settings.banner_text_color,
    }).eq("id", 1);
    setSaving(false);
  }

  if (!settings) return null;

  return (
    <Card>
      <CardHeader><CardTitle>Announcement Banner</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={settings.banner_enabled}
            onCheckedChange={(v) => setSettings({ ...settings, banner_enabled: !!v })}
          />
          <Label>Show banner on site</Label>
        </div>

        <div>
          <Label>Banner Text</Label>
          <Input
            className="mt-1"
            placeholder="e.g. Free delivery on orders above Rs. 3000!"
            value={settings.banner_text || ""}
            onChange={(e) => setSettings({ ...settings, banner_text: e.target.value })}
          />
        </div>

        <div className="flex gap-6">
          <div>
            <Label>Background Color</Label>
            <input
              type="color"
              className="block mt-1 h-10 w-16 rounded border border-ink/15"
              value={settings.banner_bg_color}
              onChange={(e) => setSettings({ ...settings, banner_bg_color: e.target.value })}
            />
          </div>
          <div>
            <Label>Text Color</Label>
            <input
              type="color"
              className="block mt-1 h-10 w-16 rounded border border-ink/15"
              value={settings.banner_text_color}
              onChange={(e) => setSettings({ ...settings, banner_text_color: e.target.value })}
            />
          </div>
        </div>

        <div
          className="rounded-md py-2 text-center text-sm"
          style={{ backgroundColor: settings.banner_bg_color, color: settings.banner_text_color }}
        >
          {settings.banner_text || "Preview text"}
        </div>

        <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save Banner"}</Button>
      </CardContent>
    </Card>
  );
}
