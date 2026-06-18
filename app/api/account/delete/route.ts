import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

async function getUserId() {
  const accessToken = cookies().get("sb-access-token")?.value;
  const supabase = getSupabaseAdminClient();

  if (!supabase || !accessToken) return { supabase, userId: null };

  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data.user) return { supabase, userId: null };

  return { supabase, userId: data.user.id };
}

export async function POST() {
  const { supabase, userId } = await getUserId();

  if (!supabase || !userId) {
    return Response.json({ error: "Not signed in" }, { status: 401 });
  }

  const tables = ["events", "contacts", "applications", "tasks", "integrations"];

  for (const table of tables) {
    const { error } = await supabase.from(table).delete().eq("user_id", userId);
    if (error) {
      return Response.json({ error: `Failed deleting ${table}: ${error.message}` }, { status: 500 });
    }
  }

  const { error: authError } = await supabase.auth.admin.deleteUser(userId);
  if (authError) {
    return Response.json({ error: `Data deleted, but auth user deletion failed: ${authError.message}` }, { status: 500 });
  }

  const response = NextResponse.json({ ok: true });

  response.cookies.set("sb-access-token", "", {
    path: "/",
    maxAge: 0
  });

  response.cookies.set("sb-refresh-token", "", {
    path: "/",
    maxAge: 0
  });

  return response;
}
