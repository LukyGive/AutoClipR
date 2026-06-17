"use client";

import { Download } from "lucide-react";
import { useEffect, useState } from "react";

import { buttonClassName } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { useTranslation } from "@/i18n/useTranslation";

export function DownloadClipButton({
  clipId,
  hasDownloadScope
}: {
  clipId: string;
  hasDownloadScope: boolean;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (!message) {
      return;
    }

    const timeout = window.setTimeout(() => setMessage(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [message]);

  if (!hasDownloadScope) {
    return (
      <div className="flex flex-col gap-1">
        <button
          type="button"
          disabled
          className={buttonClassName({
            variant: "secondary",
            size: "sm",
            className: "w-fit"
          })}
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          {t("common.download")}
        </button>
        <p className="text-xs text-violet-200">
          {t("download.reconnect")}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <a
        href={`/api/clips/${clipId}/download`}
        className={cn(
          buttonClassName({
            variant: "secondary",
            size: "sm",
            className: "w-fit"
          }),
          "hover:text-white"
        )}
        onClick={() => setMessage(t("download.preparing"))}
      >
        <Download className="h-4 w-4" aria-hidden="true" />
        {t("common.download")}
      </a>
      {message ? (
        <p className="text-xs text-muted" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
