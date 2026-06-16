import { env } from "@/lib/env";
import { TwitchIntegrationError } from "@/features/twitch/errors";

type CreateClipResponse = {
  data?: Array<{
    id: string;
    edit_url: string;
  }>;
  message?: string;
};

type GetClipsResponse = {
  data?: Array<{
    id: string;
    url: string;
    embed_url: string;
    broadcaster_id: string;
    broadcaster_name: string;
    creator_id: string;
    creator_name: string;
    video_id: string;
    game_id: string;
    language: string;
    title: string;
    view_count: number;
    created_at: string;
    thumbnail_url: string;
    duration: number;
    vod_offset: number | null;
  }>;
  message?: string;
};

type GetClipDownloadsResponse = {
  data?: Array<{
    clip_id: string;
    landscape_download_url: string | null;
    portrait_download_url: string | null;
  }>;
  message?: string;
};

type GetUsersResponse = {
  data?: Array<{
    id: string;
    login: string;
    display_name: string;
  }>;
  message?: string;
};

export async function getTwitchUserByLogin({
  accessToken,
  login
}: {
  accessToken: string;
  login: string;
}) {
  const url = new URL("https://api.twitch.tv/helix/users");
  url.searchParams.set("login", login);

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Client-Id": env.AUTH_TWITCH_ID!
    }
  });

  const payload = (await response.json().catch(() => ({}))) as GetUsersResponse;

  if (!response.ok) {
    throw new TwitchIntegrationError(
      payload.message ?? "Impossible de recuperer la chaine Twitch cible.",
      "TWITCH_GET_USER_FAILED",
      response.status
    );
  }

  const user = payload.data?.[0];

  if (!user) {
    throw new TwitchIntegrationError(
      "Cette chaine Twitch est introuvable.",
      "TWITCH_TARGET_NOT_FOUND",
      response.status
    );
  }

  return {
    id: user.id,
    login: user.login,
    displayName: user.display_name
  };
}

export async function createTwitchClip({
  accessToken,
  broadcasterId,
  title,
  duration
}: {
  accessToken: string;
  broadcasterId: string;
  title?: string;
  duration?: number;
}) {
  const url = new URL("https://api.twitch.tv/helix/clips");
  url.searchParams.set("broadcaster_id", broadcasterId);

  if (title) {
    url.searchParams.set("title", title);
  }

  if (duration) {
    url.searchParams.set("duration", String(duration));
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Client-Id": env.AUTH_TWITCH_ID!
    }
  });

  const payload = (await response.json().catch(() => ({}))) as CreateClipResponse;

  if (!response.ok) {
    throw new TwitchIntegrationError(
      payload.message ?? "Twitch a refuse la creation du clip.",
      "TWITCH_CREATE_CLIP_FAILED",
      response.status
    );
  }

  const clip = payload.data?.[0];

  if (!clip?.id || !clip.edit_url) {
    throw new TwitchIntegrationError(
      "Twitch n'a pas retourne de clip exploitable.",
      "TWITCH_CREATE_CLIP_EMPTY_RESPONSE",
      response.status
    );
  }

  return {
    id: clip.id,
    editUrl: clip.edit_url,
    url: `https://clips.twitch.tv/${clip.id}`
  };
}

export async function getTwitchClip({
  accessToken,
  clipId
}: {
  accessToken: string;
  clipId: string;
}) {
  const url = new URL("https://api.twitch.tv/helix/clips");
  url.searchParams.set("id", clipId);

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Client-Id": env.AUTH_TWITCH_ID!
    }
  });

  const payload = (await response.json().catch(() => ({}))) as GetClipsResponse;
  const clip = payload.data?.[0];

  console.info("twitch_get_clip_response", {
    status: response.status,
    requestId: clipId,
    requestUrl: url.toString(),
    body: payload,
    clip: clip
      ? {
          id: clip.id,
          thumbnailUrl: clip.thumbnail_url,
          url: clip.url
        }
      : null
  });

  if (!response.ok) {
    throw new TwitchIntegrationError(
      payload.message ?? "Impossible de verifier le clip Twitch.",
      "TWITCH_GET_CLIP_FAILED",
      response.status
    );
  }

  if (!clip) {
    return null;
  }

  return {
    id: clip.id,
    url: clip.url,
    embedUrl: clip.embed_url,
    title: clip.title,
    duration: clip.duration,
    createdAt: clip.created_at,
    thumbnailUrl: clip.thumbnail_url
  };
}

export async function getTwitchClipDownloadUrls({
  accessToken,
  broadcasterId,
  editorId,
  clipId
}: {
  accessToken: string;
  broadcasterId: string;
  editorId: string;
  clipId: string;
}) {
  const url = new URL("https://api.twitch.tv/helix/clips/downloads");
  url.searchParams.set("broadcaster_id", broadcasterId);
  url.searchParams.set("editor_id", editorId);
  url.searchParams.append("clip_id", clipId);

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Client-Id": env.AUTH_TWITCH_ID!
    }
  });

  const payload = (await response.json().catch(() => ({}))) as GetClipDownloadsResponse;

  if (!response.ok) {
    throw new TwitchIntegrationError(
      payload.message ?? getClipDownloadErrorMessage(response.status),
      getClipDownloadErrorCode(response.status),
      response.status
    );
  }

  const download = payload.data?.find((item) => item.clip_id === clipId);

  if (!download) {
    throw new TwitchIntegrationError(
      "Twitch n'a pas retourne d'URL de telechargement pour ce clip.",
      "TWITCH_CLIP_DOWNLOAD_NOT_FOUND",
      response.status
    );
  }

  return {
    clipId: download.clip_id,
    landscapeDownloadUrl: download.landscape_download_url,
    portraitDownloadUrl: download.portrait_download_url
  };
}

export function getPublicClipMp4FallbackUrl(thumbnailUrl: string | null | undefined) {
  if (!thumbnailUrl) {
    return null;
  }

  let url: URL;

  try {
    url = new URL(thumbnailUrl);
  } catch {
    return null;
  }

  if (!url.hostname.endsWith(".twitch.tv")) {
    return null;
  }

  const fallbackPath = url.pathname.replace(/-preview-\d+x\d+\.jpg$/i, ".mp4");

  if (fallbackPath === url.pathname) {
    return null;
  }

  url.pathname = fallbackPath;
  url.search = "";
  url.hash = "";

  return url.toString();
}

function getClipDownloadErrorCode(status: number) {
  if (status === 401) {
    return "TWITCH_CLIP_DOWNLOAD_UNAUTHORIZED";
  }

  if (status === 403) {
    return "TWITCH_CLIP_DOWNLOAD_FORBIDDEN";
  }

  if (status === 404) {
    return "TWITCH_CLIP_DOWNLOAD_NOT_FOUND";
  }

  if (status === 429) {
    return "TWITCH_CLIP_DOWNLOAD_RATE_LIMITED";
  }

  return "TWITCH_CLIP_DOWNLOAD_FAILED";
}

function getClipDownloadErrorMessage(status: number) {
  if (status === 401) {
    return "Reconnecte Twitch pour activer le telechargement des clips.";
  }

  if (status === 403) {
    return "Ce compte Twitch n'est pas autorise a telecharger ce clip.";
  }

  if (status === 404) {
    return "Clip Twitch introuvable.";
  }

  if (status === 429) {
    return "Trop de demandes de telechargement Twitch. Reessaie dans quelques instants.";
  }

  return "Impossible de preparer le telechargement Twitch.";
}
