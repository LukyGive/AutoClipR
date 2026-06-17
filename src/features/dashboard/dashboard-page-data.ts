import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { ClipTriggerType, Plan, SubscriptionStatus } from "@prisma/client";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDashboardAnalytics } from "@/features/analytics/queries";
import { getUsageSummary } from "@/features/usage/usage-service";
import { ensureUserReady } from "@/features/users/ensure-user-ready";
import { getUserDashboard } from "@/features/users/queries";
import { getTwitchAccountScopes } from "@/features/twitch/oauth";
import { hasAnyScope, TWITCH_CLIP_DOWNLOAD_SCOPES } from "@/features/twitch/scopes";
import { onboardingDownloadCookieName } from "@/features/onboarding/download-tracking";

export async function getDashboardPageData() {
  const userId = await getReadyUserId();

  const [user, analytics, twitchScopes] = await Promise.all([
    getUserDashboard(userId),
    getDashboardAnalytics(userId),
    getTwitchAccountScopes(userId)
  ]);

  if (!user) {
    redirect("/login");
  }

  const effectiveAccess = getEffectiveAccessFromLoadedUser(user);
  const [requestHeaders, cookieStore, onboarding] = await Promise.all([
    headers(),
    cookies(),
    getOnboardingSummary(user.id, user._count.clips)
  ]);
  const usage = await getUsageSummary(user.id, effectiveAccess.plan);
  const baseUrl = getBaseUrl(requestHeaders);

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

export async function getClipsPageData() {
  const userId = await getReadyUserId();
  const [user, twitchScopes] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        twitchUserId: true,
        clips: {
          orderBy: { createdAt: "desc" },
          take: 5
        }
      }
    }),
    getTwitchAccountScopes(userId)
  ]);

  if (!user) {
    redirect("/login");
  }

  return {
    user,
    hasClipDownloadScope: hasAnyScope(twitchScopes, TWITCH_CLIP_DOWNLOAD_SCOPES)
  };
}

export async function getRulesPageData() {
  const userId = await getReadyUserId();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      clipRules: {
        orderBy: { createdAt: "asc" },
        take: 3
      }
    }
  });

  if (!user) {
    redirect("/login");
  }

  return { user };
}

export async function getSettingsPageData() {
  const userId = await getReadyUserId();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      plan: true,
      role: true,
      createdAt: true,
      twitchUserId: true,
      twitchLogin: true,
      twitchName: true,
      subscription: {
        select: {
          status: true
        }
      },
      promoRedemptions: {
        where: {
          accessEndsAt: {
            gt: new Date()
          }
        },
        orderBy: {
          accessEndsAt: "desc"
        },
        take: 1,
        select: {
          accessEndsAt: true
        }
      }
    }
  });

  if (!user) {
    redirect("/login");
  }

  return {
    user,
    effectivePlan: getEffectiveAccessFromLoadedUser(user).plan
  };
}

export async function getStreamersPageData() {
  const userId = await getReadyUserId();
  const [user, requestHeaders] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        plan: true,
        clipTargets: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            twitchLogin: true,
            twitchName: true,
            externalTriggerToken: true,
            createdAt: true
          }
        },
        subscription: {
          select: {
            status: true
          }
        },
        promoRedemptions: {
          where: {
            accessEndsAt: {
              gt: new Date()
            }
          },
          orderBy: {
            accessEndsAt: "desc"
          },
          take: 1,
          select: {
            accessEndsAt: true
          }
        }
      }
    }),
    headers()
  ]);

  if (!user) {
    redirect("/login");
  }

  return {
    user,
    effectivePlan: getEffectiveAccessFromLoadedUser(user).plan,
    baseUrl: getBaseUrl(requestHeaders)
  };
}

export async function getSupportPageData() {
  const userId = await getReadyUserId();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true
    }
  });

  if (!user) {
    redirect("/login");
  }

  return { user };
}

async function getReadyUserId() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  await ensureUserReady(session.user.id);

  return session.user.id;
}

function getBaseUrl(requestHeaders: Headers) {
  return (
    requestHeaders.get("origin") ??
    `${requestHeaders.get("x-forwarded-proto") ?? "http"}://${requestHeaders.get("host") ?? "localhost:3000"}`
  );
}

function getEffectiveAccessFromLoadedUser(user: {
  plan: Plan;
  subscription?: { status: SubscriptionStatus | null } | null;
  promoRedemptions?: { accessEndsAt: Date }[];
}) {
  const promoAccessEndsAt = user.promoRedemptions?.[0]?.accessEndsAt ?? null;

  if (user.plan === Plan.BUSINESS) {
    return {
      plan: Plan.BUSINESS,
      promoAccessEndsAt
    };
  }

  if (
    user.subscription?.status === SubscriptionStatus.ACTIVE ||
    user.subscription?.status === SubscriptionStatus.TRIALING
  ) {
    return {
      plan: user.plan === Plan.FREE ? Plan.PRO : user.plan,
      promoAccessEndsAt
    };
  }

  return {
    plan: promoAccessEndsAt ? Plan.PRO : user.plan,
    promoAccessEndsAt
  };
}

async function getOnboardingSummary(userId: string, totalClips: number) {
  const chatCommandClips = await prisma.clip.count({
    where: {
      userId,
      triggerType: ClipTriggerType.CHAT_COMMAND
    }
  });

  return {
    totalClips,
    chatCommandClips
  };
}
