import { Plan } from "@prisma/client";

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
    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-soft">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-semibold text-ink">Plans</h2>
          <p className="mt-1 text-sm text-zinc-600">Free, Pro et Business.</p>
        </div>
        {hasStripeCustomer ? (
          <form action={createBillingPortalSession}>
            <button className="rounded border border-zinc-300 px-4 py-2 text-sm font-semibold text-ink hover:bg-zinc-50">
              Gérer l'abonnement
            </button>
          </form>
        ) : null}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {billingPlans.map((plan) => (
          <div key={plan.id} className="rounded border border-zinc-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-ink">{plan.name}</h3>
                <p className="mt-1 text-sm text-zinc-600">{plan.description}</p>
              </div>
              {currentPlan === plan.id ? (
                <span className="rounded bg-violet-50 px-2 py-1 text-xs font-semibold text-twitch">
                  Actuel
                </span>
              ) : null}
            </div>
            <p className="mt-4 text-2xl font-semibold text-ink">{plan.priceLabel}</p>
            <p className="mt-2 text-sm text-zinc-600">
              {plan.monthlyClipLimit} clips/mois
            </p>
            <p className="text-sm text-zinc-600">
              {plan.monthlySpeechEventLimit} événements IA/mois
            </p>

            {plan.id !== Plan.FREE && currentPlan !== plan.id && !hasStripeCustomer ? (
              <form action={createCheckoutSession} className="mt-4">
                <input type="hidden" name="plan" value={plan.id} />
                <button
                  type="submit"
                  disabled={!plan.stripePriceId}
                  className="w-full rounded bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:bg-zinc-300"
                >
                  Passer à {plan.name}
                </button>
              </form>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
