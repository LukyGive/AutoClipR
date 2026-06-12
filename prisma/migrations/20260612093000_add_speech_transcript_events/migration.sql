-- CreateEnum
CREATE TYPE "SpeechProvider" AS ENUM ('INTERNAL', 'WHISPER', 'DEEPGRAM');

-- CreateTable
CREATE TABLE "SpeechTranscriptEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clipTargetId" TEXT,
    "clipId" TEXT,
    "provider" "SpeechProvider" NOT NULL,
    "broadcasterLogin" TEXT NOT NULL,
    "transcript" TEXT NOT NULL,
    "matchedKeyword" TEXT,
    "confidence" DOUBLE PRECISION,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpeechTranscriptEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SpeechTranscriptEvent_userId_createdAt_idx" ON "SpeechTranscriptEvent"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "SpeechTranscriptEvent_clipTargetId_createdAt_idx" ON "SpeechTranscriptEvent"("clipTargetId", "createdAt");

-- CreateIndex
CREATE INDEX "SpeechTranscriptEvent_provider_createdAt_idx" ON "SpeechTranscriptEvent"("provider", "createdAt");

-- CreateIndex
CREATE INDEX "SpeechTranscriptEvent_matchedKeyword_idx" ON "SpeechTranscriptEvent"("matchedKeyword");

-- AddForeignKey
ALTER TABLE "SpeechTranscriptEvent" ADD CONSTRAINT "SpeechTranscriptEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpeechTranscriptEvent" ADD CONSTRAINT "SpeechTranscriptEvent_clipTargetId_fkey" FOREIGN KEY ("clipTargetId") REFERENCES "ClipTarget"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpeechTranscriptEvent" ADD CONSTRAINT "SpeechTranscriptEvent_clipId_fkey" FOREIGN KEY ("clipId") REFERENCES "Clip"("id") ON DELETE SET NULL ON UPDATE CASCADE;
