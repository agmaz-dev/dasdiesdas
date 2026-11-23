import "server-only";
import { cache } from "react";
import { db } from "./db";

/** Lädt eine Anzeige über ihre öffentliche Nummer (pro Request zwischengespeichert) */
export const getListingByNumber = cache(async (nrRaw: string) => {
  if (!/^\d{1,10}$/.test(nrRaw)) return null;
  const number = Number(nrRaw);
  if (!Number.isSafeInteger(number) || number > 2_147_483_647) return null;
  return db.listing.findUnique({
    where: { number },
    include: {
      images: { orderBy: { position: "asc" }, select: { id: true, file: true, thumb: true } },
      user: {
        select: {
          id: true, name: true, accountType: true, companyName: true, companyAddress: true,
          vatId: true, imprint: true, createdAt: true, blockedAt: true, emailVerifiedAt: true,
        },
      },
    },
  });
});

export type FullListing = NonNullable<Awaited<ReturnType<typeof getListingByNumber>>>;

export function isPubliclyVisible(l: { status: string; expiresAt: Date | null; user: { blockedAt: Date | null } }) {
  return l.status === "ACTIVE" && !!l.expiresAt && l.expiresAt > new Date() && !l.user.blockedAt;
}

export const STATUS_LABELS: Record<string, string> = {
  PENDING: "Wartet auf Freigabe",
  ACTIVE: "Online",
  REJECTED: "Abgelehnt",
  INACTIVE: "Deaktiviert",
  BLOCKED: "Gesperrt",
  DELETED: "Gelöscht",
};
