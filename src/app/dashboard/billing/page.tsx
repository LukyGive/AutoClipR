import { AppShell } from "@/components/app/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { PlansPanel } from "@/features/billing/plans-panel";
import { PromoCodeCard } from "@/features/billing/promo-code-card";
import { TrialBanner } from "@/features/billing/trial-banner";
import { UsagePanel } from "@/features/billing/usage-panel";
import { getDashboardPageData } from "@/features/dashboard/dashboard-page-data";
import { getI18n } from "@/i18n/server";

export default async function BillingPage() {
  const { user, usage, effectivePlan, promoAccessEndsAt } =
    await getDashboardPageData();
  const { t } = await getI18n();

  return (
    <AppShell user={user}>
      <PageHeader
        eyebrow={effectivePlan}
        title={t("billing.billing")}
        description={t("billing.choosePlan")}
      />

      <TrialBanner
        status={user.subscription?.status}
        currentPeriodEnd={user.subscription?.currentPeriodEnd}
      />

      <section className="mt-8 max-w-3xl">
        <UsagePanel clipsUsed={usage.clipsUsed} clipsLimit={usage.clipsLimit} />
      </section>

      <section className="mt-8">
        <PlansPanel
          effectivePlan={effectivePlan}
          promoAccessEndsAt={promoAccessEndsAt}
          hasStripeCustomer={Boolean(user.subscription?.stripeCustomerId)}
        />
      </section>

      <section className="mt-8">
        <PromoCodeCard />
      </section>
    </AppShell>
  );
}
