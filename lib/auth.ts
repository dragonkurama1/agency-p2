import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

/**
 * Session admin minimaliste : un seul compte (ADMIN_EMAIL / ADMIN_PASSWORD_HASH
 * en .env, hash bcrypt), JWT signé (HS256) stocké dans un cookie httpOnly.
 * Pas de base utilisateurs : suffisant pour un dashboard agence mono-admin.
 */

export const SESSION_COOKIE = "pa_session";
const SESSION_DURATION = "8h";

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("SESSION_SECRET manquant ou trop court (.env) — voir README.");
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(email: string) {
  return new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION)
    .sign(getSecretKey());
}

async function verifySessionToken(token: string): Promise<{ email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (typeof payload.email !== "string") return null;
    return { email: payload.email };
  } catch {
    return null;
  }
}

/** À utiliser dans les Server Components / Server Actions (pas dans le middleware Edge). */
export async function getSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
