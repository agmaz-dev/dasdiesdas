import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "./db";
import { getCategoryAttributes, getCategory, aggregateCounts } from "@/lib/categories";
import { parseGermanNumber } from "@/lib/format";
import { PAGE_SIZE } from "@/lib/config";

export type SearchParams = Record<string, string | string[] | undefined>;

export const SORTS = {
  neu: { label: "Neueste zuerst", orderBy: [{ publishedAt: "desc" }] },
  alt: { label: "Älteste zuerst", orderBy: [{ publishedAt: "asc" }] },
  preis_auf: { label: "Preis aufsteigend", orderBy: [{ priceCents: { sort: "asc", nulls: "last" } }, { publishedAt: "desc" }] },
  preis_ab: { label: "Preis absteigend", orderBy: [{ priceCents: { sort: "desc", nulls: "last" } }, { publishedAt: "desc" }] },
} as const satisfies Record<string, { label: string; orderBy: Prisma.ListingOrderByWithRelationInput[] }>;

export type SortKey = keyof typeof SORTS;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined;
const many = (v: string | string[] | undefined) => (Array.isArray(v) ? v : v ? [v] : []).map((x) => x.trim()).filter(Boolean);

/** Basisfilter: nur öffentlich sichtbare Anzeigen */
export function publicListingWhere(): Prisma.ListingWhereInput {
  return { status: "ACTIVE", expiresAt: { gt: new Date() }, user: { blockedAt: null } };
}

export function buildSearchWhere(categoryId: string | undefined, sp: SearchParams): Prisma.ListingWhereInput {
  const and: Prisma.ListingWhereInput[] = [publicListingWhere()];

  if (categoryId) and.push({ categoryPath: { has: categoryId } });

  const q = one(sp.q);
  if (q) {
    const asNumber = /^\d{1,9}$/.test(q) ? Number(q) : null;
    const terms = q.toLowerCase().split(/\s+/).filter((t) => t.length >= 2).slice(0, 8);
    const textCond: Prisma.ListingWhereInput = { AND: terms.map((t) => ({ searchText: { contains: t } })) };
    and.push(asNumber ? { OR: [textCond, { number: asNumber }] } : textCond);
  }

  const pmin = one(sp.preis_von) ? parseGermanNumber(one(sp.preis_von)!) : null;
  const pmax = one(sp.preis_bis) ? parseGermanNumber(one(sp.preis_bis)!) : null;
  if (pmin !== null || pmax !== null) {
    and.push({
      priceCents: {
        ...(pmin !== null ? { gte: Math.round(pmin * 100) } : {}),
        ...(pmax !== null ? { lte: Math.round(pmax * 100) } : {}),
      },
    });
  }

  const state = one(sp.bundesland);
  if (state) and.push({ state });
  const city = one(sp.ort);
  if (city) and.push({ city: { contains: city, mode: "insensitive" } });
  const district = one(sp.bezirk);
  if (district) and.push({ district });
  const sub = one(sp.ortsteil);
  if (sub) and.push({ subdistrict: sub });
  const plz = one(sp.plz);
  if (plz && /^\d{1,5}$/.test(plz)) and.push({ postalCode: { startsWith: plz } });

  const anbieter = one(sp.anbieter);
  if (anbieter === "privat") and.push({ user: { accountType: "PRIVATE" } });
  if (anbieter === "gewerblich") and.push({ user: { accountType: "COMMERCIAL" } });

  const art = one(sp.art);
  if (art === "angebot") and.push({ offerType: "OFFER" });
  if (art === "gesuch") and.push({ offerType: "WANTED" });

  if (one(sp.bilder) === "1") and.push({ images: { some: {} } });
  if (one(sp.preisart) === "verschenken") and.push({ priceType: "FREE" });

  // Kategoriespezifische Filter
  if (categoryId) {
    for (const def of getCategoryAttributes(categoryId)) {
      if (!def.filter) continue;
      const key = `a_${def.key}`;
      if (def.type === "number") {
        const from = one(sp[`${key}_von`]);
        const to = one(sp[`${key}_bis`]);
        const f = from ? parseGermanNumber(from) : null;
        const t = to ? parseGermanNumber(to) : null;
        if (f !== null) and.push({ attributes: { path: [def.key], gte: f } });
        if (t !== null) and.push({ attributes: { path: [def.key], lte: t } });
      } else if (def.type === "select") {
        const vals = many(sp[key]).filter((v) => def.options?.includes(v));
        if (vals.length === 1) and.push({ attributes: { path: [def.key], equals: vals[0] } });
        else if (vals.length > 1) and.push({ OR: vals.map((v) => ({ attributes: { path: [def.key], equals: v } })) });
      } else if (def.type === "multiselect") {
        const vals = many(sp[key]).filter((v) => def.options?.includes(v));
        if (vals.length) and.push({ OR: vals.map((v) => ({ attributes: { path: [def.key], array_contains: [v] } })) });
      } else if (def.type === "boolean") {
        if (one(sp[key]) === "1") and.push({ attributes: { path: [def.key], equals: true } });
      } else if (def.type === "model") {
        const v = one(sp[key]);
        if (v && v.length <= 80) and.push({ attributes: { path: [def.key], equals: v } });
      } else if (def.type === "text") {
        const v = one(sp[key]);
        if (v) and.push({ attrIndex: { path: [def.key], string_contains: v.toLowerCase().slice(0, 60) } });
      }
    }
  }

  return { AND: and };
}

