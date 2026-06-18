import { cookies } from "next/headers";
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

  const { error } = await supabase
    .from("integrations")
    .delete()
    .eq("user_id", userId)
    .eq("provider", "google");

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
