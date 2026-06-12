import { SpeechProvider } from "@prisma/client";
import { NextResponse } from "next/server";

import { isDemoMode } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { ingestSpeechTranscript } from "@/features/speech/transcript-service";

export async function POST() {
  if (!isDemoMode) {
    return NextResponse.json({ error: "Demo mode disabled" }, { status: 404 });
  }

  const user = await prisma.user.findFirst({
    where: { email: "demo@autoclip.local" },
    select: { id: true }
  });

  if (!user) {
    return NextResponse.json({ error: "Run npm run demo:seed first" }, { status: 400 });
  }

  const result = await ingestSpeechTranscript({
    userId: user.id,
    broadcasterLogin: "streamer_demo",
    transcript: "INCROYABLE action detectee par le mode demo",
    provider: SpeechProvider.INTERNAL,
    confidence: 0.99
  });

  return NextResponse.json({
    eventId: result.event.id,
    matchedKeyword: result.event.matchedKeyword,
    clipId: result.clip?.id ?? null
  });
}
