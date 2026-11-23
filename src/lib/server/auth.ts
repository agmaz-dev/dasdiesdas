import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { db } from "./db";
import type { TokenType } from "@/generated/prisma/enums";

const COOKIE = "dds_session";
const SESSION_DAYS = 30;

export const sha256 = (v: string) => createHash("sha256").update(v).digest("hex");
const newToken = () => randomBytes(32).toString("base64url");

export async function hashPassword(pw: string) {
  return bcrypt.hash(pw, 12);
}

export async function verifyPassword(pw: string, hash: string) {
  return bcrypt.compare(pw, hash);
}

let dummyHash: Promise<string> | null = null;
/** Prüft das Passwort; bei unbekanntem Nutzer gegen einen Dummy-Hash (gleiche Laufzeit, kein Konto-Ausspähen) */
export async function verifyPasswordTimingSafe(pw: string, hash: string | undefined) {
  if (!hash) {
    dummyHash ??= bcrypt.hash("dummy-password-for-timing", 12);
    await bcrypt.compare(pw, await dummyHash);
    return false;
  }
  return bcrypt.compare(pw, hash);
}

/** Passwortregeln: mind. 10 Zeichen, Buchstabe und Ziffer */
export function passwordProblem(pw: string): string | null {
  if (pw.length < 10) return "Das Passwort muss mindestens 10 Zeichen lang sein.";
  if (pw.length > 200) return "Das Passwort ist zu lang.";
  if (!/[A-Za-zÄÖÜäöüß]/.test(pw) || !/\d/.test(pw)) return "Das Passwort muss Buchstaben und Ziffern enthalten.";
  return null;
}

export async function createSession(userId: string) {
  const token = newToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  await db.session.create({ data: { id: sha256(token), userId, expiresAt } });
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await db.session.deleteMany({ where: { id: sha256(token) } });
  jar.delete(COOKIE);
}

export async function destroyAllSessions(userId: string) {
  await db.session.deleteMany({ where: { userId } });
}

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
  accountType: "PRIVATE" | "COMMERCIAL";
  emailVerified: boolean;
  phone: string | null;
};

/** Aktueller Nutzer (pro Request zwischengespeichert) oder null */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const session = await db.session.findUnique({
    where: { id: sha256(token) },
    include: { user: true },
  });
  if (!session || session.expiresAt < new Date() || session.user.blockedAt) return null;
  const u = session.user;
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    accountType: u.accountType,
    emailVerified: !!u.emailVerifiedAt,
    phone: u.phone,
  };
});

export async function requireUser(next?: string): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/anmelden${next ? `?weiter=${encodeURIComponent(next)}` : ""}`);
  return user;
}

export async function requireAdmin(): Promise<CurrentUser> {
  const user = await requireUser("/admin");
  if (user.role !== "ADMIN") redirect("/");
  return user;
}

/** Einmal-Token (E-Mail-Bestätigung, Passwort-Reset). Gibt das Klartext-Token zurück. */
export async function createAuthToken(userId: string, type: TokenType, ttlMinutes: number) {
  await db.authToken.deleteMany({ where: { userId, type } });
  const token = newToken();
  await db.authToken.create({
    data: { id: sha256(token), userId, type, expiresAt: new Date(Date.now() + ttlMinutes * 60_000) },
  });
  return token;
}

/** Prüft und verbraucht ein Token. Gibt die User-ID zurück oder null. */
export async function consumeAuthToken(token: string, type: TokenType): Promise<string | null> {
  if (!token || token.length > 100) return null;
  const rec = await db.authToken.findUnique({ where: { id: sha256(token) } });
  if (!rec || rec.type !== type) return null;
  await db.authToken.delete({ where: { id: rec.id } });
  if (rec.expiresAt < new Date()) return null;
  return rec.userId;
}

/** Verhindert offene Weiterleitungen: nur interne Pfade erlauben */
export function safeRedirectPath(p: string | null | undefined, fallback = "/"): string {
  if (!p || !p.startsWith("/") || p.startsWith("//") || p.startsWith("/\\")) return fallback;
  return p;
}
