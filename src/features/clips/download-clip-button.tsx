"use client";

import { Download } from "lucide-react";
import { useEffect, useState } from "react";

import { buttonClassName } from "@/components/ui/button";
import { cn } from "@/lib/cn";

export function DownloadClipButton({
  clipId,
  hasDownloadScope
}: {
  clipId: string;
  hasDownloadScope: boolean;
}) {
  const [message, setMessage] = useState<string | null>(null);

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
          Download
        </button>
        <p className="text-xs text-violet-200">
          Reconnect Twitch to enable downloads
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
        onClick={() => setMessage("Preparing download...")}
      >
        <Download className="h-4 w-4" aria-hidden="true" />
        Download
      </a>
      {message ? (
        <p className="text-xs text-muted" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
