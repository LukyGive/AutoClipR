import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ClipTriggerType } from "@prisma/client";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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

  const [usage, requestHeaders, onboarding] = await Promise.all([
    getUsageSummary(user.id, user.plan),
    headers(),
    getOnboardingSummary(user.id)
  ]);
  const baseUrl =
    requestHeaders.get("origin") ??
    `${requestHeaders.get("x-forwarded-proto") ?? "http"}://${requestHeaders.get("host") ?? "localhost:3000"}`;

  return {
    user,
    analytics,
    usage,
    onboarding,
    baseUrl,
    hasClipDownloadScope: hasAnyScope(twitchScopes, TWITCH_CLIP_DOWNLOAD_SCOPES)
  };
}

async function getOnboardingSummary(userId: string) {
  const [totalClips, chatCommandClips, apiTriggerClips] = await Promise.all([
    prisma.clip.count({ where: { userId } }),
    prisma.clip.count({
      where: {
        userId,
        triggerType: ClipTriggerType.CHAT_COMMAND
      }
    }),
    prisma.clip.count({
      where: {
        userId,
        triggerType: ClipTriggerType.MANUAL,
        triggerValue: {
          startsWith: "external:"
        }
      }
    })
  ]);

  return {
    totalClips,
    chatCommandClips,
    apiTriggerClips
  };
}
