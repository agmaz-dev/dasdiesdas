"use server";

import { refresh } from "next/cache";
import { db } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/auth";
import { sendMail } from "@/lib/server/mail";
import { LISTING_DURATION_DAYS, SITE } from "@/lib/config";

const str = (fd: FormData, k: string, max = 1000) => {
  const v = fd.get(k);
  return typeof v === "string" ? v.trim().slice(0, max) : "";
};

/** Begründung an den Anbieter (Art. 17 DSA – Begründung von Moderationsentscheidungen) */
async function notifyOwner(listingId: string, subject: string, text: string) {
  const l = await db.listing.findUnique({ where: { id: listingId }, select: { number: true, title: true, user: { select: { email: true, name: true } } } });
  if (!l) return;
  await sendMail({
    to: l.user.email,
    subject: `${subject}: „${l.title}“`,
    text: `Hallo ${l.user.name},\n\n${text}\n\nAnzeige Nr. ${l.number}. Sie können der Entscheidung widersprechen, indem Sie auf diese E-Mail antworten oder uns unter ${SITE.supportEmail} kontaktieren.`,
    actionUrl: `${SITE.url}/konto/anzeigen`,
    actionLabel: "Meine Anzeigen",
  }).catch(() => {});
}

export async function moderateListingAction(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id", 40);
  const op = str(fd, "op", 20);
  const reason = str(fd, "reason", 500);
  const l = await db.listing.findUnique({ where: { id } });
  if (!l) return;

  if (op === "approve") {
    await db.listing.update({
      where: { id },
      data: { status: "ACTIVE", rejectReason: null, publishedAt: l.publishedAt ?? new Date(), expiresAt: l.expiresAt && l.expiresAt > new Date() ? l.expiresAt : new Date(Date.now() + LISTING_DURATION_DAYS * 86_400_000) },
    });
    if (l.status === "PENDING") await notifyOwner(id, "Ihre Anzeige ist online", "Ihre Anzeige wurde geprüft und freigeschaltet.");
  } else if (op === "reject") {
    await db.listing.update({ where: { id }, data: { status: "REJECTED", rejectReason: reason || "Verstoß gegen die Nutzungsbedingungen" } });
    await notifyOwner(id, "Ihre Anzeige wurde abgelehnt", `Ihre Anzeige konnte nicht freigeschaltet werden.\nGrund: ${reason || "Verstoß gegen die Nutzungsbedingungen"}\n\nSie können die Anzeige bearbeiten und erneut einreichen.`);
  } else if (op === "block") {
    await db.listing.update({ where: { id }, data: { status: "BLOCKED", rejectReason: reason || "Verstoß gegen die Nutzungsbedingungen" } });
    await notifyOwner(id, "Ihre Anzeige wurde gesperrt", `Ihre Anzeige wurde gesperrt.\nGrund: ${reason || "Verstoß gegen die Nutzungsbedingungen"}`);
  } else if (op === "feature" || op === "unfeature") {
    await db.listing.update({ where: { id }, data: { featured: op === "feature" } });
  }
  refresh();
}

export async function resolveReportAction(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id", 40);
  const op = str(fd, "op", 20);
  const resolution = str(fd, "resolution", 1000);
  const report = await db.report.findUnique({ where: { id }, include: { listing: { select: { id: true, number: true, title: true } } } });
  if (!report || report.status !== "OPEN") return;

  if (op === "block") {
    await db.listing.update({ where: { id: report.listingId }, data: { status: "BLOCKED", rejectReason: resolution || report.reason } });
    await notifyOwner(report.listingId, "Ihre Anzeige wurde gesperrt", `Nach Prüfung einer Meldung wurde Ihre Anzeige gesperrt.\nGrund: ${resolution || report.reason}`);
    // Alle weiteren offenen Meldungen zur selben Anzeige mit erledigen
    await db.report.updateMany({ where: { listingId: report.listingId, status: "OPEN" }, data: { status: "RESOLVED", resolution: resolution || "Anzeige gesperrt", resolvedAt: new Date() } });
  } else {
    await db.report.update({ where: { id }, data: { status: "DISMISSED", resolution: resolution || "Kein Verstoß festgestellt", resolvedAt: new Date() } });
  }
  if (report.email) {
    await sendMail({
      to: report.email,
      subject: `Entscheidung zu Ihrer Meldung – Anzeige ${report.listing.number}`,
      text: `Vielen Dank für Ihre Meldung zur Anzeige „${report.listing.title}“.\n\nEntscheidung: ${op === "block" ? "Die Anzeige wurde gesperrt." : "Nach Prüfung haben wir keinen Verstoß festgestellt."}${resolution ? `\nBegründung: ${resolution}` : ""}`,
    }).catch(() => {});
  }
  refresh();
}

export async function moderateUserAction(fd: FormData) {
  const admin = await requireAdmin();
  const id = str(fd, "id", 40);
  const op = str(fd, "op", 20);
  if (id === admin.id) return; // sich nicht selbst sperren / degradieren
  if (op === "block") {
    await db.user.update({ where: { id }, data: { blockedAt: new Date(), blockedReason: str(fd, "reason", 500) || null } });
    await db.session.deleteMany({ where: { userId: id } });
  } else if (op === "unblock") {
    await db.user.update({ where: { id }, data: { blockedAt: null, blockedReason: null } });
  } else if (op === "make-admin") {
    await db.user.update({ where: { id }, data: { role: "ADMIN" } });
  } else if (op === "remove-admin") {
    await db.user.update({ where: { id }, data: { role: "USER" } });
  } else if (op === "verify") {
    await db.user.update({ where: { id }, data: { emailVerifiedAt: new Date() } });
  }
  refresh();
}
