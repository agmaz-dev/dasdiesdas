import type { MetadataRoute } from "next";
import { SITE } from "@/lib/config";
import { getAllCategories, categoryUrl } from "@/lib/categories";
import { db } from "@/lib/server/db";
import { publicListingWhere } from "@/lib/server/search";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const statics = ["", "/kategorien", "/hilfe", "/sicherheit", "/impressum", "/datenschutz", "/agb"].map((p) => ({ url: `${SITE.url}${p}` }));
  const cats = getAllCategories().map((c) => ({ url: `${SITE.url}${categoryUrl(c.id)}`, changeFrequency: "daily" as const }));
  const listings = await db.listing.findMany({ where: publicListingWhere(), select: { number: true, updatedAt: true }, orderBy: { publishedAt: "desc" }, take: 40_000 });
  return [...statics, ...cats, ...listings.map((l) => ({ url: `${SITE.url}/anzeige/${l.number}`, lastModified: l.updatedAt }))];
}
