import { ShieldCheck } from "lucide-react";

import { AppShell } from "@/components/app/app-shell";
import { Card, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { getDashboardPageData } from "@/features/dashboard/dashboard-page-data";

export default async function SettingsPage() {
  const { user } = await getDashboardPageData();

  return (
    <AppShell user={user}>
      <PageHeader
        eyebrow="Settings"
        title="Account settings"
        description="Review the Twitch account connected to AutoClipR and your workspace identity."
      />

      <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-success/30 bg-success/10 text-success">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <CardTitle>Twitch account</CardTitle>
              <p className="mt-1 text-sm text-muted">
                OAuth profile used for clips and chat.
              </p>
            </div>
          </div>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <ProfileItem
              label="Name"
              value={user.twitchName ?? user.name ?? "Not provided"}
            />
            <ProfileItem
              label="Login"
              value={user.twitchLogin ?? "Not provided"}
            />
            <ProfileItem
              label="Twitch user ID"
              value={user.twitchUserId ?? "Not provided"}
            />
            <ProfileItem label="AutoClipR role" value={user.role} />
          </dl>
        </Card>

        <Card className="p-6">
          <CardTitle>Workspace</CardTitle>
          <div className="mt-5 grid gap-4">
            <ProfileItem label="Plan" value={user.plan} />
            <ProfileItem
              label="Created"
              value={user.createdAt.toLocaleDateString("fr-FR")}
            />
            <ProfileItem label="Email" value={user.email ?? "Twitch account"} />
          </div>
        </Card>
      </section>
    </AppShell>
  );
}

function ProfileItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-black/20 p-4">
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </dt>
      <dd className="mt-2 break-words text-sm font-medium text-ink">{value}</dd>
    </div>
  );
}
