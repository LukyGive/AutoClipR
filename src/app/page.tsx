import Link from "next/link";
import {
  ArrowRight,
  Check,
  Clapperboard,
  Command,
  Download,
  KeyRound,
  Sparkles,
  TimerReset
} from "lucide-react";

import { auth } from "@/lib/auth";
import { LanguageSwitcher } from "@/components/app/language-switcher";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PricingCard } from "@/components/ui/pricing-card";
import { getI18n } from "@/i18n/server";
import { TranslationProvider } from "@/i18n/useTranslation";

const features = [
  {
    icon: Command,
    titleKey: "landing.featureChatTitle",
    descriptionKey: "landing.featureChatBody"
  },
  {
    icon: KeyRound,
    titleKey: "landing.featureApiTitle",
    descriptionKey: "landing.featureApiBody"
  },
  {
    icon: Download,
    titleKey: "landing.featureDownloadsTitle",
    descriptionKey: "landing.featureDownloadsBody"
  },
  {
    icon: TimerReset,
    titleKey: "landing.featureTrialTitle",
    descriptionKey: "landing.featureTrialBody"
  }
];

const faqs = [
  {
    questionKey: "faq.question1",
    answerKey: "faq.answer1"
  },
  {
    questionKey: "faq.question2",
    answerKey: "faq.answer2"
  },
  {
    questionKey: "faq.question3",
    answerKey: "faq.answer3"
  }
];

