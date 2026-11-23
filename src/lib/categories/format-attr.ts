import type { AttributeDef } from "./attributes";
import { formatNumber } from "@/lib/format";

/** Jahresfelder (Baujahr, Erstzulassung) ohne Tausenderpunkt darstellen */
export function isYearField(d: AttributeDef) {
  return d.type === "number" && (d.min ?? 0) >= 1000 && (d.max ?? 0) <= 2200;
}

export function formatAttributeValue(d: AttributeDef, v: unknown): string | null {
  if (v === undefined || v === null || v === "") return null;
  switch (d.type) {
    case "boolean":
      return v === true ? "Ja" : null;
    case "multiselect":
      return Array.isArray(v) && v.length ? v.join(", ") : null;
    case "number":
      if (typeof v !== "number") return null;
      return (isYearField(d) ? String(v) : formatNumber(v)) + (d.unit ? ` ${d.unit}` : "");
    default: // text, select, model
      return typeof v === "string" ? v : null;
  }
}

const SHORT: Record<string, string> = { erstzulassung: "EZ", baujahr: "Bj.", kilometer: "", zimmer: "Zi.", wohnflaeche: "", leistung: "" };

/** Kurzform für Vorschaukarten, z. B. "EZ 2018", "3 Zi.", "85 m²" */
export function formatAttributeShort(d: AttributeDef, v: unknown): string | null {
  const full = formatAttributeValue(d, v);
  if (!full || d.type === "boolean" || d.type === "multiselect") return null;
  if (d.type === "number") {
    // Geldbeträge ohne Bezeichnung wären in der Kurzansicht missverständlich
    if (d.unit === "€") return null;
    const prefix = SHORT[d.key];
    if (prefix === undefined) return d.unit ? full : `${full} ${d.label}`;
    if (d.key === "zimmer") return `${full} Zi.`;
    return prefix ? `${prefix} ${full}` : full;
  }
  return full.length <= 30 ? full : null;
}
