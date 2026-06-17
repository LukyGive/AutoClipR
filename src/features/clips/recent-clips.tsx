import { ExternalLink, VideoOff } from "lucide-react";
import type { Clip } from "@prisma/client";

import { buttonClassName } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusPill } from "@/components/ui/status-pill";
import { DownloadClipButton } from "@/features/clips/download-clip-button";
import { getI18n } from "@/i18n/server";

export async function RecentClips({
  clips,
  hasDownloadScope
}: {
  clips: Pick<
    Clip,
    | "id"
    | "title"
    | "twitchClipId"
    | "url"
    | "editUrl"
    | "embedUrl"
    | "broadcasterLogin"
    | "broadcasterName"
    | "status"
    | "errorCode"
    | "errorMessage"
    | "createdAt"
  >[];
  hasDownloadScope: boolean;
}) {
  const { locale, t } = await getI18n();

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <CardTitle>{t("clips.recent")}</CardTitle>
          <p className="mt-1 text-sm text-muted">
            {t("clips.latestRequests")}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        {clips.length === 0 ? (
          <EmptyState
            icon={VideoOff}
            title={t("clips.noClipsTitle")}
            description={t("clips.noClipsDescription")}
          />
        ) : (
          clips.map((clip) => (
            <ClipCard
              key={clip.id}
              clip={clip}
              hasDownloadScope={hasDownloadScope}
              locale={locale}
              t={t}
            />
          ))
        )}
      </div>
    </Card>
  );
}

function ClipCard({
  clip,
  hasDownloadScope,
  locale,
  t
}: {
  clip: Pick<
    Clip,
    | "id"
    | "title"
    | "twitchClipId"
    | "url"
    | "editUrl"
    | "broadcasterLogin"
    | "broadcasterName"
    | "status"
    | "errorCode"
    | "errorMessage"
    | "createdAt"
  >;
  hasDownloadScope: boolean;
  locale: "en" | "fr";
  t: Awaited<ReturnType<typeof getI18n>>["t"];
}) {
  const canDownload = clip.status === "READY" && Boolean(clip.twitchClipId);

  return (
    <article className="rounded-lg border border-line bg-black/20 p-4 transition duration-200 hover:scale-[1.01] hover:bg-surface-hover">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-ink">
            {clip.title ?? t("common.untitledClip")}
          </h3>
          <p className="mt-1 text-xs text-muted">
            {clip.broadcasterName ??
              clip.broadcasterLogin ??
              t("common.unknownChannel")}{" "}
            - {clip.createdAt.toLocaleString(locale === "fr" ? "fr-FR" : "en-US")}
          </p>
        </div>
        <StatusPill status={clip.status} />
      </div>

      {clip.errorMessage ? (
        <p className="mt-3 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-red-200">
          {clip.errorCode}: {clip.errorMessage}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-start gap-3">
        {clip.url ? (
          <a
            href={clip.url}
            target="_blank"
            rel="noreferrer"
            className={buttonClassName({ variant: "secondary", size: "sm" })}
          >
            {t("common.open")}
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        ) : null}

        {clip.editUrl ? (
          <a
            href={clip.editUrl}
            target="_blank"
            rel="noreferrer"
            className={buttonClassName({ variant: "ghost", size: "sm" })}
          >
            {t("common.edit")}
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        ) : null}

        {canDownload ? (
          <DownloadClipButton
            clipId={clip.id}
            hasDownloadScope={hasDownloadScope}
          />
        ) : null}
      </div>
    </article>
  );
}
