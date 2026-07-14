import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();

  if (!profile?.is_admin) redirect("/");

  return (
    <div className="flex bg-cream min-h-screen">
      <AdminSidebar />
      <div className="flex-1 p-6 md:p-10 max-w-6xl">{children}</div>
    </div>
  );
}
