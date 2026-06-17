import { AppShell } from "@/components/app/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { PlansPanel } from "@/features/billing/plans-panel";
import { TrialBanner } from "@/features/billing/trial-banner";
import { UsagePanel } from "@/features/billing/usage-panel";
import { getDashboardPageData } from "@/features/dashboard/dashboard-page-data";

export default async function BillingPage() {
  const { user, usage } = await getDashboardPageData();

  return (
    <AppShell user={user}>
      <PageHeader
        eyebrow={user.plan}
        title="Billing"
        description="Review usage and choose the plan that matches your Twitch clip volume."
      />

      <TrialBanner
        status={user.subscription?.status}
        currentPeriodEnd={user.subscription?.currentPeriodEnd}
      />

      <section className="mt-8 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <UsagePanel
          clipsUsed={usage.clipsUsed}
          clipsLimit={usage.clipsLimit}
        />
        <PlansPanel
          currentPlan={user.plan}
          hasStripeCustomer={Boolean(user.subscription?.stripeCustomerId)}
        />
      </section>
    </AppShell>
  );
}
