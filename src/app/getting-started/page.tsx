import Link from "next/link";
import {
  ArrowRight,
  Clapperboard,
  Download,
  Plus,
  RadioTower
} from "lucide-react";

import { LanguageSwitcher } from "@/components/app/language-switcher";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { getI18n } from "@/i18n/server";
import { TranslationProvider } from "@/i18n/useTranslation";

const steps = [
  {
    number: "01",
    icon: Clapperboard,
    titleKey: "gettingStarted.step1Title",
    bodyKey: "gettingStarted.step1Body"
  },
  {
    number: "02",
    icon: RadioTower,
    titleKey: "gettingStarted.step2Title",
    bodyKey: "gettingStarted.step2Body"
  },
  {
    number: "03",
    icon: Plus,
    titleKey: "gettingStarted.step3Title",
    bodyKey: "gettingStarted.step3Body"
  },
  {
    number: "04",
    icon: Download,
    titleKey: "gettingStarted.step4Title",
    bodyKey: "gettingStarted.step4Body"
  }
];

export default async function GettingStartedPage() {
  const session = await auth();
  const { locale, t } = await getI18n();
  const primaryHref = session ? "/dashboard" : "/login";

  return (
    <TranslationProvider initialLocale={locale}>
      <main className="min-h-screen bg-app-bg text-ink">
        <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-5 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/40 bg-primary/15 text-primary shadow-glow">
              <Clapperboard className="h-5 w-5" aria-hidden="true" />
            </div>
            <span className="text-sm font-semibold text-ink">AutoClipR</span>
          </Link>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ButtonLink href={primaryHref} variant="secondary">
              {session ? t("common.dashboard") : t("landing.ctaPrimary")}
            </ButtonLink>
          </div>
        </nav>

        <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:py-20">
          <Badge>{t("gettingStarted.badge")}</Badge>
          <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-tight tracking-normal text-ink md:text-6xl">
            {t("gettingStarted.title")}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-muted md:text-lg">
            {t("gettingStarted.description")}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={primaryHref} size="lg">
              {t("landing.ctaPrimary")}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </ButtonLink>
            <ButtonLink href="/" variant="secondary" size="lg">
              {t("gettingStarted.backToHome")}
            </ButtonLink>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">
          <div className="grid gap-5">
            {steps.map((step) => {
              const Icon = step.icon;

              return (
                <Card
                  key={step.number}
                  className="grid gap-5 p-5 md:grid-cols-[0.85fr_1.15fr] md:p-6"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <p className="text-xs font-semibold uppercase text-primary">
                        {t("gettingStarted.stepLabel", {
                          number: step.number
                        })}
                      </p>
                    </div>
                    <h2 className="mt-5 text-xl font-semibold tracking-normal text-ink">
                      {t(step.titleKey)}
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-muted">
                      {t(step.bodyKey)}
                    </p>
                  </div>
                  <div className="flex min-h-48 items-center justify-center rounded-lg border border-dashed border-primary/30 bg-primary/5 p-5">
                    <div className="text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg border border-line bg-black/30 text-primary">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <p className="mt-4 text-sm font-semibold text-ink">
                        {t("gettingStarted.screenshotPlaceholder")}
                      </p>
                      <p className="mt-2 text-xs leading-5 text-muted">
                        {t("gettingStarted.screenshotHint")}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      </main>
    </TranslationProvider>
  );
}
