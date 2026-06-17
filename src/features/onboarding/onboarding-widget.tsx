"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ChevronDown, X } from "lucide-react";

import { buttonClassName } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { useTranslation } from "@/i18n/useTranslation";

type OnboardingWidgetProps = {
  hasTwitch: boolean;
  streamerCount: number;
  totalClips: number;
  chatCommandClips: number;
  hasDownloadedClip: boolean;
};

const dismissedKey = "autoclipr_onboarding_dismissed";

export function OnboardingWidget({
  hasTwitch,
  streamerCount,
  totalClips,
  chatCommandClips,
  hasDownloadedClip
}: OnboardingWidgetProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    setIsDismissed(window.localStorage.getItem(dismissedKey) === "true");
  }, []);

  if (isDismissed) {
    return null;
  }

  const items = [
    {
      id: "connect-twitch",
      title: t("onboarding.connectTwitch"),
      completed: hasTwitch
    },
    {
      id: "add-streamer",
      title: t("onboarding.addStreamer"),
      completed: streamerCount > 0
    },
    {
      id: "create-first-clip",
      title: t("onboarding.createFirstClip"),
      completed: totalClips > 0
    },
    {
      id: "test-chat-command",
      title: t("onboarding.testChatCommand"),
      completed: chatCommandClips > 0
    },
    {
      id: "download-clip",
      title: t("onboarding.downloadClip"),
      completed: hasDownloadedClip
    }
  ];
  const completedCount = items.filter((item) => item.completed).length;
  const isComplete = completedCount === items.length;
  const progress = Math.round((completedCount / items.length) * 100);

  function dismiss() {
    window.localStorage.setItem(dismissedKey, "true");
    setIsDismissed(true);
  }

  return (
    <aside className="fixed bottom-4 left-4 right-4 z-40 sm:bottom-6 sm:left-auto sm:right-6 sm:w-[360px]">
      <div className="overflow-hidden rounded-lg border border-line bg-[#0D0D10]/95 shadow-2xl shadow-black/40 backdrop-blur-xl transition duration-200 hover:border-primary/40">
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-ink">
                {isComplete
                  ? `✅ ${t("onboarding.setupCompleted")}`
                  : t("onboarding.title")}
              </p>
              <p className="mt-1 text-xs text-muted">
                {isComplete
                  ? t("onboarding.readyMessage")
                  : t("onboarding.progress", {
                      completed: completedCount,
                      total: items.length
                    })}
              </p>
            </div>
            <button
              type="button"
              onClick={dismiss}
              className="inline-flex h-8 shrink-0 items-center justify-center gap-1 rounded-lg border border-line bg-black/20 px-2 text-xs font-semibold text-muted transition duration-200 hover:bg-surface-hover hover:text-ink"
              aria-label={t("common.close")}
              title={t("common.close")}
            >
              <X className="h-4 w-4" aria-hidden="true" />
              {t("common.close")}
            </button>
          </div>

          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded((value) => !value)}
            className={buttonClassName({
              variant: "secondary",
              size: "sm",
              className: "mt-4 w-full"
            })}
            aria-expanded={isExpanded}
          >
            {isExpanded ? t("common.hide") : t("common.show")}
            <ChevronDown
              className={cn(
                "h-4 w-4 transition duration-200",
                isExpanded ? "rotate-180" : null
              )}
              aria-hidden="true"
            />
          </button>
        </div>

        <div
          className={cn(
            "grid transition-all duration-200 ease-out",
            isExpanded
              ? "grid-rows-[1fr] border-t border-line opacity-100"
              : "grid-rows-[0fr] opacity-0"
          )}
        >
          <div className="overflow-hidden">
            <div className="grid gap-2 p-4 pt-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-lg bg-black/20 px-3 py-2.5 transition duration-200 hover:bg-surface-hover"
                >
                  {item.completed ? (
                    <CheckCircle2
                      className="h-4 w-4 shrink-0 text-success"
                      aria-hidden="true"
                    />
                  ) : (
                    <span className="h-4 w-4 shrink-0 rounded-full border border-zinc-600 bg-zinc-800" />
                  )}
                  <span
                    className={cn(
                      "text-sm",
                      item.completed ? "text-ink" : "text-muted"
                    )}
                  >
                    {item.title}
                  </span>
                </div>
              ))}
              {isComplete ? (
                <div className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm font-medium text-green-300">
                  {t("onboarding.readyMessage")}
                </div>
              ) : (
                <p className="text-xs leading-5 text-muted">
                  {t("onboarding.downloadClipDescription")}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
