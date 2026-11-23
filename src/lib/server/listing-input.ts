import "server-only";
import { getCategory, getCategoryAttributes, type AttributeDef, type Category } from "@/lib/categories";
import { parseGermanNumber } from "@/lib/format";
import { isValidDistrict, isValidPostalCode, isValidState, isValidSubdistrict, BERLIN, isBerlinPostalCode } from "@/lib/locations";
import { MAX_IMAGES_PER_LISTING } from "@/lib/config";
import { catalogModels, OTHER_BRAND, OTHER_MODEL } from "@/lib/catalog";
import type { PriceType, OfferType } from "@/generated/prisma/enums";

export type AttrValue = string | number | boolean | string[];

export interface ListingInput {
  categoryId: string;
  categoryPath: string[];
  title: string;
  description: string;
  priceCents: number | null;
  priceType: PriceType;
  offerType: OfferType;
  attributes: Record<string, AttrValue>;
  attrIndex: Record<string, string>;
  searchText: string;
  state: string;
  city: string;
  district: string | null;
  subdistrict: string | null;
  postalCode: string;
  showPhone: boolean;
  phone: string | null;
  imageIds: string[];
}

export type FieldErrors = Record<string, string>;

const str = (fd: FormData, k: string) => {
  const v = fd.get(k);
  return typeof v === "string" ? v.trim() : "";
};

/** Entfernt Steuerzeichen (außer Zeilenumbrüchen/Tabs) */
const clean = (s: string) => s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");

export function parseAttributes(fd: FormData, defs: readonly AttributeDef[], errors: FieldErrors) {
  const attributes: Record<string, AttrValue> = {};
  const attrIndex: Record<string, string> = {};
  for (const def of defs) {
    const name = `attr_${def.key}`;
    if (def.type === "multiselect") {
      const values = fd.getAll(name).filter((v): v is string => typeof v === "string" && (def.options ?? []).includes(v));
      if (values.length) attributes[def.key] = [...new Set(values)];
      else if (def.required) errors[name] = `Bitte „${def.label}“ auswählen.`;
      continue;
    }
    if (def.type === "boolean") {
      if (fd.get(name) === "on" || fd.get(name) === "1") attributes[def.key] = true;
      continue;
    }
    if (def.type === "model") {
      const brand = def.parent ? attributes[def.parent] : undefined;
      let model = clean(str(fd, name));
      if (model === OTHER_MODEL) model = clean(str(fd, `${name}_frei`)).replace(/\s+/g, " ");
      if (!model) {
        if (def.required && brand) errors[name] = `Bitte „${def.label}“ angeben.`;
        continue;
      }
      if (typeof brand !== "string") {
        errors[name] = "Bitte zuerst die Marke wählen.";
        continue;
      }
      const known = def.catalog ? catalogModels(def.catalog, brand) : [];
      const isFree = str(fd, name) === OTHER_MODEL || brand === OTHER_BRAND;
      if (!known.includes(model) && !isFree) {
        errors[name] = "Dieses Modell passt nicht zur gewählten Marke.";
        continue;
      }
      if (model.length > 60) {
        errors[name] = `„${def.label}“ darf höchstens 60 Zeichen haben.`;
        continue;
      }
      attributes[def.key] = model;
      attrIndex[def.key] = model.toLowerCase();
      continue;
    }
    const raw = clean(str(fd, name));
    if (!raw) {
      if (def.required) errors[name] = `Bitte „${def.label}“ angeben.`;
      continue;
    }
    if (def.type === "number") {
      const n = parseGermanNumber(raw);
      if (n === null) {
        errors[name] = `„${def.label}“ muss eine Zahl sein.`;
        continue;
      }
      if (!def.decimal && !Number.isInteger(n)) {
        errors[name] = `„${def.label}“ muss eine ganze Zahl sein.`;
        continue;
      }
      if ((def.min !== undefined && n < def.min) || (def.max !== undefined && n > def.max)) {
        errors[name] = `„${def.label}“ muss zwischen ${def.min ?? "–"} und ${def.max ?? "–"} liegen.`;
        continue;
      }
      attributes[def.key] = n;
    } else if (def.type === "select") {
      if (!(def.options ?? []).includes(raw)) {
        errors[name] = `Ungültige Auswahl bei „${def.label}“.`;
        continue;
      }
      attributes[def.key] = raw;
    } else {
      if (raw.length > 120) {
        errors[name] = `„${def.label}“ darf höchstens 120 Zeichen haben.`;
        continue;
      }
      attributes[def.key] = raw;
      attrIndex[def.key] = raw.toLowerCase();
    }
  }
  return { attributes, attrIndex };
}

export function buildSearchText(title: string, description: string, attributes: Record<string, AttrValue>, category: Category, location: string): string {
  const attrText = Object.values(attributes)
    .filter((v) => typeof v === "string" || Array.isArray(v))
    .flat()
    .join(" ");
  return [title, description, attrText, category.name, location].join(" ").toLowerCase().replace(/\s+/g, " ").slice(0, 20_000);
}

