import { getGoogleAuthUrl } from "@/lib/google/oauth";

export async function GET() {
  try {
    return Response.redirect(getGoogleAuthUrl());
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Google auth start failed" },
      { status: 500 }
    );
  }
}
