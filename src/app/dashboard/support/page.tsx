import { ArrowRight, LifeBuoy, Mail, MessageCircle } from "lucide-react";

import { AppShell } from "@/components/app/app-shell";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { getDashboardPageData } from "@/features/dashboard/dashboard-page-data";
import { getI18n } from "@/i18n/server";

const discordUrl = "https://discord.gg/QBQC6K68sT";
const supportEmail = "support@autoclipr.app";
const questionsEmail = "contact@autoclipr.app";

export default async function SupportPage() {
  const { user } = await getDashboardPageData();
  const { t } = await getI18n();

  return (
    <AppShell user={user}>
      <PageHeader
        eyebrow={t("nav.support")}
        title={t("support.title")}
        description={t("support.description")}
      />

      <section className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
            <LifeBuoy className="h-5 w-5" aria-hidden="true" />
          </div>
          <CardTitle className="mt-5">{t("support.needHelp")}</CardTitle>
          <p className="mt-3 text-sm leading-7 text-muted">
            {t("support.needHelpDescription")}
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <a
              href={discordUrl}
              target="_blank"
              rel="noreferrer"
              className={buttonClassName({ className: "w-full" })}
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              {t("support.openDiscord")}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a
              href={`mailto:${supportEmail}`}
              className={buttonClassName({
                variant: "secondary",
                className: "w-full"
              })}
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              {t("support.emailSupport")}
            </a>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-success/30 bg-success/10 text-success">
            <MessageCircle className="h-5 w-5" aria-hidden="true" />
          </div>
          <CardTitle className="mt-5">{t("support.askQuestion")}</CardTitle>
          <p className="mt-3 text-sm leading-7 text-muted">
            {t("support.askQuestionDescription")}
          </p>
          <div className="mt-6 grid gap-3">
            <a
              href={`mailto:${questionsEmail}`}
              className={buttonClassName({
                variant: "secondary",
                className: "w-full sm:w-fit"
              })}
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              {t("support.emailQuestions")}
            </a>
            <div className="rounded-lg border border-line bg-black/20 p-4 text-sm leading-6 text-muted">
              <p className="font-semibold text-ink">{t("support.trustTitle")}</p>
              <p className="mt-2">{t("support.trustDescription")}</p>
            </div>
          </div>
        </Card>
      </section>
    </AppShell>
  );
}
