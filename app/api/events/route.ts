import { cookies } from "next/headers";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { fromSnakeEvent, toSnakeEvent } from "@/lib/utils";

async function getUserId() {
  const accessToken = cookies().get("sb-access-token")?.value;
  const supabase = getSupabaseAdminClient();

  if (!supabase || !accessToken) return { supabase, userId: null };

  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data.user) return { supabase, userId: null };

  return { supabase, userId: data.user.id };
}

export async function GET() {
  const { supabase, userId } = await getUserId();

  if (!supabase || !userId) {
    return Response.json({ error: "Not signed in", events: [] }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: true, nullsFirst: false });

  if (error) {
    return Response.json({ error: error.message, events: [] }, { status: 500 });
  }

  return Response.json({
    events: (data || []).map(fromSnakeEvent)
  });
}

export async function POST(req: Request) {
  const { supabase, userId } = await getUserId();

  if (!supabase || !userId) {
    return Response.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = await req.json();
  const event = body.event;

  if (!event?.id) {
    return Response.json({ error: "Missing event" }, { status: 400 });
  }

  const { error } = await supabase.from("events").upsert({
    ...toSnakeEvent(event),
    user_id: userId
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}

export async function DELETE(req: Request) {
  const { supabase, userId } = await getUserId();

  if (!supabase || !userId) {
    return Response.json({ error: "Not signed in" }, { status: 401 });
  }

  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return Response.json({ error: "Missing id" }, { status: 400 });
  }

  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
