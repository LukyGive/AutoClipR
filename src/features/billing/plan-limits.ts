import type { Plan } from "@prisma/client";

export type PlanLimits = {
  maxClips: number;
  maxStreamers: number | null;
  maxAiTriggers: number;
};

export const planLimits = {
  FREE: {
    maxClips: 25,
    maxStreamers: 1,
    maxAiTriggers: 0
  },
  PRO: {
    maxClips: 1000,
    maxStreamers: 10,
    maxAiTriggers: 5
  },
  BUSINESS: {
    maxClips: 10000,
    maxStreamers: null,
    maxAiTriggers: 50
  }
} satisfies Record<Plan, PlanLimits>;

export function getPlanLimits(plan: Plan) {
  return planLimits[plan] ?? planLimits.FREE;
}

export function formatPlanLimit(limit: number | null) {
  return limit === null ? "Unlimited" : String(limit);
}
