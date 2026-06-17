import Link from "next/link";
import {
  ArrowRight,
  Brain,
  Check,
  Clapperboard,
  Command,
  LayoutDashboard,
  Sparkles,
  Users
} from "lucide-react";

import { auth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PricingCard } from "@/components/ui/pricing-card";

const features = [
  {
    icon: Command,
    title: "Chat commands",
    description:
      "Let moderators or viewers create clips with a clean command like !clip."
  },
  {
    icon: Brain,
    title: "AI detection",
    description:
      "Prepare speech-to-text triggers for moments like GOAL, insane or clutch."
  },
  {
    icon: LayoutDashboard,
    title: "Streamer dashboard",
    description:
      "Track clips, usage, targets and automation health from one place."
  },
  {
    icon: Users,
    title: "Multi-channel support",
    description:
      "Choose the streamers you want to monitor and trigger clips for."
  }
];

const faqs = [
  {
    question: "Does AutoClipR create real Twitch clips?",
    answer:
      "Yes. In production mode it uses the official Twitch Helix Create Clip API."
  },
  {
    question: "Can I clip another streamer?",
    answer:
      "Yes, if Twitch allows your connected account to create clips for that channel."
  },
  {
    question: "Does the chat worker need to stay online?",
    answer:
      "Yes. The Railway worker keeps listening to Twitch chat for commands."
  }
];

export default async function HomePage() {
  const session = await auth();
  const primaryHref = session ? "/dashboard" : "/login";

  return (
    <main className="min-h-screen bg-app-bg text-ink">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-5 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/40 bg-primary/15 text-primary shadow-glow">
            <Clapperboard className="h-5 w-5" aria-hidden="true" />
          </div>
          <span className="text-sm font-semibold text-ink">AutoClipR</span>
        </Link>

        <div className="hidden items-center gap-6 text-sm font-medium text-muted md:flex">
          <a href="#features" className="transition hover:text-ink">
            Features
          </a>
          <a href="#pricing" className="transition hover:text-ink">
            Pricing
          </a>
          <a href="#faq" className="transition hover:text-ink">
            Docs
          </a>
        </div>

        <Link
          href={primaryHref}
          className="inline-flex h-10 items-center justify-center rounded-lg border border-line bg-surface px-4 text-sm font-semibold text-ink transition duration-200 hover:bg-surface-hover"
        >
          {session ? "Dashboard" : "Login"}
        </Link>
      </nav>

      <section className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:pb-24 lg:pt-16">
        <div>
          <Badge>
            <Sparkles className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
            Twitch automation for serious streamers
          </Badge>
          <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-tight tracking-normal text-ink md:text-7xl">
            Create Twitch clips automatically.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-muted md:text-lg">
            AutoClipR listens to your stream chat and turns your best moments
            into Twitch clips instantly. Automatically create Twitch clips from
            chat commands, API triggers and soon AI voice detection.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={primaryHref} size="lg">
              Connect with Twitch
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </ButtonLink>
            <ButtonLink href="/login" variant="secondary" size="lg">
              View demo
            </ButtonLink>
          </div>
          <div className="mt-8 grid gap-3 text-sm text-zinc-300 sm:grid-cols-3">
            {[
              "Official Twitch API",
              "Chat worker ready",
              "Built for scale"
            ].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-success" aria-hidden="true" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <DashboardPreview />
      </section>

      <section className="border-y border-line bg-black/20">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-12 sm:px-6 md:grid-cols-3">
          {[
            [
              "01",
              "Connect your Twitch",
              "Secure OAuth connects your creator account."
            ],
            [
              "02",
              "Choose your trigger",
              "Use chat commands, keywords or AI detection rules."
            ],
            [
              "03",
              "AutoClipR creates the clip",
              "The clip is created, tracked and saved in your dashboard."
            ]
          ].map(([step, title, body]) => (
            <Card key={step} className="p-5">
              <p className="text-xs font-semibold text-primary">{step}</p>
              <h2 className="mt-4 text-base font-semibold text-ink">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="max-w-2xl">
          <Badge>Features</Badge>
          <h2 className="mt-4 text-3xl font-semibold tracking-normal text-ink md:text-4xl">
            Built around real streamer workflows.
          </h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-base font-semibold text-ink">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="grid items-center gap-8 rounded-lg border border-line bg-black/20 p-6 md:grid-cols-[0.8fr_1.2fr] md:p-8">
          <div>
            <Badge>Dashboard preview</Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-normal text-ink">
              Everything a streamer needs, nothing noisy.
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Monitor clips, streamers, bot status and usage from a quiet
              command center.
            </p>
          </div>
          <DashboardPreview compact />
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="max-w-2xl">
          <Badge>Pricing</Badge>
          <h2 className="mt-4 text-3xl font-semibold tracking-normal text-ink">
            Start free. Upgrade when clips become part of your workflow.
          </h2>
        </div>
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          <PricingCard
            name="Free"
            price="0 €"
            description="For testing the workflow."
            features={[
              "25 clips per month",
              "Manual clips",
              "One streamer target"
            ]}
          />
          <PricingCard
            name="Pro"
            price="9.99 €/month"
            description="For active streamers."
            features={[
              "1,000 clips per month",
              "Chat commands",
              "AI trigger preparation"
            ]}
            highlighted
            badge="Popular"
          />
          <PricingCard
            name="Business"
            price="24.99 €/month"
            description="For teams and agencies."
            features={[
              "10,000 clips per month",
              "Multi-channel support",
              "Priority capacity"
            ]}
          />
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-4xl px-4 pb-20 sm:px-6">
        <Badge>FAQ</Badge>
        <div className="mt-6 grid gap-3">
          {faqs.map((faq) => (
            <Card key={faq.question} className="p-5">
              <h3 className="text-sm font-semibold text-ink">{faq.question}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{faq.answer}</p>
            </Card>
          ))}
        </div>
      </section>

      <footer className="border-t border-line px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-sm text-muted md:flex-row">
          <p>AutoClipR. Built for Twitch creators.</p>
          <p>autoclipr.app</p>
        </div>
      </footer>
    </main>
  );
}

function DashboardPreview({ compact = false }: { compact?: boolean }) {
  return (
    <div className="rounded-lg border border-line bg-[#0D0D10] p-4 shadow-glow">
      <div className="flex items-center justify-between border-b border-line pb-4">
        <div>
          <p className="text-xs text-muted">Dashboard</p>
          <p className="mt-1 text-sm font-semibold text-ink">Welcome back</p>
        </div>
        <div className="rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-semibold text-green-300">
          Bot online
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {[
          ["Total clips", "248"],
          ["Active streamers", "4"],
          ["Success rate", "98%"]
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-lg border border-line bg-surface p-4"
          >
            <p className="text-xs text-muted">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 grid gap-3">
        {[
          ["!clip detected", "@jezu_lol", "READY"],
          ["Manual clip", "@zerator", "PROCESSING"],
          ["AI keyword GOAL", "@streamer", "READY"]
        ]
          .slice(0, compact ? 2 : 3)
          .map(([title, channel, status]) => (
            <div
              key={title}
              className="flex items-center justify-between rounded-lg border border-line bg-black/20 p-3"
            >
              <div>
                <p className="text-sm font-medium text-ink">{title}</p>
                <p className="mt-1 text-xs text-muted">{channel}</p>
              </div>
              <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-violet-200">
                {status}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}
