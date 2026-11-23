import { CAR_MODELS } from "./cars";
import { MOTORBIKE_MODELS } from "./motorbikes";
import { PHONE_MODELS, TABLET_MODELS } from "./phones";

/** Marken-/Modell-Kataloge. Schlüssel werden in den Merkmal-Definitionen referenziert. */
export const CATALOGS = {
  cars: CAR_MODELS,
  motorbikes: MOTORBIKE_MODELS,
  phones: PHONE_MODELS,
  tablets: TABLET_MODELS,
} as const;

export type CatalogKey = keyof typeof CATALOGS;

/** Auswahlwert für „Marke nicht in der Liste“ */
export const OTHER_BRAND = "Andere Marke";
/** Auswahlwert für „Modell nicht in der Liste“ (Freitext) */
export const OTHER_MODEL = "__anderes";

export function catalogBrands(key: CatalogKey): string[] {
  return [...Object.keys(CATALOGS[key]).sort((a, b) => a.localeCompare(b, "de")), OTHER_BRAND];
}

export function catalogModels(key: CatalogKey, brand: string): readonly string[] {
  return (CATALOGS[key] as Record<string, readonly string[]>)[brand] ?? [];
}
