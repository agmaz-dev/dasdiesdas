"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/server/db";
import {
  createSession, destroySession, hashPassword, verifyPasswordTimingSafe, passwordProblem,
  createAuthToken, consumeAuthToken, destroyAllSessions, getCurrentUser, safeRedirectPath,
} from "@/lib/server/auth";
import { sendMail } from "@/lib/server/mail";
import { rateLimit, clientIp } from "@/lib/server/rate-limit";
import { SITE } from "@/lib/config";
import { formValues, type ActionState } from "@/lib/action-state";

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;
const normEmail = (v: FormDataEntryValue | null) => (typeof v === "string" ? v.trim().toLowerCase() : "");
const s = (fd: FormData, k: string) => {
  const v = fd.get(k);
  return typeof v === "string" ? v.trim() : "";
};

async function sendVerificationMail(userId: string, email: string, name: string) {
  const token = await createAuthToken(userId, "EMAIL_VERIFY", 60 * 48);
  await sendMail({
    to: email,
    subject: `Bitte bestätigen Sie Ihre E-Mail-Adresse – ${SITE.name}`,
    text: `Hallo ${name},\n\nwillkommen bei ${SITE.name}! Bitte bestätigen Sie Ihre E-Mail-Adresse, um Anzeigen aufzugeben und Nachrichten zu senden. Der Link ist 48 Stunden gültig.`,
    actionUrl: `${SITE.url}/email-bestaetigen?token=${token}`,
    actionLabel: "E-Mail-Adresse bestätigen",
  });
}

export async function registerAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const values = formValues(fd);
  const ip = await clientIp();
  if (!rateLimit(`register:${ip}`, 5, 60 * 60_000)) {
    return { values, message: "Zu viele Registrierungen von dieser Verbindung. Bitte später erneut versuchen." };
  }
  // Honeypot gegen Bots
  if (s(fd, "website")) return { values, message: "Registrierung fehlgeschlagen." };

  const errors: Record<string, string> = {};
  const name = s(fd, "name").replace(/\s+/g, " ");
  const email = normEmail(fd.get("email"));
  const password = typeof fd.get("password") === "string" ? (fd.get("password") as string) : "";
  const accountType = s(fd, "accountType") === "COMMERCIAL" ? "COMMERCIAL" : "PRIVATE";
  const companyName = s(fd, "companyName");

  if (name.length < 2 || name.length > 50) errors.name = "Bitte einen Namen mit 2–50 Zeichen angeben.";
  if (!EMAIL_RE.test(email)) errors.email = "Bitte eine gültige E-Mail-Adresse angeben.";
  const pwErr = passwordProblem(password);
  if (pwErr) errors.password = pwErr;
  if (password !== fd.get("password2")) errors.password2 = "Die Passwörter stimmen nicht überein.";
  if (accountType === "COMMERCIAL" && companyName.length < 2) errors.companyName = "Bitte den Firmennamen angeben.";
  if (fd.get("terms") !== "on") errors.terms = "Bitte stimmen Sie den AGB zu und bestätigen Sie die Datenschutzerklärung.";
  if (Object.keys(errors).length) return { errors, values };

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return { errors: { email: "Für diese E-Mail-Adresse existiert bereits ein Konto." }, values };

  const user = await db.user.create({
    data: {
      name,
      email,
      passwordHash: await hashPassword(password),
      accountType,
      companyName: accountType === "COMMERCIAL" ? companyName : null,
    },
  });
  await sendVerificationMail(user.id, user.email, user.name);
  await createSession(user.id);
  redirect("/konto?willkommen=1");
}

export async function loginAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const values = formValues(fd);
  const email = normEmail(fd.get("email"));
  const password = typeof fd.get("password") === "string" ? (fd.get("password") as string) : "";
  const ip = await clientIp();
  if (!rateLimit(`login:${ip}`, 20, 15 * 60_000) || !rateLimit(`login:${email}`, 8, 15 * 60_000)) {
    return { values, message: "Zu viele Anmeldeversuche. Bitte warten Sie 15 Minuten." };
  }
  const user = email ? await db.user.findUnique({ where: { email } }) : null;
  // Konstante Prüfung auch bei unbekannter E-Mail, um Konten nicht erratbar zu machen
  const ok = await verifyPasswordTimingSafe(password, user?.passwordHash);
  if (!user || !ok) return { values, message: "E-Mail-Adresse oder Passwort ist falsch." };
  if (user.blockedAt) return { values, message: "Dieses Konto wurde gesperrt. Bitte wenden Sie sich an den Support." };
  await createSession(user.id);
  redirect(safeRedirectPath(s(fd, "weiter"), "/konto"));
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

export async function resendVerificationAction(): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/anmelden");
  if (user.emailVerified) return { ok: true, message: "Ihre E-Mail-Adresse ist bereits bestätigt." };
  if (!rateLimit(`verify:${user.id}`, 3, 60 * 60_000)) return { message: "Bitte warten Sie, bevor Sie eine weitere E-Mail anfordern." };
  await sendVerificationMail(user.id, user.email, user.name);
  return { ok: true, message: "Wir haben Ihnen eine neue Bestätigungs-E-Mail gesendet." };
}

export async function verifyEmail(token: string): Promise<boolean> {
  const userId = await consumeAuthToken(token, "EMAIL_VERIFY");
  if (!userId) return false;
  await db.user.update({ where: { id: userId }, data: { emailVerifiedAt: new Date() } });
  return true;
}

export async function requestPasswordResetAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const email = normEmail(fd.get("email"));
  const ip = await clientIp();
  if (!rateLimit(`reset:${ip}`, 5, 60 * 60_000)) return { message: "Zu viele Anfragen. Bitte später erneut versuchen." };
  const user = EMAIL_RE.test(email) ? await db.user.findUnique({ where: { email } }) : null;
  if (user && !user.blockedAt) {
    const token = await createAuthToken(user.id, "PASSWORD_RESET", 60);
    await sendMail({
      to: user.email,
      subject: `Passwort zurücksetzen – ${SITE.name}`,
      text: `Hallo ${user.name},\n\nSie haben angefordert, Ihr Passwort zurückzusetzen. Der Link ist 60 Minuten gültig. Falls Sie das nicht waren, ignorieren Sie diese E-Mail.`,
      actionUrl: `${SITE.url}/passwort-zuruecksetzen?token=${token}`,
      actionLabel: "Neues Passwort festlegen",
    });
  }
  // Immer gleiche Antwort, damit keine Konten ausgespäht werden können
  return { ok: true, message: "Falls ein Konto mit dieser E-Mail-Adresse existiert, haben wir Ihnen einen Link gesendet." };
}

export async function resetPasswordAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const password = typeof fd.get("password") === "string" ? (fd.get("password") as string) : "";
  const pwErr = passwordProblem(password);
  if (pwErr) return { errors: { password: pwErr } };
  if (password !== fd.get("password2")) return { errors: { password2: "Die Passwörter stimmen nicht überein." } };
  const userId = await consumeAuthToken(s(fd, "token"), "PASSWORD_RESET");
  if (!userId) return { message: "Der Link ist ungültig oder abgelaufen. Bitte fordern Sie einen neuen an." };
  await db.user.update({ where: { id: userId }, data: { passwordHash: await hashPassword(password), emailVerifiedAt: new Date() } });
  await destroyAllSessions(userId);
  await createSession(userId);
  redirect("/konto?passwort=1");
}
