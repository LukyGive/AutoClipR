import { ClipRulePermission, ClipTriggerType } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { requestClipForUser } from "@/features/clips/create-clip";
import type { TwitchChatMessage } from "@/features/chat/irc-parser";

export async function handlePotentialClipCommand({
  userId,
  targetLogin,
  message
}: {
  userId: string;
  targetLogin: string;
  message: TwitchChatMessage;
}) {
  const rule = await prisma.clipRule.findFirst({
    where: {
      userId,
      enabled: true
    },
    orderBy: {
      createdAt: "asc"
    }
  });

  if (!rule) {
    return;
  }

  const trigger = getTrigger(message.message, rule.command, rule.keywords);

  if (!trigger) {
    return;
  }

  if (!isAllowed(message, rule.permission)) {
    return;
  }

  if (isCoolingDown(rule.lastTriggeredAt, rule.cooldownSeconds)) {
    return;
  }

  await prisma.clipRule.update({
    where: { id: rule.id },
    data: { lastTriggeredAt: new Date() }
  });

  await requestClipForUser({
    userId,
    broadcasterLogin: targetLogin,
    title: null,
    triggerType: trigger.type,
    triggerValue: `${message.channel}:${message.username}:${message.message}`
  });
}

function getTrigger(message: string, command: string, keywords: string[]) {
  const [firstWord] = message.trim().split(/\s+/);

  if (firstWord?.toLowerCase() === command.toLowerCase()) {
    return {
      type: ClipTriggerType.CHAT_COMMAND,
      label: command
    };
  }

  const normalizedMessage = message.toLowerCase();
  const matchedKeyword = keywords.find((keyword) =>
    normalizedMessage.includes(keyword.toLowerCase())
  );

  if (matchedKeyword) {
    return {
      type: ClipTriggerType.KEYWORD,
      label: matchedKeyword
    };
  }

  return null;
}

function isAllowed(message: { username: string; channel: string; badges: Record<string, string> }, permission: ClipRulePermission) {
  if (permission === ClipRulePermission.EVERYONE) {
    return true;
  }

  if (message.username === message.channel || message.badges.broadcaster) {
    return true;
  }

  if (permission === ClipRulePermission.STREAMER_ONLY) {
    return false;
  }

  if (permission === ClipRulePermission.MODERATORS) {
    return Boolean(message.badges.moderator);
  }

  if (permission === ClipRulePermission.SUBSCRIBERS) {
    return Boolean(message.badges.subscriber);
  }

  return false;
}

function isCoolingDown(lastTriggeredAt: Date | null, cooldownSeconds: number) {
  if (!lastTriggeredAt) {
    return false;
  }

  const elapsedMs = Date.now() - lastTriggeredAt.getTime();
  return elapsedMs < cooldownSeconds * 1000;
}
