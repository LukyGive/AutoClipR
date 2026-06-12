import type { Plan } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getCurrentBillingPeriodStart, getPlan } from "@/features/billing/plans";

export async function getUsageSummary(userId: string, plan: Plan) {
  const periodStart = getCurrentBillingPeriodStart();
  const planConfig = getPlan(plan);
  const [clipsUsed, speechEventsUsed] = await Promise.all([
    prisma.clip.count({
      where: {
        userId,
        createdAt: {
          gte: periodStart
        }
      }
    }),
    prisma.speechTranscriptEvent.count({
      where: {
        userId,
        createdAt: {
          gte: periodStart
        }
      }
    })
  ]);

  return {
    periodStart,
    clipsUsed,
    clipsLimit: planConfig.monthlyClipLimit,
    speechEventsUsed,
    speechEventsLimit: planConfig.monthlySpeechEventLimit
  };
}

export async function canCreateClip(userId: string, plan: Plan) {
  const usage = await getUsageSummary(userId, plan);

  return {
    allowed: usage.clipsUsed < usage.clipsLimit,
    usage
  };
}
