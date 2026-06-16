import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getDashboardAnalytics } from "@/features/analytics/queries";
import { getUsageSummary } from "@/features/usage/usage-service";
import { ensureUserReady } from "@/features/users/ensure-user-ready";
import { getUserDashboard } from "@/features/users/queries";
import { getTwitchAccountScopes } from "@/features/twitch/oauth";
import { hasAnyScope, TWITCH_CLIP_DOWNLOAD_SCOPES } from "@/features/twitch/scopes";

export async function getDashboardPageData() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  await ensureUserReady(session.user.id);

  const [user, analytics, twitchScopes] = await Promise.all([
    getUserDashboard(session.user.id),
    getDashboardAnalytics(session.user.id),
    getTwitchAccountScopes(session.user.id)
  ]);

  if (!user) {
    redirect("/login");
  }

  const [usage, requestHeaders] = await Promise.all([
    getUsageSummary(user.id, user.plan),
    headers()
  ]);
  const baseUrl =
    requestHeaders.get("origin") ??
    `${requestHeaders.get("x-forwarded-proto") ?? "http"}://${requestHeaders.get("host") ?? "localhost:3000"}`;

  return {
    user,
    analytics,
    usage,
    baseUrl,
    hasClipDownloadScope: hasAnyScope(twitchScopes, TWITCH_CLIP_DOWNLOAD_SCOPES)
  };
}
