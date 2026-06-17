import { NextRequest } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { refreshGoogleAccessToken } from "@/lib/google/oauth";
import { fetchRecruitingGmailMessages } from "@/lib/google/gmail";
import { fetchGoogleCalendarEvents } from "@/lib/google/calendar";
import { parseRecruitingEmail } from "@/lib/gmail/parser";
import { toSnakeEvent } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const syncSecret = req.headers.get("x-sync-secret");

  if (process.env.GMAIL_SYNC_SECRET && syncSecret !== process.env.GMAIL_SYNC_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) return Response.json({ error: "Supabase env vars missing" }, { status: 500 });

  const { data: integration, error } = await supabase
    .from("integrations")
    .select("*")
    .eq("provider", "google")
    .maybeSingle();

  if (error || !integration?.refresh_token) {
    return Response.json({ error: "Google not connected" }, { status: 400 });
  }

  const refreshed = await refreshGoogleAccessToken(integration.refresh_token);

  await supabase.from("integrations").upsert({
    provider: "google",
    access_token: refreshed.access_token,
    refresh_token: integration.refresh_token,
    scope: refreshed.scope || integration.scope,
    expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
    updated_at: new Date().toISOString()
  });

  const gmailMessages = await fetchRecruitingGmailMessages(refreshed.access_token);
  const gmailEvents = gmailMessages.map(parseRecruitingEmail).filter(Boolean);
  const calendarEvents = await fetchGoogleCalendarEvents(refreshed.access_token);

  const allEvents = [...gmailEvents, ...calendarEvents];

  for (const event of allEvents) {
    if (!event) continue;
    await supabase.from("events").upsert(toSnakeEvent(event));
  }

  return Response.json({
    ok: true,
    gmailMessages: gmailMessages.length,
    gmailEvents: gmailEvents.length,
    calendarEvents: calendarEvents.length,
    imported: allEvents.length
  });
}
