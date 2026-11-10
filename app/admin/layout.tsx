import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const isAdminFromAuth = (user?.app_metadata as Record<string, unknown>)?.is_admin === true;

  let isAdminFromProfile = false;
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();

  if (profile?.is_admin) {
    isAdminFromProfile = true;
  }

  if (!isAdminFromProfile && !isAdminFromAuth) redirect("/");

  if (isAdminFromAuth && !isAdminFromProfile) {
    await supabase.from("profiles").update({ is_admin: true }).eq("id", user.id);
  }

  return (
    <div className="admin-shell flex min-h-screen bg-cream">
      <AdminSidebar />
      <main className="relative min-w-0 flex-1">
        <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-sand/20 blur-3xl" />
        <div className="admin-content relative mx-auto max-w-6xl px-4 pb-12 pt-20 md:px-10 md:pt-10">{children}</div>
      </main>
    </div>
  );
}
