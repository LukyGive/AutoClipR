import { ClipStatus, ClipTriggerType } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getCurrentBillingPeriodStart } from "@/features/billing/plans";

export async function getDashboardAnalytics(userId: string) {
  const periodStart = getCurrentBillingPeriodStart();
  const [
    readyClips,
    failedClips,
    manualClips,
    chatCommandClips,
    keywordClips,
    speechClips,
    matchedSpeechEvents
  ] = await Promise.all([
    prisma.clip.count({
      where: { userId, status: ClipStatus.READY, createdAt: { gte: periodStart } }
    }),
    prisma.clip.count({
      where: { userId, status: ClipStatus.FAILED, createdAt: { gte: periodStart } }
    }),
    prisma.clip.count({
      where: { userId, triggerType: ClipTriggerType.MANUAL, createdAt: { gte: periodStart } }
    }),
    prisma.clip.count({
      where: { userId, triggerType: ClipTriggerType.CHAT_COMMAND, createdAt: { gte: periodStart } }
    }),
    prisma.clip.count({
      where: { userId, triggerType: ClipTriggerType.KEYWORD, createdAt: { gte: periodStart } }
    }),
    prisma.clip.count({
      where: { userId, triggerType: ClipTriggerType.SPEECH_TO_TEXT, createdAt: { gte: periodStart } }
    }),
    prisma.speechTranscriptEvent.count({
      where: {
        userId,
        matchedKeyword: { not: null },
        createdAt: { gte: periodStart }
      }
    })
  ]);

  return {
    periodStart,
    readyClips,
    failedClips,
    byTrigger: {
      manual: manualClips,
      chatCommand: chatCommandClips,
      keyword: keywordClips,
      speechToText: speechClips
    },
    matchedSpeechEvents
  };
}
