import { Plan } from "@prisma/client";

import { env } from "@/lib/env";

export type BillingPlan = {
  id: Plan;
  name: string;
  description: string;
  monthlyClipLimit: number;
  monthlySpeechEventLimit: number;
  priceLabel: string;
  stripePriceId?: string;
};

export const billingPlans: BillingPlan[] = [
  {
    id: Plan.FREE,
    name: "Free",
    description: "Pour valider le workflow AutoClipR.",
    monthlyClipLimit: 25,
    monthlySpeechEventLimit: 100,
    priceLabel: "0 €"
  },
  {
    id: Plan.PRO,
    name: "Pro",
    description: "Pour streamers actifs et petites communautés.",
    monthlyClipLimit: 1000,
    monthlySpeechEventLimit: 10000,
    priceLabel: "19 € / mois",
    stripePriceId:
      env.STRIPE_PRO_PRICE_ID ||
      (env.DEMO_MODE === "true" ? "price_demo_pro" : undefined)
  },
  {
    id: Plan.BUSINESS,
    name: "Business",
    description: "Pour équipes, agences et chaînes à fort volume.",
    monthlyClipLimit: 10000,
    monthlySpeechEventLimit: 100000,
    priceLabel: "99 € / mois",
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
