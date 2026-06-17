import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { ClipTriggerType } from "@prisma/client";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEffectivePlan } from "@/features/billing/access";
import { getDashboardAnalytics } from "@/features/analytics/queries";
import { getUsageSummary } from "@/features/usage/usage-service";
import { ensureUserReady } from "@/features/users/ensure-user-ready";
import { getUserDashboard } from "@/features/users/queries";
import { getTwitchAccountScopes } from "@/features/twitch/oauth";
import { hasAnyScope, TWITCH_CLIP_DOWNLOAD_SCOPES } from "@/features/twitch/scopes";
import { onboardingDownloadCookieName } from "@/features/onboarding/download-tracking";

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

  const [effectiveAccess, requestHeaders, cookieStore, onboarding] = await Promise.all([
    getEffectivePlan(user.id, user.plan),
    headers(),
    cookies(),
    getOnboardingSummary(user.id)
  ]);
  const usage = await getUsageSummary(user.id, effectiveAccess.plan);
  const baseUrl =
    requestHeaders.get("origin") ??
    `${requestHeaders.get("x-forwarded-proto") ?? "http"}://${requestHeaders.get("host") ?? "localhost:3000"}`;

  return {
    user,
    analytics,
    usage,
    effectivePlan: effectiveAccess.plan,
    promoAccessEndsAt: effectiveAccess.promoAccessEndsAt,
    onboarding: {
      ...onboarding,
      hasDownloadedClip:
        cookieStore.get(onboardingDownloadCookieName)?.value === user.id
    },
    baseUrl,
    hasClipDownloadScope: hasAnyScope(twitchScopes, TWITCH_CLIP_DOWNLOAD_SCOPES)
  };
}

async function getOnboardingSummary(userId: string) {
  const [totalClips, chatCommandClips] = await Promise.all([
    prisma.clip.count({ where: { userId } }),
    prisma.clip.count({
      where: {
        userId,
        triggerType: ClipTriggerType.CHAT_COMMAND
      }
    })
  ]);

  return {
    totalClips,
    chatCommandClips
  };
}
