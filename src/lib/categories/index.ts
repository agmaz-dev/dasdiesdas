import { CATEGORY_TREE, type CategoryNode, type PriceMode } from "./tree";
import { getAttributeSet, type AttributeDef, type AttributeSetKey } from "./attributes";

export type { AttributeDef, PriceMode };

export interface Category {
  /** Eindeutige ID = Slug-Pfad, z. B. "immobilien/wohnen/mieten/wohnung" */
  id: string;
  slug: string;
  name: string;
  icon?: string;
  parentId: string | null;
  depth: number;
  childIds: string[];
  /** IDs von der Wurzel bis einschließlich dieser Kategorie */
  pathIds: string[];
  attrSet?: AttributeSetKey;
  priceMode: PriceMode;
  priceUnit?: string;
  priceLabel: string;
  isLeaf: boolean;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/ğ/g, "g")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ç/g, "c")
    .replace(/&/g, " und ")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const byId = new Map<string, Category>();
const roots: string[] = [];

function walk(
  nodes: CategoryNode[],
  parent: Category | null,
  inherited: { attrs?: AttributeSetKey; price: PriceMode; priceUnit?: string; priceLabel: string },
) {
  for (const node of nodes) {
    const slug = node.slug ?? slugify(node.name);
    const id = parent ? `${parent.id}/${slug}` : slug;
    if (byId.has(id)) throw new Error(`Doppelte Kategorie-ID: ${id}`);
    const inh = {
      attrs: node.attrs ?? inherited.attrs,
      price: node.price ?? inherited.price,
      priceUnit: node.priceUnit ?? inherited.priceUnit,
      priceLabel: node.priceLabel ?? inherited.priceLabel,
    };
    const cat: Category = {
      id,
      slug,
      name: node.name,
      icon: node.icon ?? parent?.icon,
      parentId: parent?.id ?? null,
      depth: parent ? parent.depth + 1 : 0,
      childIds: [],
      pathIds: parent ? [...parent.pathIds, id] : [id],
      attrSet: inh.attrs,
      priceMode: inh.price,
      priceUnit: inh.priceUnit,
      priceLabel: inh.priceLabel,
      isLeaf: !node.children || node.children.length === 0,
    };
    byId.set(id, cat);
    if (parent) parent.childIds.push(id);
    else roots.push(id);
    if (node.children) walk(node.children, cat, inh);
  }
}

walk(CATEGORY_TREE, null, { price: "required", priceLabel: "Preis" });

export function getCategory(id: string | null | undefined): Category | undefined {
  if (!id) return undefined;
  return byId.get(id);
}

export function getRootCategories(): Category[] {
  return roots.map((id) => byId.get(id)!);
}

export function getChildren(id: string): Category[] {
  return (byId.get(id)?.childIds ?? []).map((c) => byId.get(c)!);
}

export function getAncestors(id: string): Category[] {
  const cat = byId.get(id);
  if (!cat) return [];
  return cat.pathIds.map((p) => byId.get(p)!);
}

export function getAllCategories(): Category[] {
  return [...byId.values()];
}

export function getCategoryAttributes(id: string): readonly AttributeDef[] {
  return getAttributeSet(byId.get(id)?.attrSet);
}

/** Vollständiger Name, z. B. "Immobilien › Wohnen › Mieten › Wohnung" */
export function getCategoryLabel(id: string, sep = " › "): string {
  return getAncestors(id).map((c) => c.name).join(sep);
}

export function categoryUrl(id: string): string {
  return `/anzeigen/${id}`;
}

/** Summiert Anzeigenzahlen je Blattkategorie auf alle Vorfahren */
export function aggregateCounts(leafCounts: Record<string, number>): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const [id, count] of Object.entries(leafCounts)) {
    const cat = byId.get(id);
    if (!cat) continue;
    for (const p of cat.pathIds) totals[p] = (totals[p] ?? 0) + count;
  }
  return totals;
}

export const CATEGORY_COUNT = byId.size;
