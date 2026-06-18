export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  const accessToken = body?.access_token;
  const refreshToken = body?.refresh_token;

  if (!accessToken || !refreshToken) {
    return Response.json({ error: "Missing tokens" }, { status: 400 });
  }

  const response = Response.json({ ok: true });

  response.headers.append(
    "Set-Cookie",
    `sb-access-token=${accessToken}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`
  );

  response.headers.append(
    "Set-Cookie",
    `sb-refresh-token=${refreshToken}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`
  );

  return response;
}
