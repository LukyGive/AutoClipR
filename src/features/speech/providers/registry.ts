import { SpeechProvider } from "@prisma/client";

import { internalSpeechProvider } from "@/features/speech/providers/internal-provider";
import type { SpeechToTextProvider } from "@/features/speech/providers/types";

const providers = new Map<SpeechProvider, SpeechToTextProvider>([
  [internalSpeechProvider.name, internalSpeechProvider]
]);

export function getSpeechProvider(provider: SpeechProvider) {
  const implementation = providers.get(provider);

  if (!implementation) {
    throw new Error(`Speech provider not configured: ${provider}`);
  }

  return implementation;
}
