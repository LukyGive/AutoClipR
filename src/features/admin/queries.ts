import {
  ClipTriggerType,
  Plan,
  Prisma,
  SubscriptionStatus
} from "@prisma/client";

import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { getPlanByStripePriceId } from "@/features/billing/plans";

export type AdminUserFilter = "all" | "free" | "trial" | "pro" | "business" | "promo";

const monthlyPrices = {
  [Plan.FREE]: 0,
  [Plan.PRO]: 9.99,
  [Plan.BUSINESS]: 24.99
} satisfies Record<Plan, number>;

type DailyCountRow = {
  day: Date;
  count: number | bigint;
};

export async function getAdminDashboardData({
  search,
  filter
}: {
  search?: string;
  filter: AdminUserFilter;
}) {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86_400_000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86_400_000);

  const [
    totalUsers,
    totalTwitchAccountsConnected,
    totalStreamersAdded,
    totalClipsCreated,
    totalPromoActivations,
    activeTrials,
    activeSubscriptions,
    activePromoUsers,
    stripeCustomers,
    recentUsers,
    promoCodes,
    usersGrowth,
    clipsGrowth,
    lastClip,
    lastChatCommandClip,
    lastUserSignup
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { twitchUserId: { not: null } } }),
    prisma.clipTarget.count(),
    prisma.clip.count(),
    prisma.promoRedemption.count(),
    prisma.subscription.count({
      where: { status: SubscriptionStatus.TRIALING }
    }),
    prisma.subscription.findMany({
      where: { status: SubscriptionStatus.ACTIVE },
      select: {
        stripeCustomerId: true,
        stripePriceId: true,
        user: {
          select: {
            plan: true
          }
        }
      }
    }),
    prisma.promoRedemption.findMany({
      where: {
        accessEndsAt: {
          gt: now
        }
      },
      distinct: ["userId"],
      select: {
        userId: true
      }
    }),
    prisma.subscription.count({
      where: {
        stripeCustomerId: {
          not: null
        }
      }
    }),
    prisma.user.findMany({
      where: getUsersWhere({ search, filter, now }),
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        email: true,
        twitchLogin: true,
        twitchName: true,
        plan: true,
        createdAt: true,
        sessions: {
          orderBy: { updatedAt: "desc" },
          take: 1,
          select: {
            updatedAt: true
          }
        },
        subscription: {
          select: {
            status: true,
            stripeCustomerId: true
          }
        },
        promoRedemptions: {
          where: {
            accessEndsAt: {
              gt: now
            }
          },
          take: 1,
          select: {
            accessEndsAt: true
          }
        },
        _count: {
          select: {
            clipTargets: true,
            clips: true
          }
        }
      }
    }),
    prisma.promoCode.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        code: true,
        durationHours: true,
        maxUses: true,
        usedCount: true,
        createdAt: true
      }
    }),
    prisma.$queryRaw<DailyCountRow[]>`
      SELECT DATE_TRUNC('day', "createdAt") AS day, COUNT(*)::int AS count
      FROM "User"
      WHERE "createdAt" >= ${thirtyDaysAgo}
      GROUP BY day
      ORDER BY day ASC
    `,
    prisma.$queryRaw<DailyCountRow[]>`
      SELECT DATE_TRUNC('day', "createdAt") AS day, COUNT(*)::int AS count
      FROM "Clip"
      WHERE "createdAt" >= ${thirtyDaysAgo}
      GROUP BY day
      ORDER BY day ASC
    `,
    prisma.clip.findFirst({
      orderBy: { createdAt: "desc" },
      select: {
        title: true,
        broadcasterLogin: true,
        createdAt: true,
        status: true
      }
    }),
    prisma.clip.findFirst({
      where: { triggerType: ClipTriggerType.CHAT_COMMAND },
      orderBy: { createdAt: "desc" },
      select: {
        createdAt: true
      }
    }),
    prisma.user.findFirst({
      orderBy: { createdAt: "desc" },
      select: {
        email: true,
        twitchLogin: true,
        createdAt: true
      }
    })
  ]);

  const revenueByPlan = getRevenueByPlan(activeSubscriptions);
  const activePaidUsers = activeSubscriptions.length;
  const mrr = revenueByPlan.reduce((sum, item) => sum + item.mrr, 0);
  const trialToPaidDenominator = activePaidUsers + activeTrials;
  const conversionRate =
    trialToPaidDenominator > 0
      ? (activePaidUsers / trialToPaidDenominator) * 100
      : 0;
  const usersGrowthSeries = normalizeDailyCounts(usersGrowth);
  const clipsGrowthSeries = normalizeDailyCounts(clipsGrowth);
  const usersRegisteredLast7Days = sumSince(usersGrowthSeries, sevenDaysAgo);
  const usersRegisteredLast30Days = sumSeries(usersGrowthSeries);
  const clipsCreatedLast7Days = sumSince(clipsGrowthSeries, sevenDaysAgo);
  const clipsCreatedLast30Days = sumSeries(clipsGrowthSeries);
  const hasConfiguredWorker =
    totalStreamersAdded > 0 &&
    Boolean(
      await prisma.clipRule.count({
        where: { enabled: true }
      })
    );

  return {
    overview: {
      totalUsers,
      totalTwitchAccountsConnected,
      totalStreamersAdded,
      totalClipsCreated,
      totalDownloads: null as number | null,
      totalPromoActivations,
      activeTrials,
      activePaidUsers,
      mrr,
      conversionRate
    },
    users: recentUsers,
    revenue: {
      activeSubscriptions: activePaidUsers,
      trialSubscriptions: activeTrials,
      monthlyRevenue: mrr,
      promoUsers: activePromoUsers.length,
      stripeCustomers,
      revenueByPlan
    },
    promoCodes,
    growth: {
      usersRegisteredLast7Days,
      usersRegisteredLast30Days,
      clipsCreatedLast7Days,
      clipsCreatedLast30Days,
      usersGrowth: usersGrowthSeries,
      clipsGrowth: clipsGrowthSeries
    },
    system: {
      workerStatus: hasConfiguredWorker ? "ONLINE" : "OFFLINE",
      lastClip,
      lastDownload: null as Date | null,
      lastUserSignup,
      databaseStatus: "ONLINE",
      stripeStatus:
        env.STRIPE_SECRET_KEY && env.STRIPE_WEBHOOK_SECRET
          ? "ONLINE"
          : "OFFLINE",
      lastChatCommandAt: lastChatCommandClip?.createdAt ?? null
    }
  };
}

