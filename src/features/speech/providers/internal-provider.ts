import { SpeechProvider } from "@prisma/client";

import type { SpeechToTextProvider } from "@/features/speech/providers/types";

export const internalSpeechProvider: SpeechToTextProvider = {
  name: SpeechProvider.INTERNAL,
  async transcribeAudio() {
    throw new Error("Internal provider accepts already-transcribed segments only.");
  }
};