export function parseListingForm(fd: FormData): { input?: ListingInput; errors: FieldErrors } {
  const errors: FieldErrors = {};
  const categoryId = str(fd, "categoryId");
  const category = getCategory(categoryId);
  if (!category || !category.isLeaf) {
    return { errors: { categoryId: "Bitte eine gültige Unterkategorie wählen." } };
  }

  const title = clean(str(fd, "title")).replace(/\s+/g, " ");
  if (title.length < 5) errors.title = "Der Titel muss mindestens 5 Zeichen haben.";
  else if (title.length > 90) errors.title = "Der Titel darf höchstens 90 Zeichen haben.";
  else if (/(.)\1{7,}/.test(title)) errors.title = "Bitte keine Zeichenwiederholungen im Titel.";

  const description = clean(str(fd, "description").replace(/\r\n/g, "\n")).replace(/\n{4,}/g, "\n\n\n");
  if (description.length < 20) errors.description = "Die Beschreibung muss mindestens 20 Zeichen haben.";
  else if (description.length > 8000) errors.description = "Die Beschreibung darf höchstens 8.000 Zeichen haben.";

  const offerType: OfferType = str(fd, "offerType") === "WANTED" ? "WANTED" : "OFFER";

  // Preis
  let priceType: PriceType = "FIXED";
  let priceCents: number | null = null;
  const pt = str(fd, "priceType");
  if (category.priceMode === "free") {
    priceType = "FREE";
  } else if (category.priceMode === "none") {
    priceType = "ON_REQUEST";
  } else {
    priceType = (["FIXED", "NEGOTIABLE", "FREE", "ON_REQUEST"] as const).includes(pt as PriceType) ? (pt as PriceType) : "FIXED";
    if (priceType === "FIXED" || priceType === "NEGOTIABLE") {
      const rawPrice = str(fd, "price");
      const p = rawPrice ? parseGermanNumber(rawPrice) : null;
      if (rawPrice && p === null) errors.price = "Bitte einen gültigen Preis angeben (z. B. 1.250 oder 9,99).";
      else if (p !== null && (p < 0 || p > 1_000_000_000)) errors.price = "Der Preis liegt außerhalb des erlaubten Bereichs.";
      else if (p === null && category.priceMode === "required" && offerType === "OFFER") errors.price = `Bitte „${category.priceLabel}“ angeben.`;
      else if (p !== null) priceCents = Math.round(p * 100);
      if (p === null && !errors.price) priceType = "ON_REQUEST";
    }
  }

  // Merkmale (bei Gesuchen nicht verpflichtend)
  const defs = getCategoryAttributes(category.id).map((d) => (offerType === "WANTED" ? { ...d, required: false } : d));
  const { attributes, attrIndex } = parseAttributes(fd, defs, errors);

  // Standort
  const state = str(fd, "state");
  let city = clean(str(fd, "city")).replace(/\s+/g, " ");
  let district: string | null = str(fd, "district") || null;
  let subdistrict: string | null = str(fd, "subdistrict") || null;
  const postalCode = str(fd, "postalCode");
  if (!isValidState(state)) errors.state = "Bitte ein Bundesland wählen.";
  if (state === BERLIN) {
    city = BERLIN;
    if (!district || !isValidDistrict(district)) errors.district = "Bitte einen Berliner Bezirk wählen.";
    if (subdistrict && district && !isValidSubdistrict(district, subdistrict)) errors.subdistrict = "Der Ortsteil passt nicht zum Bezirk.";
    if (isValidPostalCode(postalCode) && !isBerlinPostalCode(postalCode)) errors.postalCode = "Diese Postleitzahl liegt nicht in Berlin.";
  } else {
    district = null;
    subdistrict = null;
    if (city.length < 2 || city.length > 60) errors.city = "Bitte einen Ort angeben.";
  }
  if (!isValidPostalCode(postalCode)) errors.postalCode = errors.postalCode ?? "Bitte eine gültige fünfstellige Postleitzahl angeben.";

  // Kontakt
  const showPhone = fd.get("showPhone") === "on";
  const phoneRaw = str(fd, "phone");
  const phone = phoneRaw ? phoneRaw.replace(/[^\d+()\/\-\s]/g, "").slice(0, 30) : null;
  if (showPhone && (!phone || phone.replace(/\D/g, "").length < 6)) errors.phone = "Bitte eine gültige Telefonnummer angeben.";

  // Bilder (bereits hochgeladene IDs in gewünschter Reihenfolge)
  const imageIds = [...new Set(fd.getAll("imageIds").filter((v): v is string => typeof v === "string" && /^[a-z0-9]{10,40}$/.test(v)))];
  if (imageIds.length > MAX_IMAGES_PER_LISTING) errors.images = `Maximal ${MAX_IMAGES_PER_LISTING} Bilder erlaubt.`;

  if (Object.keys(errors).length) return { errors };

  const searchText = buildSearchText(title, description, attributes, category, [postalCode, city, district, subdistrict].filter(Boolean).join(" "));

  return {
    errors,
    input: {
      categoryId: category.id,
      categoryPath: category.pathIds,
      title,
      description,
      priceCents: priceType === "FIXED" || priceType === "NEGOTIABLE" ? priceCents : null,
      priceType,
      offerType,
      attributes,
      attrIndex,
      searchText,
      state,
      city,
      district,
      subdistrict,
      postalCode,
      showPhone,
      phone: showPhone ? phone : null,
      imageIds,
    },
  };
}
