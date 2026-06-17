import { Plus, Video } from "lucide-react";

import { AppShell } from "@/components/app/app-shell";
import { buttonClassName } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { CreateClipForm } from "@/features/clips/create-clip-form";
import { RecentClips } from "@/features/clips/recent-clips";
import { getClipsPageData } from "@/features/dashboard/dashboard-page-data";
import { getI18n } from "@/i18n/server";

export default async function ClipsPage() {
  const { user, hasClipDownloadScope } = await getClipsPageData();
  const { t } = await getI18n();

  return (
    <AppShell user={user}>
      <PageHeader
        eyebrow={t("nav.clips")}
        title={t("clips.library")}
        description={t("clips.createManualDescription")}
        action={
          <a href="#manual-clip" className={buttonClassName()}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            {t("common.createClip")}
          </a>
        }
      />

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <RecentClips
          clips={user.clips}
          hasDownloadScope={hasClipDownloadScope}
        />
        <CreateClipForm disabled={!user.twitchUserId} />
      </section>

      <section className="mt-8 rounded-lg border border-line bg-black/20 p-5 text-sm leading-6 text-muted">
        <Video className="mb-3 h-5 w-5 text-primary" aria-hidden="true" />
        {t("clips.info")}
      </section>
    </AppShell>
  );
}
