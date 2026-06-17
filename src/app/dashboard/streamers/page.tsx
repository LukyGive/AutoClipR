import { RadioTower } from "lucide-react";

import { AppShell } from "@/components/app/app-shell";
import { Card, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { getDashboardPageData } from "@/features/dashboard/dashboard-page-data";
import { TargetSettings } from "@/features/targets/target-settings";
import { getI18n } from "@/i18n/server";

export default async function StreamersPage() {
  const { user, baseUrl } = await getDashboardPageData();
  const { t } = await getI18n();

  return (
    <AppShell user={user}>
      <PageHeader
        eyebrow={t("nav.streamers")}
        title={t("streamers.chooseChannels")}
        description={t("streamers.description")}
      />

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <TargetSettings
          targets={user.clipTargets}
          baseUrl={baseUrl}
          currentPlan={user.plan}
        />
        <Card className="p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
            <RadioTower className="h-5 w-5" aria-hidden="true" />
          </div>
          <CardTitle className="mt-5">{t("streamers.workerBehavior")}</CardTitle>
          <p className="mt-3 text-sm leading-7 text-muted">
            {t("streamers.workerBehaviorBody")}
          </p>
        </Card>
      </section>
    </AppShell>
  );
}
