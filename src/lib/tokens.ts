import { randomBytes } from "node:crypto";

export function createSecretToken(bytes = 32) {
  return randomBytes(bytes).toString("base64url");
}
