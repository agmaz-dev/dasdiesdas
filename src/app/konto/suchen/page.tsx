import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { deleteSavedSearchAction } from "@/app/actions/user-lists";
import { formatDate } from "@/lib/format";

function safeDecode(s: string) {
  try {
    return decodeURIComponent(s.replace(/\+/g, " "));
  } catch {
    return s;
  }
}

export const metadata: Metadata = { title: "Gespeicherte Suchen", robots: { index: false } };

export default async function SavedSearchesPage() {
  const user = await requireUser("/konto/suchen");
  const searches = await db.savedSearch.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Gespeicherte Suchen</h1>
      {searches.length === 0 && <div className="card p-8 text-center text-ink-2">Noch keine Suchen gespeichert. Nutzen Sie „Suche speichern“ in den Suchergebnissen.</div>}
      <ul className="card divide-y divide-line">
        {searches.map((s) => (
          <li key={s.id} className="flex items-center justify-between gap-3 p-3">
            <div className="min-w-0">
              <Link href={s.query} className="font-semibold hover:text-brand-500">{s.name}</Link>
              <p className="truncate text-xs text-ink-3">Gespeichert am {formatDate(s.createdAt)} · {safeDecode(s.query)}</p>
            </div>
            <form action={deleteSavedSearchAction}>
              <input type="hidden" name="id" value={s.id} />
              <button className="btn-outline py-1 text-xs text-red-300">Löschen</button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