export default async function HomePage() {
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

        <div className="hidden items-center gap-6 text-sm font-medium text-muted md:flex">
          <a href="#features" className="transition hover:text-ink">
            {t("nav.features")}
          </a>
          <a href="#pricing" className="transition hover:text-ink">
            {t("nav.pricing")}
          </a>
          <a href="#faq" className="transition hover:text-ink">
            {t("nav.docs")}
          </a>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Link
            href={primaryHref}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-line bg-surface px-4 text-sm font-semibold text-ink transition duration-200 hover:bg-surface-hover"
          >
            {session ? t("common.dashboard") : t("common.login")}
          </Link>
        </div>
      </nav>

      <section className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:pb-24 lg:pt-16">
        <div>
          <Badge>
            <Sparkles className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
            {t("landing.badge")}
          </Badge>
          <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-tight tracking-normal text-ink md:text-7xl">
            {t("landing.heroTitle")}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-muted md:text-lg">
            {t("landing.heroSubtitle")}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={primaryHref} size="lg">
              {t("landing.ctaPrimary")}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </ButtonLink>
            <ButtonLink href="/login" variant="secondary" size="lg">
              {t("landing.ctaSecondary")}
            </ButtonLink>
          </div>
          <div className="mt-8 grid gap-3 text-sm text-zinc-300 sm:grid-cols-3">
            {[
              t("landing.officialTwitchApi"),
              t("landing.chatWorkerReady"),
              t("landing.builtForScale")
            ].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-success" aria-hidden="true" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <DashboardPreview t={t} />
      </section>

      <section className="border-y border-line bg-black/20">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <Badge>{t("landing.howItWorks")}</Badge>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              [
                "01",
                t("landing.step1Title"),
                t("landing.step1Body")
              ],
              [
                "02",
                t("landing.step2Title"),
                t("landing.step2Body")
              ],
              [
                "03",
                t("landing.step3Title"),
                t("landing.step3Body")
              ]
            ].map(([step, title, body]) => (
              <Card key={step} className="p-5">
                <p className="text-xs font-semibold text-primary">{step}</p>
                <h2 className="mt-4 text-base font-semibold text-ink">
                  {title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted">{body}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="max-w-2xl">
          <Badge>{t("nav.features")}</Badge>
          <h2 className="mt-4 text-3xl font-semibold tracking-normal text-ink md:text-4xl">
            {t("landing.featuresTitle")}
          </h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.titleKey} className="p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-base font-semibold text-ink">
                  {t(feature.titleKey)}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {t(feature.descriptionKey)}
                </p>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="grid items-center gap-8 rounded-lg border border-line bg-black/20 p-6 md:grid-cols-[0.8fr_1.2fr] md:p-8">
          <div>
            <Badge>{t("landing.dashboardPreview")}</Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-normal text-ink">
              {t("landing.dashboardPreviewTitle")}
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              {t("landing.dashboardPreviewBody")}
            </p>
          </div>
          <DashboardPreview compact t={t} />
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="max-w-2xl">
          <Badge>{t("nav.pricing")}</Badge>
          <h2 className="mt-4 text-3xl font-semibold tracking-normal text-ink">
            {t("landing.pricingTitle")}
          </h2>
        </div>
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          <PricingCard
            name="Free"
            price="0 €"
            description={t("pricing.freeDescription")}
            features={[
              t("billing.clipsPerMonth", { count: 25 }),
              t("pricing.manualClips"),
              t("pricing.oneStreamerTarget")
            ]}
          />
          <PricingCard
            name="Pro"
            price="9.99 €/month"
            description={t("pricing.proDescription")}
            features={[
              t("billing.clipsPerMonth", { count: "1,000" }),
              t("landing.featureChatTitle"),
              `${t("usage.aiVoiceDetection")} - ${t("common.comingSoon")}`
            ]}
            highlighted
            badge={t("pricing.popular")}
          />
          <PricingCard
            name="Business"
            price="24.99 €/month"
            description={t("pricing.businessDescription")}
            features={[
              t("billing.clipsPerMonth", { count: "10,000" }),
              t("pricing.multiChannelSupport"),
              t("pricing.priorityCapacity")
            ]}
          />
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-4xl px-4 pb-20 sm:px-6">
        <Badge>{t("faq.title")}</Badge>
        <div className="mt-6 grid gap-3">
          {faqs.map((faq) => (
            <Card key={faq.questionKey} className="p-5">
              <h3 className="text-sm font-semibold text-ink">
                {t(faq.questionKey)}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                {t(faq.answerKey)}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <footer className="border-t border-line px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-sm text-muted md:flex-row">
          <p>{t("landing.footer")}</p>
          <p>autoclipr.app</p>
        </div>
      </footer>
    </main>
    </TranslationProvider>
  );
}

function DashboardPreview({
  compact = false,
  t
}: {
  compact?: boolean;
  t: Awaited<ReturnType<typeof getI18n>>["t"];
}) {
  return (
    <div className="rounded-lg border border-line bg-[#0D0D10] p-4 shadow-glow">
      <div className="flex items-center justify-between border-b border-line pb-4">
        <div>
          <p className="text-xs text-muted">{t("common.dashboard")}</p>
          <p className="mt-1 text-sm font-semibold text-ink">
            {t("landing.dashboardPreviewWelcome")}
          </p>
        </div>
        <div className="rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-semibold text-green-300">
          {t("landing.dashboardPreviewBotOnline")}
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {[
          [t("dashboard.totalClips"), "248"],
          [t("dashboard.activeStreamers"), "4"],
          [t("analytics.successRate"), "98%"]
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-lg border border-line bg-surface p-4"
          >
            <p className="text-xs text-muted">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 grid gap-3">
        {[
          ["!clip detected", "@jezu_lol", "READY"],
          [t("landing.dashboardPreviewManualClip"), "@zerator", "PROCESSING"],
          ["AI keyword GOAL", "@streamer", "READY"]
        ]
          .slice(0, compact ? 2 : 3)
          .map(([title, channel, status]) => (
            <div
              key={title}
              className="flex items-center justify-between rounded-lg border border-line bg-black/20 p-3"
            >
              <div>
                <p className="text-sm font-medium text-ink">{title}</p>
                <p className="mt-1 text-xs text-muted">{channel}</p>
              </div>
              <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-violet-200">
                {status}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}
