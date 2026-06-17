import { Plan } from "@prisma/client";

import { buttonClassName } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { LocalDate } from "@/components/ui/local-date";
import { PricingCard } from "@/components/ui/pricing-card";
import { billingPlans } from "@/features/billing/plans";
import {
  createBillingPortalSession,
  createCheckoutSession
} from "@/features/billing/actions";
import { getI18n } from "@/i18n/server";

export async function PlansPanel({
  effectivePlan,
  promoAccessEndsAt,
  hasStripeCustomer
}: {
  effectivePlan: Plan;
  promoAccessEndsAt: Date | null;
  hasStripeCustomer: boolean;
}) {
  const { t } = await getI18n();

  return (
    <Card className="p-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <CardTitle>{t("billing.billing")}</CardTitle>
          <p className="mt-1 text-sm text-muted">
            {t("billing.freeProBusiness")}
          </p>
        </div>
        {hasStripeCustomer ? (
          <form action={createBillingPortalSession}>
            <button className={buttonClassName({ variant: "secondary" })}>
              {t("billing.manageSubscription")}
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
            description={getPlanDescription(plan.id, t)}
            highlighted={plan.id === Plan.PRO}
            badge={
              effectivePlan === plan.id
                ? t("billing.current")
                : plan.id === Plan.PRO
                  ? t("pricing.popular")
                  : undefined
            }
            features={[
              t("billing.clipsPerMonth", { count: plan.monthlyClipLimit }),
              t("billing.streamersLimit", {
                count: plan.maxStreamers ?? t("common.unlimited")
              }),
              `${t("usage.aiVoiceDetection")} - ${t("common.comingSoon")}`,
              plan.id === Plan.FREE
                ? t("pricing.manualClips")
                : `${t("landing.featureChatTitle")} + ${t("landing.featureApiTitle")}`
            ]}
            action={
              plan.id !== Plan.FREE &&
              effectivePlan !== plan.id &&
              !hasStripeCustomer ? (
                <form action={createCheckoutSession}>
                  <input type="hidden" name="plan" value={plan.id} />
                  <button
                    type="submit"
                    disabled={!plan.stripePriceId}
                    className={buttonClassName({ className: "w-full" })}
                  >
                    {t("billing.upgradeTo", { plan: plan.name })}
                  </button>
                </form>
              ) : null
            }
          />
        ))}
      </div>
      {promoAccessEndsAt ? (
        <p className="mt-4 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-violet-100">
          {t("promo.activeUntil", {
            date: ""
          })}
          <LocalDate date={promoAccessEndsAt} variant="dateTime" />
        </p>
      ) : null}
    </Card>
  );
}

function getPlanDescription(
  plan: Plan,
  t: (key: string, variables?: Record<string, string | number>) => string
) {
  if (plan === Plan.PRO) {
    return t("pricing.proDescription");
  }

  if (plan === Plan.BUSINESS) {
    return t("pricing.businessDescription");
  }

  return t("pricing.freeDescription");
}
