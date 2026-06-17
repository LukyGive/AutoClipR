import { Plan, SubscriptionStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const activeStripeStatuses = new Set<SubscriptionStatus>([
  SubscriptionStatus.ACTIVE,
  SubscriptionStatus.TRIALING
]);

export async function getEffectivePlan(userId: string, storedPlan?: Plan | null) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      plan: true,
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
    return {
      plan: storedPlan ?? Plan.FREE,
      promoAccessEndsAt: null
    };
  }

  const basePlan = storedPlan ?? user.plan;
  const promoAccessEndsAt = user.promoRedemptions[0]?.accessEndsAt ?? null;

  if (basePlan === Plan.BUSINESS) {
    return {
      plan: Plan.BUSINESS,
      promoAccessEndsAt
    };
  }

  if (
    user.subscription?.status &&
    activeStripeStatuses.has(user.subscription.status)
  ) {
    return {
      plan: basePlan === Plan.FREE ? Plan.PRO : basePlan,
      promoAccessEndsAt
    };
  }

  if (promoAccessEndsAt) {
    return {
      plan: Plan.PRO,
      promoAccessEndsAt
    };
  }

  return {
    plan: basePlan,
    promoAccessEndsAt
  };
}

export async function hasActivePromoAccess(userId: string) {
  const redemption = await prisma.promoRedemption.findFirst({
    where: {
      userId,
      accessEndsAt: {
        gt: new Date()
      }
    },
    orderBy: {
      accessEndsAt: "desc"
    },
    select: {
      accessEndsAt: true
    }
  });

  return redemption?.accessEndsAt ?? null;
}
