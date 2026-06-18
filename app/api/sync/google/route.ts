import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { refreshGoogleAccessToken } from "@/lib/google/oauth";
import { fetchRecruitingGmailMessages } from "@/lib/google/gmail";
import { fetchGoogleCalendarEvents } from "@/lib/google/calendar";
import { parseRecruitingEmail } from "@/lib/gmail/parser";
import { toSnakeEvent } from "@/lib/utils";

export async function GET(req: NextRequest) { return syncGoogle(req); }
export async function POST(req: NextRequest) { return syncGoogle(req); }

async function syncGoogle(req: NextRequest) {
  const supabase = getSupabaseAdminClient();
  const accessToken = cookies().get("sb-access-token")?.value;

  if (!supabase || !accessToken) return Response.json({ error: "Not signed in" }, { status: 401 });

  const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);
  if (userError || !userData.user) return Response.json({ error: "Not signed in" }, { status: 401 });

  const userId = userData.user.id;

  try {
    const { data: integration, error } = await supabase
      .from("integrations")
      .select("*")
      .eq("provider", "google")
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !integration?.refresh_token) {
      await updateSyncStatus(userId, { status: "failed", error: "Google not connected" });
      return Response.json({ error: "Google not connected" }, { status: 400 });
    }

    const refreshed = await refreshGoogleAccessToken(integration.refresh_token);

    await supabase.from("integrations").upsert({
      user_id: userId,
      provider: "google",
      access_token: refreshed.access_token,
      refresh_token: integration.refresh_token,
      scope: refreshed.scope || integration.scope,
      expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
      updated_at: new Date().toISOString()
    }, { onConflict: "user_id,provider" });

    const gmailMessages = await fetchRecruitingGmailMessages(refreshed.access_token);
    const gmailEvents = gmailMessages.map(parseRecruitingEmail).filter(Boolean);
    const calendarEvents = await fetchGoogleCalendarEvents(refreshed.access_token);

    const map = new Map<string, any>();
    for (const event of [...gmailEvents, ...calendarEvents]) {
      if (!event) continue;
      const existing = map.get(event.id);
      const withUser = { ...event, userId };
      if (!existing) map.set(event.id, withUser);
      else map.set(event.id, {
        ...existing,
        meetingLink: existing.meetingLink || event.meetingLink,
        registrationLink: existing.registrationLink || event.registrationLink,
        passcode: existing.passcode || event.passcode,
        status: existing.status === "Registered" ? existing.status : event.status,
        notes: [existing.notes, event.notes].filter(Boolean).join("\n\n---\n\n").slice(0, 1200)
      });
    }

    const allEvents = Array.from(map.values());

    for (const event of allEvents) {
      await supabase.from("events").upsert({
        ...toSnakeEvent(event),
        user_id: userId
      });
    }

    await updateSyncStatus(userId, {
      status: "success",
      gmailMessages: gmailMessages.length,
      gmailEvents: gmailEvents.length,
      calendarEvents: calendarEvents.length,
      imported: allEvents.length
    });

    return Response.json({ ok: true, gmailMessages: gmailMessages.length, gmailEvents: gmailEvents.length, calendarEvents: calendarEvents.length, imported: allEvents.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown sync error";
    await updateSyncStatus(userId, { status: "failed", error: message });
    return Response.json({ error: message }, { status: 500 });
  }
}

async function updateSyncStatus(userId: string, args: {
  status: "success" | "failed";
  error?: string;
  gmailMessages?: number;
  gmailEvents?: number;
  calendarEvents?: number;
  imported?: number;
}) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return;

  await supabase.from("integrations").upsert({
    user_id: userId,
    provider: "google",
    last_sync_at: new Date().toISOString(),
    last_sync_status: args.status,
    last_sync_error: args.error || null,
    last_sync_gmail_messages: args.gmailMessages ?? null,
    last_sync_gmail_events: args.gmailEvents ?? null,
    last_sync_calendar_events: args.calendarEvents ?? null,
    last_sync_imported: args.imported ?? null,
    updated_at: new Date().toISOString()
  }, { onConflict: "user_id,provider" });
}
