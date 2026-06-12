import type { SpeechProvider } from "@prisma/client";

export type SpeechSegment = {
  transcript: string;
  confidence?: number;
  occurredAt?: Date;
};

export type SpeechToTextProvider = {
  name: SpeechProvider;
  transcribeAudio(input: {
    audioUrl?: string;
    audioBuffer?: Buffer;
    language?: string;
  }): Promise<SpeechSegment[]>;
};
