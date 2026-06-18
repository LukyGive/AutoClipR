import {
  Activity,
  BarChart3,
  Clapperboard,
  CreditCard,
  Download,
  ExternalLink,
  Gift,
  RadioTower,
  Search,
  ShieldCheck,
  TrendingUp,
  Users
} from "lucide-react";
import type { SubscriptionStatus } from "@prisma/client";
import type { ReactNode } from "react";

import { AppShell } from "@/components/app/app-shell";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { LocalDate } from "@/components/ui/local-date";
import { PageHeader } from "@/components/ui/page-header";
import { StatusPill } from "@/components/ui/status-pill";
import { createAdminPromoCode } from "@/features/admin/actions";
import { requireAdminSession } from "@/features/admin/access";
import {
  getAdminDashboardData,
  type AdminUserFilter
} from "@/features/admin/queries";
import { StatCard } from "@/features/dashboard/stat-card";
import { formatDate } from "@/lib/date-format";
import { getI18n } from "@/i18n/server";

const filters: AdminUserFilter[] = [
  "all",
  "free",
  "trial",
  "pro",
  "business",
  "promo"
];

const quickActions = [
  {
    labelKey: "admin.quickActions.stripe",
    href: "https://dashboard.stripe.com"
  },
  {
    labelKey: "admin.quickActions.discord",
    href: "https://discord.gg/QBQC6K68sT"
  },
  {
    labelKey: "admin.quickActions.neon",
    href: "https://console.neon.tech"
  },
  {
    labelKey: "admin.quickActions.railway",
    href: "https://railway.com"
  },
  {
    labelKey: "admin.quickActions.vercel",
    href: "https://vercel.com"
  }
];

export default async function AdminPage({
  searchParams
}: {
  searchParams?: Promise<{
    q?: string;
    filter?: string;
    promo?: string;
  }>;
}) {
  const session = await requireAdminSession();
  const { locale, t } = await getI18n();
  const resolvedSearchParams = await searchParams;
  const filter = getFilter(resolvedSearchParams?.filter);
  const search = resolvedSearchParams?.q?.trim() ?? "";
  const promoState = resolvedSearchParams?.promo;
  const data = await getAdminDashboardData({ search, filter });

  return (
    <AppShell user={session.user}>
      <PageHeader
        eyebrow={t("admin.eyebrow")}
        title={t("admin.title")}
        description={t("admin.description")}
      />

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard
          icon={Users}
          label={t("admin.kpis.totalUsers")}
          value={formatNumber(data.overview.totalUsers)}
          detail={t("admin.kpiDetails.totalUsers")}
        />
        <StatCard
          icon={ShieldCheck}
          label={t("admin.kpis.twitchConnected")}
          value={formatNumber(data.overview.totalTwitchAccountsConnected)}
          detail={t("admin.kpiDetails.twitchConnected")}
        />
        <StatCard
          icon={RadioTower}
          label={t("admin.kpis.streamersAdded")}
          value={formatNumber(data.overview.totalStreamersAdded)}
          detail={t("admin.kpiDetails.streamersAdded")}
        />
        <StatCard
          icon={Clapperboard}
          label={t("admin.kpis.clipsCreated")}
          value={formatNumber(data.overview.totalClipsCreated)}
          detail={t("admin.kpiDetails.clipsCreated")}
        />
        <StatCard
          icon={Download}
          label={t("admin.kpis.downloads")}
          value={data.overview.totalDownloads ?? t("admin.notTracked")}
          detail={t("admin.kpiDetails.downloads")}
        />
        <StatCard
          icon={Gift}
          label={t("admin.kpis.promoActivations")}
          value={formatNumber(data.overview.totalPromoActivations)}
          detail={t("admin.kpiDetails.promoActivations")}
        />
        <StatCard
          icon={Activity}
          label={t("admin.kpis.activeTrials")}
          value={formatNumber(data.overview.activeTrials)}
          detail={t("admin.kpiDetails.activeTrials")}
        />
        <StatCard
          icon={CreditCard}
          label={t("admin.kpis.activePaidUsers")}
          value={formatNumber(data.overview.activePaidUsers)}
          detail={t("admin.kpiDetails.activePaidUsers")}
        />
        <StatCard
          icon={TrendingUp}
          label={t("admin.kpis.mrr")}
          value={formatCurrency(data.overview.mrr)}
          detail={t("admin.kpiDetails.mrr")}
        />
        <StatCard
          icon={BarChart3}
          label={t("admin.kpis.conversionRate")}
          value={`${data.overview.conversionRate.toFixed(1)}%`}
          detail={t("admin.kpiDetails.conversionRate")}
        />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <UsersPanel
          filter={filter}
          search={search}
          users={data.users}
          t={t}
        />
        <RevenuePanel data={data.revenue} t={t} />
      </section>

      <section
        id="promo-codes"
        className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.9fr]"
      >
        <PromoCodesPanel
          promoCodes={data.promoCodes}
          promoState={promoState}
          t={t}
        />
        <GrowthPanel
          growth={data.growth}
          locale={locale}
          t={t}
        />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <SystemPanel system={data.system} t={t} />
        <QuickActionsPanel t={t} />
      </section>
    </AppShell>
  );
}

