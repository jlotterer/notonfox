import { createHmac, timingSafeEqual } from "crypto";

export const COOKIE_NAME = "admin_token";

export function generateToken(password: string): string {
  return createHmac("sha256", password)
    .update("news-evaluator-admin-v1")
    .digest("hex");
}

export function validateToken(token: string | undefined): boolean {
  const password = process.env.ADMIN_PASSWORD;
  if (!password || !token) return false;
  const expected = generateToken(password);
  try {
    return timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  } catch {
    return false;
  }
}
