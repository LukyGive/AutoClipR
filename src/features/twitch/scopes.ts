export const TWITCH_BASE_SCOPES = [
  "openid",
  "user:read:email",
  "clips:edit",
  "chat:read",
  "channel:manage:clips",
  "editor:manage:clips"
] as const;

export const TWITCH_CLIP_DOWNLOAD_SCOPES = [
  "channel:manage:clips",
  "editor:manage:clips"
] as const;

export function hasAnyScope(scopeValue: string | null | undefined, scopes: readonly string[]) {
  const grantedScopes = new Set(scopeValue?.split(" ").filter(Boolean) ?? []);
  return scopes.some((scope) => grantedScopes.has(scope));
}
