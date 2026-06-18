import { cookies } from "next/headers";
import { getGoogleAuthUrl } from "@/lib/google/oauth";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const accessToken = cookies().get("sb-access-token")?.value;
    if (!accessToken) return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login`);

    const supabase = getSupabaseAdminClient();
    if (!supabase) throw new Error("Supabase missing");

    const { data, error } = await supabase.auth.getUser(accessToken);
    if (error || !data.user) return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login`);

    return Response.redirect(getGoogleAuthUrl(data.user.id));
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Google auth start failed" }, { status: 500 });
  }
}
