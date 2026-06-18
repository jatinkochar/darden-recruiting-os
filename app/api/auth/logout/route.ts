// app/api/auth/logout/route.ts

import { NextResponse } from "next/server";

function logout() {
  const response = NextResponse.redirect(
    new URL("/login", process.env.NEXT_PUBLIC_APP_URL || "https://darden-recruiting-os.vercel.app")
  );

  response.cookies.set("sb-access-token", "", { path: "/", maxAge: 0 });
  response.cookies.set("sb-refresh-token", "", { path: "/", maxAge: 0 });

  return response;
}

export async function GET() {
  return logout();
}

export async function POST() {
  return logout();
}
