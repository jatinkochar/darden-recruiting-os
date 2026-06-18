import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { AppShell } from "@/components/layout/AppShell";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const accessToken = cookies().get("sb-access-token")?.value;

  if (!accessToken) {
    redirect("/login");
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    redirect("/login?error=supabase_missing");
  }

  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data.user) {
    redirect("/login");
  }

  return <AppShell userEmail={data.user.email || ""}>{children}</AppShell>;
}
