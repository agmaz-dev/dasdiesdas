import "server-only";
import { getCategory, getCategoryLabel, getCategoryAttributes } from "@/lib/categories";
import type { FullListing } from "./listings";
import { mediaUrl } from "@/lib/media";
import { CATALOGS, catalogModels, OTHER_BRAND, OTHER_MODEL, type CatalogKey } from "@/lib/catalog";

export function categoryFormProps(categoryId: string) {
  const c = getCategory(categoryId)!;
  const attributes = getCategoryAttributes(c.id);
  // Nur die Kataloge mitschicken, die diese Kategorie benötigt
  const catalogs: Partial<Record<CatalogKey, Record<string, readonly string[]>>> = {};
  for (const a of attributes) if (a.catalog) catalogs[a.catalog] = CATALOGS[a.catalog] as Record<string, readonly string[]>;
  return {
    category: { id: c.id, label: getCategoryLabel(c.id), priceMode: c.priceMode, priceLabel: c.priceLabel, priceUnit: c.priceUnit },
    attributes,
    catalogs,
  };
}

const numToInput = (n: number) => String(n).replace(".", ",");

/** Wandelt eine gespeicherte Anzeige in Formularwerte um (für „Bearbeiten“) */
export function listingToFormValues(l: FullListing, categoryId: string): Record<string, string | string[]> {
  const v: Record<string, string | string[]> = {
    title: l.title,
    description: l.description,
    offerType: l.offerType,
    priceType: l.priceType,
    price: l.priceCents != null ? numToInput(l.priceCents / 100) : "",
    state: l.state,
    city: l.city,
    district: l.district ?? "",
    subdistrict: l.subdistrict ?? "",
    postalCode: l.postalCode,
    showPhone: l.showPhone ? "on" : "",
    phone: l.phone ?? "",
  };
  const attrs = (l.attributes ?? {}) as Record<string, unknown>;
  // Nur Merkmale übernehmen, die es in der (ggf. neuen) Kategorie gibt
  for (const d of getCategoryAttributes(categoryId)) {
    const val = attrs[d.key];
    if (val === undefined) continue;
    if (d.type === "boolean") v[`attr_${d.key}`] = val === true ? "on" : "";
    else if (d.type === "multiselect") v[`attr_${d.key}`] = Array.isArray(val) ? val.map(String) : [];
    else if (d.type === "model" && d.catalog && d.parent) {
      const brand = String(attrs[d.parent] ?? "");
      if (brand === OTHER_BRAND || catalogModels(d.catalog, brand).includes(String(val))) v[`attr_${d.key}`] = String(val);
      else {
        v[`attr_${d.key}`] = OTHER_MODEL;
        v[`attr_${d.key}_frei`] = String(val);
      }
    } else if (typeof val === "number") v[`attr_${d.key}`] = numToInput(val);
    else v[`attr_${d.key}`] = String(val);
  }
  return v;
}

export function listingImages(l: FullListing) {
  return l.images.map((i) => ({ id: i.id, thumbUrl: mediaUrl(i.thumb) }));
}
