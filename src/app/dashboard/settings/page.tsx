import type { ReactNode } from "react";
import { ShieldCheck } from "lucide-react";

import { AppShell } from "@/components/app/app-shell";
import { Card, CardTitle } from "@/components/ui/card";
import { LocalDate } from "@/components/ui/local-date";
import { PageHeader } from "@/components/ui/page-header";
import { getSettingsPageData } from "@/features/dashboard/dashboard-page-data";
import { getI18n } from "@/i18n/server";

export default async function SettingsPage() {
  const { user, effectivePlan } = await getSettingsPageData();
  const { t } = await getI18n();

  return (
    <AppShell user={user}>
      <PageHeader
        eyebrow={t("nav.settings")}
        title={t("settings.accountSettings")}
        description={t("settings.description")}
      />

      <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-success/30 bg-success/10 text-success">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <CardTitle>{t("settings.twitchAccount")}</CardTitle>
              <p className="mt-1 text-sm text-muted">
                {t("settings.twitchAccountHint")}
              </p>
            </div>
          </div>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <ProfileItem
              label={t("settings.name")}
              value={user.twitchName ?? user.name ?? t("settings.notProvided")}
            />
            <ProfileItem
              label={t("settings.login")}
              value={user.twitchLogin ?? t("settings.notProvided")}
            />
            <ProfileItem
              label={t("settings.twitchUserId")}
              value={user.twitchUserId ?? t("settings.notProvided")}
            />
            <ProfileItem label={t("settings.autoClipRole")} value={user.role} />
          </dl>
        </Card>

        <Card className="p-6">
          <CardTitle>{t("settings.workspace")}</CardTitle>
          <div className="mt-5 grid gap-4">
            <ProfileItem label={t("settings.plan")} value={effectivePlan} />
            <ProfileItem
              label={t("settings.created")}
              value={<LocalDate date={user.createdAt} />}
            />
            <ProfileItem
              label={t("settings.email")}
              value={user.email ?? t("settings.twitchAccountFallback")}
            />
          </div>
        </Card>
      </section>
    </AppShell>
  );
}

function ProfileItem({
  label,
  value
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-line bg-black/20 p-4">
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </dt>
      <dd className="mt-2 break-words text-sm font-medium text-ink">{value}</dd>
    </div>
  );
}
