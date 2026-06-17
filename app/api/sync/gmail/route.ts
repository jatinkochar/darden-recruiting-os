import { NextRequest } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { parseRecruitingEmail } from "@/lib/gmail/parser";
import { toSnakeEvent } from "@/lib/utils";

async function fetchGmailMessages() {
  // Placeholder until Google OAuth refresh token is configured.
  // Next step: exchange GOOGLE_REFRESH_TOKEN for access token, call Gmail messages.list/messages.get,
  // then pass subject/body into parseRecruitingEmail().
  return [] as Array<{ subject: string; body: string; from?: string }>;
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-sync-secret");
  if (process.env.GMAIL_SYNC_SECRET && secret !== process.env.GMAIL_SYNC_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) return Response.json({ error: "Supabase env vars missing" }, { status: 500 });

  const messages = await fetchGmailMessages();
  const parsed = messages.map(parseRecruitingEmail).filter(Boolean);

  for (const event of parsed) {
    await supabase.from("events").upsert(toSnakeEvent(event!));
  }

  return Response.json({ ok: true, imported: parsed.length });
}
