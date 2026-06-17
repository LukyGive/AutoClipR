import type { NextResponse } from "next/server";

export const onboardingDownloadCookieName = "autoclipr_download_completed";

export function withOnboardingDownloadCookie(
  response: NextResponse,
  userId: string
) {
  response.cookies.set(onboardingDownloadCookieName, userId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax"
  });

  return response;
}
