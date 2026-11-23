// Formatierung (Server und Client).

const eurWhole = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const eurCents = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 });
const num = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 2 });

export function formatEuro(cents: number): string {
  return cents % 100 === 0 ? eurWhole.format(cents / 100) : eurCents.format(cents / 100);
}

export function formatNumber(n: number): string {
  return num.format(n);
}

export type PriceTypeValue = "FIXED" | "NEGOTIABLE" | "FREE" | "ON_REQUEST";

export function formatPrice(priceCents: number | null | undefined, priceType: PriceTypeValue, unit?: string | null): string {
  if (priceType === "FREE") return "Zu verschenken";
  if (priceType === "ON_REQUEST" || priceCents == null) return priceType === "ON_REQUEST" ? "Preis auf Anfrage" : "";
  const base = formatEuro(priceCents) + (unit ? ` ${unit}` : "");
  return priceType === "NEGOTIABLE" ? `${base} VB` : base;
}

export const PRICE_TYPE_LABELS: Record<PriceTypeValue, string> = {
  FIXED: "Festpreis",
  NEGOTIABLE: "Verhandlungsbasis (VB)",
  FREE: "Zu verschenken",
  ON_REQUEST: "Preis auf Anfrage",
};

const dateFmt = new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Berlin" });
const dateTimeFmt = new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Berlin" });
const timeFmt = new Intl.DateTimeFormat("de-DE", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Berlin" });

export function formatDate(d: Date | string): string {
  return dateFmt.format(new Date(d));
}

export function formatDateTime(d: Date | string): string {
  return dateTimeFmt.format(new Date(d));
}

/** "Heute, 14:05" / "Gestern, 09:12" / "12.11.2026" */
export function formatRelativeDay(d: Date | string): string {
  const date = new Date(d);
  const key = (x: Date) => dateFmt.format(x);
  const now = new Date();
  const yesterday = new Date(now.getTime() - 86_400_000);
  if (key(date) === key(now)) return `Heute, ${timeFmt.format(date)}`;
  if (key(date) === key(yesterday)) return `Gestern, ${timeFmt.format(date)}`;
  return key(date);
}

/** Parst deutsche Zahleneingaben: "1.234,56" → 1234.56, "12,5" → 12.5, "1500" → 1500 */
export function parseGermanNumber(raw: string): number | null {
  const s = raw.trim().replace(/\s|€/g, "");
  if (!s) return null;
  let normalized = s;
  if (/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(s)) normalized = s.replace(/\./g, "").replace(",", ".");
  else if (/^-?\d+(,\d+)?$/.test(s)) normalized = s.replace(",", ".");
  else if (!/^-?\d+(\.\d+)?$/.test(s)) return null;
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

export function pluralize(n: number, one: string, many: string) {
  return `${formatNumber(n)} ${n === 1 ? one : many}`;
}

/** "vor 5 Min.", "vor 2 Std.", "vor 3 Tagen", sonst Datum */
export function formatTimeAgo(d: Date | string, now: number = Date.now()): string {
  const diff = Math.max(0, now - new Date(d).getTime());
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "gerade eben";
  if (min < 60) return `vor ${min} Min.`;
  const h = Math.floor(min / 60);
  if (h < 24) return `vor ${h} Std.`;
  const days = Math.floor(h / 24);
  if (days < 7) return days === 1 ? "vor 1 Tag" : `vor ${days} Tagen`;
  return formatDate(d);
}