function getUsersWhere({
  search,
  filter,
  now
}: {
  search?: string;
  filter: AdminUserFilter;
  now: Date;
}): Prisma.UserWhereInput {
  const conditions: Prisma.UserWhereInput[] = [];
  const trimmedSearch = search?.trim();

  if (trimmedSearch) {
    conditions.push({
      OR: [
        { email: { contains: trimmedSearch, mode: "insensitive" } },
        { twitchLogin: { contains: trimmedSearch, mode: "insensitive" } },
        { twitchName: { contains: trimmedSearch, mode: "insensitive" } }
      ]
    });
  }

  if (filter === "free") {
    conditions.push({
      plan: Plan.FREE,
      subscription: {
        isNot: {
          status: {
            in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING]
          }
        }
      },
      promoRedemptions: {
        none: {
          accessEndsAt: {
            gt: now
          }
        }
      }
    });
  }

  if (filter === "trial") {
    conditions.push({
      subscription: {
        is: {
          status: SubscriptionStatus.TRIALING
        }
      }
    });
  }

  if (filter === "pro") {
    conditions.push({ plan: Plan.PRO });
  }

  if (filter === "business") {
    conditions.push({ plan: Plan.BUSINESS });
  }

  if (filter === "promo") {
    conditions.push({
      promoRedemptions: {
        some: {
          accessEndsAt: {
            gt: now
          }
        }
      }
    });
  }

  return conditions.length > 0 ? { AND: conditions } : {};
}

function getRevenueByPlan(
  subscriptions: {
    stripePriceId: string | null;
    user: {
      plan: Plan;
    };
  }[]
) {
  const counts = new Map<Plan, number>([
    [Plan.PRO, 0],
    [Plan.BUSINESS, 0]
  ]);

  for (const subscription of subscriptions) {
    const planFromStripe = getPlanByStripePriceId(subscription.stripePriceId);
    const plan =
      planFromStripe === Plan.FREE ? subscription.user.plan : planFromStripe;

    if (plan === Plan.PRO || plan === Plan.BUSINESS) {
      counts.set(plan, (counts.get(plan) ?? 0) + 1);
    }
  }

  return [Plan.PRO, Plan.BUSINESS].map((plan) => {
    const users = counts.get(plan) ?? 0;
    const price = monthlyPrices[plan];

    return {
      plan,
      users,
      price,
      mrr: users * price
    };
  });
}

function normalizeDailyCounts(rows: DailyCountRow[]) {
  return rows.map((row) => ({
    day: row.day,
    count: Number(row.count)
  }));
}

function sumSeries(series: { count: number }[]) {
  return series.reduce((sum, item) => sum + item.count, 0);
}

function sumSince(series: { day: Date; count: number }[], date: Date) {
  return series.reduce(
    (sum, item) => (item.day >= date ? sum + item.count : sum),
    0
  );
}