function UsersPanel({
  filter,
  search,
  users,
  t
}: {
  filter: AdminUserFilter;
  search: string;
  users: Awaited<ReturnType<typeof getAdminDashboardData>>["users"];
  t: Awaited<ReturnType<typeof getI18n>>["t"];
}) {
  return (
    <Card className="overflow-hidden p-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <CardTitle>{t("admin.sections.users")}</CardTitle>
          <p className="mt-1 text-sm text-muted">
            {t("admin.users.description")}
          </p>
        </div>
        <form className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
          <input type="hidden" name="filter" value={filter} />
          <div className="relative min-w-0 sm:w-64">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <input
              name="q"
              type="search"
              defaultValue={search}
              placeholder={t("admin.users.searchPlaceholder")}
              className="h-10 w-full rounded-lg border border-line bg-black/30 pl-9 pr-3 text-sm text-ink outline-none transition placeholder:text-zinc-600 focus:border-primary focus:ring-2 focus:ring-primary/25"
            />
          </div>
          <button
            type="submit"
            className={buttonClassName({ variant: "secondary" })}
          >
            {t("admin.users.search")}
          </button>
        </form>
      </div>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
        {filters.map((item) => (
          <a
            key={item}
            href={`/dashboard/admin?filter=${item}${search ? `&q=${encodeURIComponent(search)}` : ""}`}
            className={buttonClassName({
              variant: filter === item ? "primary" : "secondary",
              size: "sm",
              className: "shrink-0"
            })}
          >
            {t(`admin.filters.${item}`)}
          </a>
        ))}
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="min-w-[920px] w-full text-left text-sm">
          <thead className="border-b border-line text-xs uppercase text-muted">
            <tr>
              <th className="py-3 pr-4">{t("admin.users.email")}</th>
              <th className="py-3 pr-4">{t("admin.users.twitch")}</th>
              <th className="py-3 pr-4">{t("admin.users.plan")}</th>
              <th className="py-3 pr-4">{t("admin.users.status")}</th>
              <th className="py-3 pr-4">{t("admin.users.createdAt")}</th>
              <th className="py-3 pr-4">{t("admin.users.lastLogin")}</th>
              <th className="py-3 pr-4">{t("admin.users.streamers")}</th>
              <th className="py-3">{t("admin.users.clips")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.map((user) => (
              <tr key={user.id} className="text-muted">
                <td className="py-3 pr-4 text-ink">
                  {user.email ?? t("admin.unknown")}
                </td>
                <td className="py-3 pr-4">
                  {user.twitchLogin ? `@${user.twitchLogin}` : t("admin.none")}
                </td>
                <td className="py-3 pr-4">{user.plan}</td>
                <td className="py-3 pr-4">
                  <StatusPill status={getUserStatus(user.subscription?.status, user.promoRedemptions.length > 0)} />
                </td>
                <td className="py-3 pr-4">
                  <LocalDate date={user.createdAt} />
                </td>
                <td className="py-3 pr-4">
                  {user.sessions[0]?.updatedAt ? (
                    <LocalDate date={user.sessions[0].updatedAt} variant="dateTime" />
                  ) : (
                    t("admin.none")
                  )}
                </td>
                <td className="py-3 pr-4">{user._count.clipTargets}</td>
                <td className="py-3">{user._count.clips}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function RevenuePanel({
  data,
  t
}: {
  data: Awaited<ReturnType<typeof getAdminDashboardData>>["revenue"];
  t: Awaited<ReturnType<typeof getI18n>>["t"];
}) {
  return (
    <Card className="p-6">
      <CardTitle>{t("admin.sections.revenue")}</CardTitle>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Metric label={t("admin.revenue.activeSubscriptions")} value={data.activeSubscriptions} />
        <Metric label={t("admin.revenue.trialSubscriptions")} value={data.trialSubscriptions} />
        <Metric label={t("admin.revenue.monthlyRevenue")} value={formatCurrency(data.monthlyRevenue)} />
        <Metric label={t("admin.revenue.promoUsers")} value={data.promoUsers} />
        <Metric label={t("admin.revenue.stripeCustomers")} value={data.stripeCustomers} />
      </div>
      <div className="mt-6 rounded-lg border border-line bg-black/20 p-4">
        <p className="text-sm font-semibold text-ink">
          {t("admin.revenue.byPlan")}
        </p>
        <div className="mt-4 grid gap-3">
          {data.revenueByPlan.map((item) => (
            <div
              key={item.plan}
              className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface/70 p-3 text-sm"
            >
              <div>
                <p className="font-semibold text-ink">{item.plan}</p>
                <p className="mt-1 text-muted">
                  {t("admin.revenue.planFormula", {
                    users: item.users,
                    price: item.price.toFixed(2)
                  })}
                </p>
              </div>
              <p className="font-semibold text-ink">
                {formatCurrency(item.mrr)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function PromoCodesPanel({
  promoCodes,
  promoState,
  t
}: {
  promoCodes: Awaited<ReturnType<typeof getAdminDashboardData>>["promoCodes"];
  promoState?: string;
  t: Awaited<ReturnType<typeof getI18n>>["t"];
}) {
  return (
    <Card className="p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
          <Gift className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <CardTitle>{t("admin.sections.promoCodes")}</CardTitle>
          <p className="mt-1 text-sm text-muted">
            {t("admin.promo.description")}
          </p>
        </div>
      </div>

      <form
        action={createAdminPromoCode}
        className="mt-5 grid gap-3 md:grid-cols-[1fr_0.7fr_0.7fr_auto]"
      >
        <input
          name="code"
          placeholder="BETA24"
          className={inputClassName}
          required
        />
        <input
          name="durationHours"
          type="number"
          min={1}
          placeholder={t("admin.promo.duration")}
          className={inputClassName}
          required
        />
        <input
          name="maxUses"
          type="number"
          min={1}
          placeholder={t("admin.promo.maxUses")}
          className={inputClassName}
          required
        />
        <button type="submit" className={buttonClassName({ variant: "secondary" })}>
          {t("admin.promo.create")}
        </button>
      </form>

      {promoState ? (
        <p className="mt-3 rounded-lg border border-line bg-black/20 px-3 py-2 text-sm text-muted">
          {t(`admin.promo.state.${promoState}`)}
        </p>
      ) : null}

      <div className="mt-5 overflow-x-auto">
        <table className="min-w-[640px] w-full text-left text-sm">
          <thead className="border-b border-line text-xs uppercase text-muted">
            <tr>
              <th className="py-3 pr-4">{t("admin.promo.code")}</th>
              <th className="py-3 pr-4">{t("admin.promo.duration")}</th>
              <th className="py-3 pr-4">{t("admin.promo.maxUses")}</th>
              <th className="py-3 pr-4">{t("admin.promo.uses")}</th>
              <th className="py-3">{t("admin.promo.createdAt")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {promoCodes.map((promoCode) => (
              <tr key={promoCode.id} className="text-muted">
                <td className="py-3 pr-4 font-semibold text-ink">
                  {promoCode.code}
                </td>
                <td className="py-3 pr-4">
                  {promoCode.durationHours}h
                </td>
                <td className="py-3 pr-4">{promoCode.maxUses}</td>
                <td className="py-3 pr-4">{promoCode.usedCount}</td>
                <td className="py-3">
                  <LocalDate date={promoCode.createdAt} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function GrowthPanel({
  growth,
  locale,
  t
}: {
  growth: Awaited<ReturnType<typeof getAdminDashboardData>>["growth"];
  locale: "en" | "fr";
  t: Awaited<ReturnType<typeof getI18n>>["t"];
}) {
  return (
    <Card className="p-6">
      <CardTitle>{t("admin.sections.growth")}</CardTitle>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Metric label={t("admin.growth.users7")} value={growth.usersRegisteredLast7Days} />
        <Metric label={t("admin.growth.users30")} value={growth.usersRegisteredLast30Days} />
        <Metric label={t("admin.growth.clips7")} value={growth.clipsCreatedLast7Days} />
        <Metric label={t("admin.growth.clips30")} value={growth.clipsCreatedLast30Days} />
      </div>
      <div className="mt-6 grid gap-4">
        <MiniBarChart
          title={t("admin.growth.usersGrowth")}
          series={growth.usersGrowth}
          locale={locale}
          emptyLabel={t("admin.growth.noData")}
        />
        <MiniBarChart
          title={t("admin.growth.clipsGrowth")}
          series={growth.clipsGrowth}
          locale={locale}
          emptyLabel={t("admin.growth.noData")}
        />
      </div>
    </Card>
  );
}

function SystemPanel({
  system,
  t
}: {
  system: Awaited<ReturnType<typeof getAdminDashboardData>>["system"];
  t: Awaited<ReturnType<typeof getI18n>>["t"];
}) {
  return (
    <Card className="p-6">
      <CardTitle>{t("admin.sections.system")}</CardTitle>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Metric
          label={t("admin.system.workerStatus")}
          value={<StatusPill status={system.workerStatus} />}
        />
        <Metric
          label={t("admin.system.databaseStatus")}
          value={<StatusPill status={system.databaseStatus} />}
        />
        <Metric
          label={t("admin.system.stripeStatus")}
          value={<StatusPill status={system.stripeStatus} />}
        />
      </div>
      <div className="mt-5 grid gap-3">
        <SystemRow
          label={t("admin.system.lastClip")}
          value={
            system.lastClip ? (
              <>
                {system.lastClip.title ?? system.lastClip.broadcasterLogin ?? t("admin.unknown")} ·{" "}
                <LocalDate date={system.lastClip.createdAt} variant="dateTime" />
              </>
            ) : (
              t("admin.none")
            )
          }
        />
        <SystemRow
          label={t("admin.system.lastDownload")}
          value={system.lastDownload ? <LocalDate date={system.lastDownload} variant="dateTime" /> : t("admin.notTracked")}
        />
        <SystemRow
          label={t("admin.system.lastSignup")}
          value={
            system.lastUserSignup ? (
              <>
                {system.lastUserSignup.email ?? system.lastUserSignup.twitchLogin ?? t("admin.unknown")} ·{" "}
                <LocalDate date={system.lastUserSignup.createdAt} variant="dateTime" />
              </>
            ) : (
              t("admin.none")
            )
          }
        />
      </div>
      <p className="mt-4 text-xs leading-5 text-muted">
        {t("admin.system.workerHeuristic")}
      </p>
    </Card>
  );
}

function QuickActionsPanel({
  t
}: {
  t: Awaited<ReturnType<typeof getI18n>>["t"];
}) {
  return (
    <Card className="p-6">
      <CardTitle>{t("admin.sections.quickActions")}</CardTitle>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {quickActions.map((action) => (
          <a
            key={action.href}
            href={action.href}
            target="_blank"
            rel="noreferrer"
            className={buttonClassName({
              variant: "secondary",
              className: "w-full"
            })}
          >
            {t(action.labelKey)}
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        ))}
      </div>
    </Card>
  );
}

function MiniBarChart({
  title,
  series,
  locale,
  emptyLabel
}: {
  title: string;
  series: { day: Date; count: number }[];
  locale: "en" | "fr";
  emptyLabel: string;
}) {
  const max = Math.max(...series.map((item) => item.count), 1);

  return (
    <div className="rounded-lg border border-line bg-black/20 p-4">
      <p className="text-sm font-semibold text-ink">{title}</p>
      <div className="mt-4 flex h-36 items-end gap-1">
        {series.length === 0 ? (
          <p className="text-sm text-muted">{emptyLabel}</p>
        ) : (
          series.map((item) => (
            <div
              key={item.day.toISOString()}
              className="group flex flex-1 items-end"
              title={`${formatDate(item.day, locale)} · ${item.count}`}
            >
              <div
                className="min-h-1 w-full rounded-t bg-primary/80 transition duration-200 group-hover:bg-primary-hover"
                style={{ height: `${Math.max(6, (item.count / max) * 100)}%` }}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Metric({
  label,
  value
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-line bg-black/20 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </p>
      <div className="mt-2 text-xl font-semibold text-ink">{value}</div>
    </div>
  );
}

function SystemRow({
  label,
  value
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between gap-2 rounded-lg border border-line bg-black/20 p-4 text-sm sm:flex-row sm:items-center">
      <p className="font-semibold text-ink">{label}</p>
      <div className="text-muted">{value}</div>
    </div>
  );
}

function getFilter(value?: string): AdminUserFilter {
  return filters.includes(value as AdminUserFilter)
    ? (value as AdminUserFilter)
    : "all";
}

function getUserStatus(
  subscriptionStatus?: SubscriptionStatus | null,
  hasPromoAccess?: boolean
) {
  if (subscriptionStatus === "ACTIVE") {
    return "ACTIVE";
  }

  if (subscriptionStatus === "TRIALING") {
    return "TRIALING";
  }

  if (hasPromoAccess) {
    return "PROMO";
  }

  return "FREE";
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR"
  }).format(value);
}

const inputClassName =
  "h-10 min-w-0 rounded-lg border border-line bg-black/30 px-3 text-sm text-ink outline-none transition placeholder:text-zinc-600 focus:border-primary focus:ring-2 focus:ring-primary/25";
