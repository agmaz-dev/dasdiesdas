"use server";

import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { db } from "@/lib/server/db";
import { getCurrentUser, hashPassword, passwordProblem, verifyPassword, destroySession, destroyAllSessions, createSession } from "@/lib/server/auth";
import { deleteImageFiles } from "@/lib/server/images";
import { rateLimit } from "@/lib/server/rate-limit";
import { formValues, type ActionState } from "@/lib/action-state";

const s = (fd: FormData, k: string, max = 200) => {
  const v = fd.get(k);
  return typeof v === "string" ? v.trim().slice(0, max) : "";
};

export async function updateProfileAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/anmelden");
  const values = formValues(fd);
  const errors: Record<string, string> = {};
  const name = s(fd, "name", 50).replace(/\s+/g, " ");
  const phone = s(fd, "phone", 30).replace(/[^\d+()\/\-\s]/g, "");
  const accountType = s(fd, "accountType") === "COMMERCIAL" ? "COMMERCIAL" : "PRIVATE";
  const companyName = s(fd, "companyName", 120);
  const companyAddress = s(fd, "companyAddress", 300);
  const vatId = s(fd, "vatId", 30);
  const imprint = s(fd, "imprint", 2000);

  if (name.length < 2) errors.name = "Bitte einen Namen mit mindestens 2 Zeichen angeben.";
  if (accountType === "COMMERCIAL") {
    if (companyName.length < 2) errors.companyName = "Firmenname ist für gewerbliche Anbieter Pflicht.";
    if (companyAddress.length < 10) errors.companyAddress = "Bitte die vollständige ladungsfähige Anschrift angeben (Straße, PLZ, Ort).";
    if (vatId && !/^[A-Z]{2}[0-9A-Z]{8,12}$/.test(vatId.replace(/\s/g, ""))) errors.vatId = "Ungültiges Format der USt-IdNr. (z. B. DE123456789).";
  }
  if (Object.keys(errors).length) return { errors, values };

  await db.user.update({
    where: { id: user.id },
    data: {
      name,
      phone: phone || null,
      accountType,
      companyName: accountType === "COMMERCIAL" ? companyName : null,
      companyAddress: accountType === "COMMERCIAL" ? companyAddress : null,
      vatId: accountType === "COMMERCIAL" && vatId ? vatId.replace(/\s/g, "") : null,
      imprint: accountType === "COMMERCIAL" && imprint ? imprint : null,
    },
  });
  refresh();
  return { ok: true, message: "Ihre Angaben wurden gespeichert." };
}

export async function changePasswordAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/anmelden");
  if (!rateLimit(`pwchange:${user.id}`, 10, 60 * 60_000)) return { message: "Zu viele Versuche. Bitte später erneut versuchen." };
  const current = (fd.get("currentPassword") as string) ?? "";
  const next = (fd.get("password") as string) ?? "";
  const dbUser = await db.user.findUnique({ where: { id: user.id } });
  if (!dbUser || !(await verifyPassword(current, dbUser.passwordHash))) return { errors: { currentPassword: "Das aktuelle Passwort ist falsch." } };
  const problem = passwordProblem(next);
  if (problem) return { errors: { password: problem } };
  if (next !== fd.get("password2")) return { errors: { password2: "Die Passwörter stimmen nicht überein." } };
  await db.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(next) } });
  // Alle anderen Sitzungen beenden
  await destroyAllSessions(user.id);
  await createSession(user.id);
  return { ok: true, message: "Ihr Passwort wurde geändert. Andere Geräte wurden abgemeldet." };
}

export async function deleteAccountAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/anmelden");
  const dbUser = await db.user.findUnique({ where: { id: user.id } });
  if (!dbUser || !(await verifyPassword((fd.get("password") as string) ?? "", dbUser.passwordHash))) {
    return { errors: { password: "Das Passwort ist falsch." } };
  }
  if (fd.get("confirm") !== "on") return { errors: { confirm: "Bitte bestätigen Sie die Löschung." } };
  const images = await db.listingImage.findMany({ where: { ownerId: user.id }, select: { file: true, thumb: true } });
  await destroySession();
  // Löscht kaskadierend: Anzeigen, Bilder, Nachrichten, Merkliste, Sitzungen
  await db.user.delete({ where: { id: user.id } });
  await deleteImageFiles(images);
  redirect("/?konto-geloescht=1");
}
