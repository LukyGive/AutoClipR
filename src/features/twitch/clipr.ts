import { env } from "@/lib/env";

const DEFAULT_RAPIDAPI_HOST = "clipr.p.rapidapi.com";

type CliprResponse = {
  video_qualities?: Array<{
    quality?: string | number;
    source_url?: string;
  }>;
  source_url?: string;
  download_url?: string;
  downloadUrl?: string;
  url?: string;
  message?: string;
  error?: string;
};

export class CliprDownloadError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status?: number
  ) {
    super(message);
    this.name = "CliprDownloadError";
  }
}

export async function getCliprDownloadUrl(twitchClipId: string) {
  if (!env.RAPIDAPI_KEY) {
    throw new CliprDownloadError(
      "RAPIDAPI_KEY is not configured.",
      "CLIPR_NOT_CONFIGURED"
    );
  }

  const host = env.RAPIDAPI_HOST ?? DEFAULT_RAPIDAPI_HOST;
  const url = new URL(
    `https://${host}/api/v1/clips/${encodeURIComponent(twitchClipId)}`
  );
  const response = await fetch(url, {
    headers: {
      "x-rapidapi-host": host,
      "x-rapidapi-key": env.RAPIDAPI_KEY,
      "Content-Type": "application/json"
    }
  });
  const payload = (await response.json().catch(() => ({}))) as CliprResponse;

  if (!response.ok) {
    throw new CliprDownloadError(
      payload.message ?? payload.error ?? "Clipr failed to return clip metadata.",
      "CLIPR_REQUEST_FAILED",
      response.status
    );
  }

  return extractCliprDownloadUrl(payload);
}

function extractCliprDownloadUrl(payload: CliprResponse) {
  const qualityUrl = payload.video_qualities
    ?.filter((quality) => isDownloadableMp4Url(quality.source_url))
    .sort((left, right) => getQualityValue(right.quality) - getQualityValue(left.quality))
    .at(0)?.source_url;

  if (qualityUrl) {
    return qualityUrl;
  }

  const fallbackUrl =
    payload.source_url ?? payload.download_url ?? payload.downloadUrl ?? payload.url;

  return isDownloadableMp4Url(fallbackUrl) ? fallbackUrl : null;
}

function getQualityValue(quality: string | number | undefined) {
  if (typeof quality === "number") {
    return quality;
  }

  return Number.parseInt(quality ?? "0", 10) || 0;
}

function isDownloadableMp4Url(value: string | undefined) {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.pathname.endsWith(".mp4");
  } catch {
    return false;
  }
}
