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
    <div className="flex bg-cream">
      <AdminSidebar />
      <div className="flex-1 p-6 md:p-10 max-w-6xl min-h-screen">{children}</div>
    </div>
  );
}
