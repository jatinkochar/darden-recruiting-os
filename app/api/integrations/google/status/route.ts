import { getSupabaseAdminClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return Response.json({
      connected: false,
      last_sync_error: "Supabase env vars missing"
    });
  }

  const { data, error } = await supabase
    .from("integrations")
    .select("provider, refresh_token, updated_at, expires_at, last_sync_at, last_sync_status, last_sync_error, last_sync_gmail_messages, last_sync_gmail_events, last_sync_calendar_events, last_sync_imported")
    .eq("provider", "google")
    .maybeSingle();

  if (error) {
    return Response.json({
      connected: false,
      last_sync_error: error.message
    });
  }

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
