import { redirect } from "next/navigation";
import { getCategory } from "@/lib/categories";

/** Ziel des Suchformulars im Header: leitet auf die passende Kategorieseite um */
export function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim().slice(0, 100);
  const kat = url.searchParams.get("kategorie") ?? "";
  const base = getCategory(kat) ? `/anzeigen/${kat}` : "/anzeigen";
  redirect(q ? `${base}?q=${encodeURIComponent(q)}` : base);
}
