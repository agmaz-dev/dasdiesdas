export type SP = Record<string, string | string[] | undefined>;

/** Baut eine URL aus Basis + Suchparametern; overrides mit null entfernen einen Parameter */
export function buildUrl(base: string, sp: SP, overrides: Record<string, string | null> = {}): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (k in overrides || v === undefined) continue;
    for (const item of Array.isArray(v) ? v : [v]) if (item !== "") params.append(k, item);
  }
  for (const [k, v] of Object.entries(overrides)) if (v !== null && v !== "") params.set(k, v);
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

export const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
export const all = (v: string | string[] | undefined) => (Array.isArray(v) ? v : v ? [v] : []);
