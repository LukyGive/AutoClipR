import { ClipStatus, ClipTriggerType, Plan, PrismaClient, SpeechProvider } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "demo@autoclip.local" },
    update: {
      name: "AutoClip Demo",
      plan: Plan.PRO,
      twitchUserId: "demo-user-001",
      twitchLogin: "autoclip_demo",
      twitchName: "AutoClip Demo"
    },
    create: {
      email: "demo@autoclip.local",
      name: "AutoClip Demo",
      plan: Plan.PRO,
      twitchUserId: "demo-user-001",
      twitchLogin: "autoclip_demo",
      twitchName: "AutoClip Demo"
    }
  });

  const target = await prisma.clipTarget.upsert({
    where: {
      userId_twitchUserId: {
        userId: user.id,
        twitchUserId: "demo-target-001"
      }
    },
    update: {
      twitchLogin: "streamer_demo",
      twitchName: "Streamer Demo",
      externalTriggerToken: "demo-external-trigger-token",
      isDefault: true
    },
    create: {
      userId: user.id,
      twitchUserId: "demo-target-001",
      twitchLogin: "streamer_demo",
      twitchName: "Streamer Demo",
      externalTriggerToken: "demo-external-trigger-token",
      isDefault: true
    }
  });

  await prisma.clipRule.upsert({
    where: { id: `default-${user.id}` },
    update: {
      enabled: true,
      command: "!clip",
      clipTitleTemplate: "Best of live",
      appendCounter: true,
      nextClipNumber: 4,
      clipDurationSeconds: 30,
      cooldownSeconds: 30,
      permission: "EVERYONE",
      keywords: ["incroyable", "goal", "wow"],
      speechInstruction: "clip quand je dis INCROYABLE ou GOAL",
      notifyOnCreate: true
    },
    create: {
      id: `default-${user.id}`,
      userId: user.id,
      enabled: true,
      command: "!clip",
      clipTitleTemplate: "Best of live",
      appendCounter: true,
      nextClipNumber: 4,
      clipDurationSeconds: 30,
      cooldownSeconds: 30,
      permission: "EVERYONE",
      keywords: ["incroyable", "goal", "wow"],
      speechInstruction: "clip quand je dis INCROYABLE ou GOAL",
      notifyOnCreate: true
    }
  });

  await prisma.subscription.upsert({
    where: { userId: user.id },
    update: {
      status: "ACTIVE",
      stripeCustomerId: "cus_demo",
      stripeSubscriptionId: "sub_demo",
      stripePriceId: "price_demo_pro",
      currentPeriodEnd: addDays(new Date(), 20)
    },
    create: {
      userId: user.id,
      status: "ACTIVE",
      stripeCustomerId: "cus_demo",
      stripeSubscriptionId: "sub_demo",
      stripePriceId: "price_demo_pro",
      currentPeriodEnd: addDays(new Date(), 20)
    }
  });

  await prisma.clip.deleteMany({
    where: {
      userId: user.id,
      triggerValue: {
        startsWith: "demo:"
      }
    }
  });

  await prisma.clip.createMany({
    data: [
      {
        userId: user.id,
        clipTargetId: target.id,
        twitchClipId: "demo-ready-001",
        broadcasterId: target.twitchUserId,
        broadcasterLogin: target.twitchLogin,
        broadcasterName: target.twitchName,
        title: "INCROYABLE comeback",
        url: "https://clips.twitch.tv/demo-ready-001",
        status: ClipStatus.READY,
        triggerType: ClipTriggerType.SPEECH_TO_TEXT,
        triggerValue: "demo:speech:incroyable"
      },
      {
        userId: user.id,
        clipTargetId: target.id,
        twitchClipId: "demo-ready-002",
        broadcasterId: target.twitchUserId,
        broadcasterLogin: target.twitchLogin,
        broadcasterName: target.twitchName,
        title: "!clip by viewer42",
        url: "https://clips.twitch.tv/demo-ready-002",
        status: ClipStatus.READY,
        triggerType: ClipTriggerType.CHAT_COMMAND,
        triggerValue: "demo:chat:!clip"
      },
      {
        userId: user.id,
        clipTargetId: target.id,
        broadcasterId: target.twitchUserId,
        broadcasterLogin: target.twitchLogin,
        broadcasterName: target.twitchName,
        title: "Demo failed clip",
        status: ClipStatus.FAILED,
        triggerType: ClipTriggerType.MANUAL,
        triggerValue: "demo:manual:failed",
        errorCode: "DEMO_TWITCH_OFFLINE",
        errorMessage: "Exemple d'erreur quand la chaîne n'est pas live."
      }
    ]
  });

  await prisma.speechTranscriptEvent.deleteMany({
    where: {
      userId: user.id,
      provider: SpeechProvider.INTERNAL
    }
  });

  await prisma.speechTranscriptEvent.createMany({
    data: [
      {
        userId: user.id,
        clipTargetId: target.id,
        provider: SpeechProvider.INTERNAL,
        broadcasterLogin: target.twitchLogin,
        transcript: "C'était absolument incroyable",
        matchedKeyword: "incroyable",
        confidence: 0.94
      },
      {
        userId: user.id,
        clipTargetId: target.id,
        provider: SpeechProvider.INTERNAL,
        broadcasterLogin: target.twitchLogin,
        transcript: "Goal magnifique sur la dernière action",
        matchedKeyword: "goal",
        confidence: 0.91
      }
    ]
  });

  console.log(`Seeded demo user: ${user.email}`);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
