import { ClipTriggerType, SpeechProvider } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { requestClipForUser } from "@/features/clips/create-clip";

export async function ingestSpeechTranscript({
  userId,
  broadcasterLogin,
  transcript,
  provider,
  confidence,
  occurredAt
}: {
  userId: string;
  broadcasterLogin: string;
  transcript: string;
  provider: SpeechProvider;
  confidence?: number;
  occurredAt?: Date;
}) {
  const normalizedLogin = broadcasterLogin.trim().replace(/^@/, "").toLowerCase();
  const normalizedTranscript = transcript.trim();

  const [target, rule] = await Promise.all([
    prisma.clipTarget.findFirst({
      where: {
        userId,
        twitchLogin: normalizedLogin
      }
    }),
    prisma.clipRule.findFirst({
      where: {
        userId,
        enabled: true
      },
      orderBy: {
        createdAt: "asc"
      }
    })
  ]);

  const matchedKeyword = rule
    ? findMatchedKeyword(normalizedTranscript, rule.keywords)
    : null;

  const event = await prisma.speechTranscriptEvent.create({
    data: {
      userId,
      clipTargetId: target?.id,
      provider,
      broadcasterLogin: normalizedLogin,
      transcript: normalizedTranscript,
      matchedKeyword,
      confidence,
      occurredAt: occurredAt ?? new Date()
    }
  });

  if (!rule || !matchedKeyword || isCoolingDown(rule.lastTriggeredAt, rule.cooldownSeconds)) {
    return {
      event,
      clip: null
    };
  }

  await prisma.clipRule.update({
    where: { id: rule.id },
    data: { lastTriggeredAt: new Date() }
  });

  const clip = await requestClipForUser({
    userId,
    broadcasterLogin: normalizedLogin,
    title: null,
    triggerType: ClipTriggerType.SPEECH_TO_TEXT,
    triggerValue: `${provider}:${matchedKeyword}:${normalizedTranscript.slice(0, 180)}`
  });

  await prisma.speechTranscriptEvent.update({
    where: { id: event.id },
    data: { clipId: clip.id }
  });

  return {
    event,
    clip
  };
}

function findMatchedKeyword(transcript: string, keywords: string[]) {
  const normalizedTranscript = transcript.toLowerCase();
  return (
    keywords.find((keyword) =>
      normalizedTranscript.includes(keyword.trim().toLowerCase())
    ) ?? null
  );
}

function isCoolingDown(lastTriggeredAt: Date | null, cooldownSeconds: number) {
  if (!lastTriggeredAt) {
    return false;
  }

  return Date.now() - lastTriggeredAt.getTime() < cooldownSeconds * 1000;
}
