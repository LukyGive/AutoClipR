import { ArrowRight, CheckCircle2, Circle } from "lucide-react";

import { Card, CardTitle } from "@/components/ui/card";
import { buttonClassName } from "@/components/ui/button";
import { getI18n } from "@/i18n/server";

type OnboardingChecklistProps = {
  hasTwitch: boolean;
  streamerCount: number;
  totalClips: number;
  chatCommandClips: number;
  apiTriggerClips: number;
};

export async function OnboardingChecklist({
  hasTwitch,
  streamerCount,
  totalClips,
  chatCommandClips,
  apiTriggerClips
}: OnboardingChecklistProps) {
  const { t } = await getI18n();
  const items = [
    {
      id: "connect-twitch",
      title: t("onboarding.connectTwitch"),
      description: t("onboarding.connectTwitchDescription"),
      completed: hasTwitch,
      href: "/login",
      cta: t("login.connectWithTwitch")
    },
    {
      id: "add-streamer",
      title: t("onboarding.addStreamer"),
      description: t("onboarding.addStreamerDescription"),
      completed: streamerCount > 0,
      href: "/dashboard/streamers",
      cta: t("streamers.addStreamer")
    },
    {
      id: "create-first-clip",
      title: t("onboarding.createFirstClip"),
      description: t("onboarding.createFirstClipDescription"),
      completed: totalClips > 0,
      href: "/dashboard/clips#manual-clip",
      cta: t("common.createClip")
    },
    {
      id: "test-chat-command",
      title: t("onboarding.testChatCommand"),
      description: t("onboarding.testChatCommandDescription"),
      completed: chatCommandClips > 0,
      href: "/dashboard/rules",
      cta: t("onboarding.configureCommand")
    },
    {
      id: "test-api-trigger",
      title: t("onboarding.testApiTrigger"),
      description: t("onboarding.testApiTriggerDescription"),
      completed: apiTriggerClips > 0,
      href: "/dashboard/streamers",
      cta: t("onboarding.openApiTrigger")
    }
  ];
  const completedCount = items.filter((item) => item.completed).length;
  const isComplete = completedCount === items.length;

  return (
    <Card className="p-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <CardTitle>{t("onboarding.title")}</CardTitle>
          <p className="mt-1 text-sm leading-6 text-muted">
            {isComplete
              ? t("onboarding.completeMessage")
              : t("onboarding.description")}
          </p>
        </div>
        <span className="w-fit rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-violet-200">
          {t("onboarding.progress", {
            completed: completedCount,
            total: items.length
          })}
        </span>
      </div>

      <div className="mt-5 grid gap-3">
        {items.map((item) => {
          const Icon = item.completed ? CheckCircle2 : Circle;

          return (
            <div
              key={item.id}
              className="flex flex-col gap-3 rounded-lg border border-line bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex gap-3">
                <Icon
                  className={
                    item.completed
                      ? "mt-0.5 h-5 w-5 shrink-0 text-success"
                      : "mt-0.5 h-5 w-5 shrink-0 text-muted"
                  }
                  aria-hidden="true"
                />
                <div>
                  <p className="text-sm font-semibold text-ink">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    {item.description}
                  </p>
                </div>
              </div>
              {item.completed ? (
                <span className="w-fit rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-xs font-semibold text-green-300">
                  {t("onboarding.completed")}
                </span>
              ) : (
                <a
                  href={item.href}
                  className={buttonClassName({
                    variant: "secondary",
                    size: "sm",
                    className: "w-fit shrink-0"
                  })}
                >
                  {item.cta}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
