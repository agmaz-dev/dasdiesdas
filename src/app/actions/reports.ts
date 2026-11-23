"use server";

import { db } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/auth";
import { rateLimit, clientIp } from "@/lib/server/rate-limit";
import { sendMail } from "@/lib/server/mail";
import { SITE } from "@/lib/config";
import { formValues, type ActionState } from "@/lib/action-state";
import { REPORT_REASONS } from "@/lib/reports";



export async function reportListingAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const values = formValues(fd);
  const ip = await clientIp();
  if (!rateLimit(`report:${ip}`, 10, 60 * 60_000)) return { values, message: "Zu viele Meldungen. Bitte später erneut versuchen." };
  const user = await getCurrentUser();
  const listingId = typeof fd.get("listingId") === "string" ? (fd.get("listingId") as string) : "";
  const reason = typeof fd.get("reason") === "string" ? (fd.get("reason") as string) : "";
  const details = (typeof fd.get("details") === "string" ? (fd.get("details") as string) : "").trim().slice(0, 4000);
  const email = (typeof fd.get("email") === "string" ? (fd.get("email") as string) : "").trim().toLowerCase().slice(0, 200);

  const errors: Record<string, string> = {};
  if (!(REPORT_REASONS as readonly string[]).includes(reason)) errors.reason = "Bitte einen Grund auswählen.";
  if (details.length < 10) errors.details = "Bitte begründen Sie Ihre Meldung (mind. 10 Zeichen), damit wir sie prüfen können.";
  if (!user && email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Ungültige E-Mail-Adresse.";
  if (fd.get("truth") !== "on") errors.truth = "Bitte bestätigen Sie, dass Ihre Angaben nach bestem Wissen korrekt sind.";
  if (Object.keys(errors).length) return { values, errors };

  const listing = await db.listing.findUnique({ where: { id: listingId }, select: { id: true, number: true, title: true } });
  if (!listing) return { message: "Anzeige nicht gefunden." };
  await db.report.create({ data: { listingId: listing.id, reporterId: user?.id, email: user ? user.email : email || null, reason, details } });

  const confirmTo = user?.email ?? email;
  if (confirmTo) {
    await sendMail({
      to: confirmTo,
      subject: `Eingangsbestätigung Ihrer Meldung – Anzeige ${listing.number}`,
      text: `Vielen Dank für Ihre Meldung zur Anzeige „${listing.title}“ (Nr. ${listing.number}).\n\nGrund: ${reason}\n\nWir prüfen die Meldung zeitnah und informieren Sie über unsere Entscheidung (Art. 16 DSA).`,
    }).catch(() => {});
  }
  const adminMail = process.env.ADMIN_EMAIL;
  if (adminMail) {
    await sendMail({ to: adminMail, subject: `Neue Meldung: Anzeige ${listing.number}`, text: `Grund: ${reason}\n\n${details}`, actionUrl: `${SITE.url}/admin/meldungen`, actionLabel: "Meldungen prüfen" }).catch(() => {});
  }
  return { ok: true, message: "Vielen Dank. Ihre Meldung ist eingegangen und wird geprüft." };
}
