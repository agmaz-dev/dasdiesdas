"use server";

import { refresh } from "next/cache";
import { db } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/auth";
import { rateLimit } from "@/lib/server/rate-limit";

export async function toggleFavoriteAction(listingId: string): Promise<{ ok: boolean; favorite?: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "login" };
  if (typeof listingId !== "string" || listingId.length > 40) return { ok: false, error: "Ungültige Anzeige." };
  const key = { userId_listingId: { userId: user.id, listingId } };
  const existing = await db.favorite.findUnique({ where: key });
  if (existing) {
    await db.favorite.delete({ where: key });
    return { ok: true, favorite: false };
  }
  const listing = await db.listing.findUnique({ where: { id: listingId }, select: { id: true } });
  if (!listing) return { ok: false, error: "Anzeige nicht gefunden." };
  const count = await db.favorite.count({ where: { userId: user.id } });
  if (count >= 1000) return { ok: false, error: "Ihre Merkliste ist voll (max. 1.000 Einträge)." };
  await db.favorite.create({ data: { userId: user.id, listingId } });
  return { ok: true, favorite: true };
}

export async function removeFavoriteAction(fd: FormData) {
  const user = await getCurrentUser();
  const listingId = fd.get("listingId");
  if (!user || typeof listingId !== "string") return;
  await db.favorite.deleteMany({ where: { userId: user.id, listingId } });
  refresh();
}

export async function saveSearchAction(name: string, url: string): Promise<{ ok: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "login" };
  if (!rateLimit(`savesearch:${user.id}`, 30, 60 * 60_000)) return { ok: false, error: "Zu viele Anfragen." };
  const cleanName = String(name ?? "").trim().slice(0, 80) || "Meine Suche";
  const cleanUrl = String(url ?? "");
  if (!cleanUrl.startsWith("/anzeigen") || cleanUrl.length > 1500) return { ok: false, error: "Ungültige Suche." };
  const count = await db.savedSearch.count({ where: { userId: user.id } });
  if (count >= 50) return { ok: false, error: "Maximal 50 gespeicherte Suchen." };
  await db.savedSearch.create({ data: { userId: user.id, name: cleanName, query: cleanUrl } });
  return { ok: true };
}

export async function deleteSavedSearchAction(fd: FormData) {
  const user = await getCurrentUser();
  const id = fd.get("id");
  if (!user || typeof id !== "string") return;
  await db.savedSearch.deleteMany({ where: { id, userId: user.id } });
  refresh();
}
