import { Plan } from "@prisma/client";

import { env } from "@/lib/env";
import { getPlanLimits } from "@/features/billing/plan-limits";

export type BillingPlan = {
  id: Plan;
  name: string;
  description: string;
  monthlyClipLimit: number;
  monthlySpeechEventLimit: number;
  maxStreamers: number | null;
  maxAiTriggers: number;
  priceLabel: string;
  stripePriceId?: string;
};

export const billingPlans: BillingPlan[] = [
  {
    id: Plan.FREE,
    name: "Free",
    description: "For testing AutoClipR.",
    monthlyClipLimit: getPlanLimits(Plan.FREE).maxClips,
    monthlySpeechEventLimit: 100,
    maxStreamers: getPlanLimits(Plan.FREE).maxStreamers,
    maxAiTriggers: getPlanLimits(Plan.FREE).maxAiTriggers,
    priceLabel: "0 €"
  },
  {
    id: Plan.PRO,
    name: "Pro",
    description: "For streamers, editors and content creators.",
    monthlyClipLimit: getPlanLimits(Plan.PRO).maxClips,
    monthlySpeechEventLimit: 10000,
    maxStreamers: getPlanLimits(Plan.PRO).maxStreamers,
    maxAiTriggers: getPlanLimits(Plan.PRO).maxAiTriggers,
    priceLabel: "9.99 €/month",
    stripePriceId:
      env.STRIPE_PRO_PRICE_ID ||
      (env.DEMO_MODE === "true" ? "price_demo_pro" : undefined)
  },
  {
    id: Plan.BUSINESS,
    name: "Business",
    description: "For agencies, esports teams and multi-channel operations.",
    monthlyClipLimit: getPlanLimits(Plan.BUSINESS).maxClips,
    monthlySpeechEventLimit: 100000,
    maxStreamers: getPlanLimits(Plan.BUSINESS).maxStreamers,
    maxAiTriggers: getPlanLimits(Plan.BUSINESS).maxAiTriggers,
    priceLabel: "24.99 €/month",
    stripePriceId:
      env.STRIPE_BUSINESS_PRICE_ID ||
      (env.DEMO_MODE === "true" ? "price_demo_business" : undefined)
  }
];

export function getPlan(plan: Plan) {
  return billingPlans.find((item) => item.id === plan) ?? billingPlans[0];
}

export function getPlanByStripePriceId(priceId?: string | null) {
  if (!priceId) {
    return Plan.FREE;
  }

  return (
    billingPlans.find((plan) => plan.stripePriceId === priceId)?.id ?? Plan.FREE
  );
}

export function getCurrentBillingPeriodStart() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}
