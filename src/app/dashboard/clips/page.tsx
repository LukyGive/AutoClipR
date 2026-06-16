import { Plus, Video } from "lucide-react";

import { AppShell } from "@/components/app/app-shell";
import { buttonClassName } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { CreateClipForm } from "@/features/clips/create-clip-form";
import { RecentClips } from "@/features/clips/recent-clips";
import { getDashboardPageData } from "@/features/dashboard/dashboard-page-data";

export default async function ClipsPage() {
  const { user, hasClipDownloadScope } = await getDashboardPageData();

  return (
    <AppShell user={user}>
      <PageHeader
        eyebrow="Clips"
        title="Clip library"
        description="Review existing Twitch clips and create a manual clip when something happens outside chat automation."
        action={
          <a href="#manual-clip" className={buttonClassName()}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Create clip
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
        AutoClipR stores Twitch clip status, error messages and edit links so
        you can understand what happened after every trigger.
      </section>
    </AppShell>
  );
}
