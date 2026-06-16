import { Bot } from "lucide-react";

import { AppShell } from "@/components/app/app-shell";
import { Card, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { getDashboardPageData } from "@/features/dashboard/dashboard-page-data";
import { RuleSettingsForm } from "@/features/rules/rule-settings-form";

export default async function RulesPage() {
  const { user } = await getDashboardPageData();
  const primaryRule = user.clipRules[0];

  return (
    <AppShell user={user}>
      <PageHeader
        eyebrow="Bot Rules"
        title="Control your chat command"
        description="Choose the command, cooldown, permissions, clip naming and AI detection keywords used by AutoClipR."
      />

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        {primaryRule ? (
          <RuleSettingsForm rule={primaryRule} />
        ) : (
          <Card className="p-6">
            <CardTitle>Bot Rules</CardTitle>
            <p className="mt-3 text-sm text-muted">
              Reconnect your Twitch account to create the default Bot Rule.
            </p>
          </Card>
        )}

        <Card className="p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
            <Bot className="h-5 w-5" aria-hidden="true" />
          </div>
          <CardTitle className="mt-5">Recommended setup</CardTitle>
          <div className="mt-5 grid gap-3 text-sm text-muted">
            <p>
              Keep the command short, memorable and prefixed with an exclamation
              mark.
            </p>
            <p>
              Use a cooldown to prevent duplicate clips during intense chat
              moments.
            </p>
            <p>
              Restrict usage to moderators if you want precise control during
              live events.
            </p>
          </div>
        </Card>
      </section>
    </AppShell>
  );
}