export const listingCardSelect = {
  id: true,
  number: true,
  title: true,
  priceCents: true,
  priceType: true,
  offerType: true,
  categoryId: true,
  city: true,
  district: true,
  subdistrict: true,
  postalCode: true,
  publishedAt: true,
  featured: true,
  attributes: true,
  user: { select: { accountType: true, companyName: true } },
  images: { select: { thumb: true }, orderBy: { position: "asc" }, take: 1 },
  _count: { select: { images: true } },
} satisfies Prisma.ListingSelect;

export type ListingCard = Prisma.ListingGetPayload<{ select: typeof listingCardSelect }>;

export async function searchListings(categoryId: string | undefined, sp: SearchParams) {
  const where = buildSearchWhere(categoryId, sp);
  const sortKey = (one(sp.sort) as SortKey) in SORTS ? (one(sp.sort) as SortKey) : "neu";
  const page = Math.max(1, Math.min(500, Number(one(sp.seite)) || 1));

  const [total, items] = await Promise.all([
    db.listing.count({ where }),
    db.listing.findMany({
      where,
      select: listingCardSelect,
      orderBy: SORTS[sortKey].orderBy as Prisma.ListingOrderByWithRelationInput[],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  return { total, items, page, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)), sortKey };
}

/** Anzahl aktiver Anzeigen je Kategorie (inkl. Unterkategorien) */
export async function getCategoryCounts(): Promise<Record<string, number>> {
  const rows = await db.listing.groupBy({
    by: ["categoryId"],
    where: publicListingWhere(),
    _count: { _all: true },
  });
  const leaf: Record<string, number> = {};
  for (const r of rows) leaf[r.categoryId] = r._count._all;
  return aggregateCounts(leaf);
}

/** Zählt Treffer je direkter Unterkategorie für die aktuelle Suche (ohne Kategoriefilter-Tiefe) */
export async function getSubcategoryCounts(categoryId: string | undefined, sp: SearchParams): Promise<Record<string, number>> {
  const where = buildSearchWhere(categoryId, sp);
  const rows = await db.listing.groupBy({ by: ["categoryId"], where, _count: { _all: true } });
  const leaf: Record<string, number> = {};
  for (const r of rows) leaf[r.categoryId] = r._count._all;
  return aggregateCounts(leaf);
}

export function isValidCategoryId(id: string | undefined) {
  return !!id && !!getCategory(id);
}

/**
 * Trefferzahlen je Marke bzw. je Modell einer Marke innerhalb einer Kategorie
 * (berücksichtigt Kategorie und Standort-Filter).
 */
export async function getBrandModelCounts(
  categoryId: string,
  sp: SearchParams,
  brandKey: string,
  modelKey: string,
): Promise<{ brands: Record<string, number>; models: Record<string, number> }> {
  const state = one(sp.bundesland) ?? null;
  const district = one(sp.bezirk) ?? null;
  const brand = one(sp[`a_${brandKey}`]) ?? null;
  const rows = await db.$queryRaw<{ brand: string | null; model: string | null; n: number }[]>`
    SELECT l.attributes->>${brandKey} AS brand, l.attributes->>${modelKey} AS model, count(*)::int AS n
    FROM "Listing" l JOIN "User" u ON u.id = l."userId"
    WHERE l.status = 'ACTIVE' AND l."expiresAt" > now() AND u."blockedAt" IS NULL
      AND l."categoryPath" @> ARRAY[${categoryId}]::text[]
      AND (${state}::text IS NULL OR l.state = ${state})
      AND (${district}::text IS NULL OR l.district = ${district})
    GROUP BY 1, 2`;
  const brands: Record<string, number> = {};
  const models: Record<string, number> = {};
  for (const r of rows) {
    if (r.brand) brands[r.brand] = (brands[r.brand] ?? 0) + r.n;
    if (brand && r.brand === brand && r.model) models[r.model] = (models[r.model] ?? 0) + r.n;
  }
  return { brands, models };
}

/** IDs der gemerkten Anzeigen eines Nutzers (für Herz-Symbole in Listen) */
export async function getFavoriteIds(userId: string | undefined, listingIds: string[]): Promise<Set<string>> {
  if (!userId || !listingIds.length) return new Set();
  const favs = await db.favorite.findMany({ where: { userId, listingId: { in: listingIds } }, select: { listingId: true } });
  return new Set(favs.map((f) => f.listingId));
}
