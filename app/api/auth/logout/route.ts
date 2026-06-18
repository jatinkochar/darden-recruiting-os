export async function POST() {
  const response = Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL || ""}/login`);
  response.headers.append("Set-Cookie", "sb-access-token=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0");
  response.headers.append("Set-Cookie", "sb-refresh-token=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0");
  return response;
}
