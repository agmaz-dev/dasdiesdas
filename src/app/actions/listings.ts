"use server";

import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { db } from "@/lib/server/db";
import { getCurrentUser, type CurrentUser } from "@/lib/server/auth";
import { parseListingForm, type ListingInput } from "@/lib/server/listing-input";
import { deleteImageFiles } from "@/lib/server/images";
import { rateLimit } from "@/lib/server/rate-limit";
import { LISTING_DURATION_DAYS, moderationEnabled } from "@/lib/config";
import { formValues, type ActionState } from "@/lib/action-state";

const expiry = () => new Date(Date.now() + LISTING_DURATION_DAYS * 86_400_000);

async function precheck(user: CurrentUser | null): Promise<string | null> {
  if (!user) return "Bitte melden Sie sich an.";
  if (!user.emailVerified) return "Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse.";
  if (user.accountType === "COMMERCIAL") {
    const u = await db.user.findUnique({ where: { id: user.id }, select: { companyName: true, companyAddress: true } });
    if (!u?.companyName || !u.companyAddress) {
      return "Als gewerblicher Anbieter müssen Sie vor dem Veröffentlichen Firmenname und Anschrift (Impressum) in den Einstellungen hinterlegen.";
    }
  }
  return null;
}

/** Prüft, dass alle Bilder dem Nutzer gehören und frei bzw. dieser Anzeige zugeordnet sind */
async function validateImages(userId: string, imageIds: string[], listingId?: string) {
  if (!imageIds.length) return true;
  const found = await db.listingImage.findMany({
    where: { id: { in: imageIds }, ownerId: userId, OR: [{ listingId: null }, ...(listingId ? [{ listingId }] : [])] },
    select: { id: true },
  });
  return found.length === imageIds.length;
}

async function attachImages(listingId: string, imageIds: string[]) {
  // Nicht mehr verwendete Bilder entfernen
  const removed = await db.listingImage.findMany({ where: { listingId, id: { notIn: imageIds } }, select: { id: true, file: true, thumb: true } });
  if (removed.length) {
    await db.listingImage.deleteMany({ where: { id: { in: removed.map((r) => r.id) } } });
    await deleteImageFiles(removed);
  }
  await db.$transaction(imageIds.map((id, position) => db.listingImage.update({ where: { id }, data: { listingId, position } })));
}

function dataFrom(input: ListingInput) {
  const { imageIds: _ignored, ...rest } = input;
  void _ignored;
  return rest;
}

export async function createListingAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const values = formValues(fd);
  const user = await getCurrentUser();
  const problem = await precheck(user);
  if (problem || !user) return { values, message: problem ?? "Fehler" };
  if (!rateLimit(`create:${user.id}`, 30, 86_400_000)) return { values, message: "Sie haben heute bereits sehr viele Anzeigen erstellt. Bitte versuchen Sie es morgen erneut." };

  const { input, errors } = parseListingForm(fd);
  if (!input) return { values, errors, message: "Bitte prüfen Sie die markierten Felder." };
  if (!(await validateImages(user.id, input.imageIds))) return { values, message: "Ein Bild konnte nicht zugeordnet werden. Bitte laden Sie es erneut hoch." };

  const moderated = moderationEnabled();
  const listing = await db.listing.create({
    data: {
      ...dataFrom(input),
      userId: user.id,
      status: moderated ? "PENDING" : "ACTIVE",
      publishedAt: new Date(),
      expiresAt: expiry(),
    },
    select: { id: true, number: true },
  });
  await attachImages(listing.id, input.imageIds);
  if (input.phone && !user.phone) await db.user.update({ where: { id: user.id }, data: { phone: input.phone } });
  redirect(`/anzeige/${listing.number}?neu=1`);
}

export async function updateListingAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const values = formValues(fd);
  const user = await getCurrentUser();
  const problem = await precheck(user);
  if (problem || !user) return { values, message: problem ?? "Fehler" };

  const listingId = typeof fd.get("listingId") === "string" ? (fd.get("listingId") as string) : "";
  const existing = await db.listing.findFirst({ where: { id: listingId, userId: user.id, status: { not: "DELETED" } } });
  if (!existing) return { values, message: "Anzeige nicht gefunden." };
  if (existing.status === "BLOCKED") return { values, message: "Gesperrte Anzeigen können nicht bearbeitet werden." };

  const { input, errors } = parseListingForm(fd);
  if (!input) return { values, errors, message: "Bitte prüfen Sie die markierten Felder." };
  if (!(await validateImages(user.id, input.imageIds, existing.id))) return { values, message: "Ein Bild konnte nicht zugeordnet werden. Bitte laden Sie es erneut hoch." };

  const moderated = moderationEnabled();
  let status = existing.status;
  if (existing.status === "REJECTED" || (moderated && existing.status === "ACTIVE")) status = moderated ? "PENDING" : "ACTIVE";

  await db.listing.update({
    where: { id: existing.id },
    data: { ...dataFrom(input), status, rejectReason: status === "PENDING" || status === "ACTIVE" ? null : existing.rejectReason },
  });
  await attachImages(existing.id, input.imageIds);
  redirect(`/anzeige/${existing.number}?neu=${status === "PENDING" ? "1" : "0"}`);
}

type ManageOp = "deactivate" | "activate" | "extend" | "delete";

export async function manageListingAction(fd: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/anmelden");
  const id = fd.get("id");
  const op = fd.get("op") as ManageOp;
  if (typeof id !== "string") return;
  const l = await db.listing.findFirst({ where: { id, userId: user.id, status: { not: "DELETED" } } });
  if (!l || l.status === "BLOCKED") return;
  const now = new Date();

  if (op === "deactivate" && l.status === "ACTIVE") {
    await db.listing.update({ where: { id }, data: { status: "INACTIVE" } });
  } else if (op === "activate" && l.status === "INACTIVE") {
    await db.listing.update({
      where: { id },
      data: { status: moderationEnabled() ? "PENDING" : "ACTIVE", expiresAt: l.expiresAt && l.expiresAt > now ? l.expiresAt : expiry() },
    });
  } else if (op === "extend" && (l.status === "ACTIVE" || l.status === "INACTIVE")) {
    // Verlängern ist ab 7 Tage vor Ablauf möglich
    if (!l.expiresAt || l.expiresAt.getTime() - now.getTime() < 7 * 86_400_000) {
      await db.listing.update({ where: { id }, data: { expiresAt: expiry(), publishedAt: l.status === "ACTIVE" ? now : l.publishedAt } });
    }
  } else if (op === "delete") {
    const images = await db.listingImage.findMany({ where: { listingId: id }, select: { file: true, thumb: true } });
    await db.listingImage.deleteMany({ where: { listingId: id } });
    await deleteImageFiles(images);
    await db.listing.update({ where: { id }, data: { status: "DELETED" } });
    await db.favorite.deleteMany({ where: { listingId: id } });
  }
  refresh();
}
