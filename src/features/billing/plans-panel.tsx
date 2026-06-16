import { Plan } from "@prisma/client";

import { buttonClassName } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { PricingCard } from "@/components/ui/pricing-card";
import { billingPlans } from "@/features/billing/plans";
import {
  createBillingPortalSession,
  createCheckoutSession
} from "@/features/billing/actions";

export function PlansPanel({
  currentPlan,
  hasStripeCustomer
}: {
  currentPlan: Plan;
  hasStripeCustomer: boolean;
}) {
  return (
    <Card className="p-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <CardTitle>Billing</CardTitle>
          <p className="mt-1 text-sm text-muted">
            Free, Pro and Business plans.
          </p>
        </div>
        {hasStripeCustomer ? (
          <form action={createBillingPortalSession}>
            <button className={buttonClassName({ variant: "secondary" })}>
              Manage subscription
            </button>
          </form>
        ) : null}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {billingPlans.map((plan) => (
          <PricingCard
            key={plan.id}
            name={plan.name}
            price={plan.priceLabel}
            description={plan.description}
            highlighted={plan.id === Plan.PRO}
            badge={
              currentPlan === plan.id
                ? "Current"
                : plan.id === Plan.PRO
                  ? "Popular"
                  : undefined
            }
            features={[
              `${plan.monthlyClipLimit} clips/month`,
              `${plan.monthlySpeechEventLimit} AI events/month`,
              plan.id === Plan.FREE
                ? "Manual clipping"
                : "Chat and API triggers"
            ]}
            action={
              plan.id !== Plan.FREE &&
              currentPlan !== plan.id &&
              !hasStripeCustomer ? (
                <form action={createCheckoutSession}>
                  <input type="hidden" name="plan" value={plan.id} />
                  <button
                    type="submit"
                    disabled={!plan.stripePriceId}
                    className={buttonClassName({ className: "w-full" })}
                  >
                    Upgrade to {plan.name}
                  </button>
                </form>
              ) : null
            }
          />
        ))}
      </div>
    </Card>
  );
}
