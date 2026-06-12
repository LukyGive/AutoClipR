import { SpeechProvider } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { env } from "@/lib/env";
import { ingestSpeechTranscript } from "@/features/speech/transcript-service";

const payloadSchema = z.object({
  userId: z.string().min(1),
  broadcasterLogin: z.string().min(1).max(25),
  transcript: z.string().min(1).max(4000),
  provider: z.nativeEnum(SpeechProvider).default(SpeechProvider.INTERNAL),
  confidence: z.number().min(0).max(1).optional(),
  occurredAt: z.string().datetime().optional()
});

export async function POST(request: Request) {
  const configuredKey = env.INTERNAL_API_KEY;
  const providedKey = request.headers.get("x-autoclip-internal-key");

  if (!configuredKey || providedKey !== configuredKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = payloadSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const payload = parsed.data;
  const result = await ingestSpeechTranscript({
    userId: payload.userId,
    broadcasterLogin: payload.broadcasterLogin,
    transcript: payload.transcript,
    provider: payload.provider,
    confidence: payload.confidence,
    occurredAt: payload.occurredAt ? new Date(payload.occurredAt) : undefined
  });

  return NextResponse.json({
    eventId: result.event.id,
    matchedKeyword: result.event.matchedKeyword,
    clipId: result.clip?.id ?? null,
    clipStatus: result.clip?.status ?? null
  });
}
