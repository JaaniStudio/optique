import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAdmin = (user?.app_metadata as Record<string, unknown>)?.is_admin === true;
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!isAdmin && !profile?.is_admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { bucketName } = await req.json();
  if (!bucketName) return NextResponse.json({ error: "bucketName required" }, { status: 400 });

  const adminSupabase = createAdminClient();

  const { data: existing } = await adminSupabase.storage.getBucket(bucketName);
  if (existing) return NextResponse.json({ ok: true });

  const { error } = await adminSupabase.storage.createBucket(bucketName, { public: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
