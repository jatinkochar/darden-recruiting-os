import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || url.origin;

  if (!code) {
    return Response.redirect(`${appUrl}/login?error=missing_code`);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    return Response.redirect(`${appUrl}/login?error=supabase_missing`);
  }

  const supabase = createClient(supabaseUrl, anonKey);
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session) {
    return Response.redirect(`${appUrl}/login?error=auth_failed`);
  }

  const response = Response.redirect(`${appUrl}${next}`);
  response.headers.append(
    "Set-Cookie",
    `sb-access-token=${data.session.access_token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`
  );
  response.headers.append(
    "Set-Cookie",
    `sb-refresh-token=${data.session.refresh_token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`
  );

  return response;
}
