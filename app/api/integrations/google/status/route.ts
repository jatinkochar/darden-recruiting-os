import { cookies } from "next/headers";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = getSupabaseAdminClient();
  const accessToken = cookies().get("sb-access-token")?.value;

  if (!supabase || !accessToken) {
    return Response.json({ connected: false, last_sync_error: "Not signed in" });
  }

  const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);
  if (userError || !userData.user) return Response.json({ connected: false, last_sync_error: "Not signed in" });

  const { data, error } = await supabase
    .from("integrations")
    .select("provider, refresh_token, updated_at, expires_at, last_sync_at, last_sync_status, last_sync_error, last_sync_gmail_messages, last_sync_gmail_events, last_sync_calendar_events, last_sync_imported")
    .eq("provider", "google")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (error) return Response.json({ connected: false, last_sync_error: error.message });

  return Response.json({
    connected: Boolean(data?.refresh_token),
    provider: data?.provider || "google",
    updated_at: data?.updated_at || null,
    expires_at: data?.expires_at || null,
    last_sync_at: data?.last_sync_at || null,
    last_sync_status: data?.last_sync_status || null,
    last_sync_error: data?.last_sync_error || null,
    last_sync_gmail_messages: data?.last_sync_gmail_messages ?? null,
    last_sync_gmail_events: data?.last_sync_gmail_events ?? null,
    last_sync_calendar_events: data?.last_sync_calendar_events ?? null,
    last_sync_imported: data?.last_sync_imported ?? null
  });
}
