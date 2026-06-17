import { prisma } from "@/lib/prisma";

export async function getUserDashboard(userId: string) {
  return prisma.user.findUnique({
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
      _count: {
        select: {
          clips: true,
          clipRules: true,
          speechEvents: true
        }
      },
      clipRules: {
        orderBy: { createdAt: "asc" },
        take: 3
      },
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
      clips: {
        orderBy: { createdAt: "desc" },
        take: 5
      },
      subscription: {
        select: {
          status: true,
          currentPeriodEnd: true,
          stripeCustomerId: true
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
}
