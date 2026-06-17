import { Bot } from "lucide-react";

import { AppShell } from "@/components/app/app-shell";
import { Card, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { getRulesPageData } from "@/features/dashboard/dashboard-page-data";
import { RuleSettingsForm } from "@/features/rules/rule-settings-form";
import { getI18n } from "@/i18n/server";

export default async function RulesPage() {
  const { user } = await getRulesPageData();
  const { t } = await getI18n();
  const primaryRule = user.clipRules[0];

  return (
    <AppShell user={user}>
      <PageHeader
        eyebrow={t("rules.botRules")}
        title={t("rules.controlCommand")}
        description={t("rules.description")}
      />

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        {primaryRule ? (
          <RuleSettingsForm rule={primaryRule} />
        ) : (
          <Card className="p-6">
            <CardTitle>{t("rules.botRules")}</CardTitle>
            <p className="mt-3 text-sm text-muted">
              {t("dashboard.noRuleReconnect")}
            </p>
          </Card>
        )}

        <Card className="p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
            <Bot className="h-5 w-5" aria-hidden="true" />
          </div>
          <CardTitle className="mt-5">{t("rules.recommendedSetup")}</CardTitle>
          <div className="mt-5 grid gap-3 text-sm text-muted">
            <p>{t("rules.recommended1")}</p>
            <p>{t("rules.recommended2")}</p>
            <p>{t("rules.recommended3")}</p>
          </div>
        </Card>
      </section>
    </AppShell>
  );
}
