import { NextRequest } from "next/server";
import { exchangeCodeForTokens } from "@/lib/google/oauth";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const userId = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://darden-recruiting-os.vercel.app";

  if (error) return Response.redirect(`${appUrl}/settings?google=error`);
  if (!code || !userId) return Response.redirect(`${appUrl}/settings?google=missing_code_or_user`);

  try {
    const tokens = await exchangeCodeForTokens(code);
    const supabase = getSupabaseAdminClient();
    if (!supabase) return Response.redirect(`${appUrl}/settings?google=supabase_missing`);

    const existing = await supabase
      .from("integrations")
      .select("*")
      .eq("provider", "google")
      .eq("user_id", userId)
      .maybeSingle();

    const refreshToken = tokens.refresh_token || existing.data?.refresh_token || "";

    await supabase.from("integrations").upsert({
      user_id: userId,
      provider: "google",
      access_token: tokens.access_token,
      refresh_token: refreshToken,
      scope: tokens.scope,
      expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      updated_at: new Date().toISOString()
    }, { onConflict: "user_id,provider" });

    return Response.redirect(`${appUrl}/settings?google=connected`);
  } catch (err) {
    console.error(err);
    return Response.redirect(`${appUrl}/settings?google=failed`);
  }
}
