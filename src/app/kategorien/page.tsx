import type { Metadata } from "next";
import Link from "next/link";
import { getRootCategories, getChildren, categoryUrl, CATEGORY_COUNT, type Category } from "@/lib/categories";
import { CategoryIcon } from "@/components/Icon";

export const metadata: Metadata = { title: "Alle Kategorien", description: "Alle Kategorien von dasdiesdas im Überblick: Immobilien, Fahrzeuge, Boote, Flugzeuge, Maschinen, Jobs, Unterricht, Dienstleistungen, Tiere und mehr." };

function Tree({ cats }: { cats: Category[] }) {
  return (
    <ul className="ml-3 space-y-0.5 border-l border-line pl-3">
      {cats.map((c) => (
        <li key={c.id}>
          <Link href={categoryUrl(c.id)} className="text-sm text-ink-2 hover:text-brand-500 hover:underline">{c.name}</Link>
          {c.childIds.length > 0 && <Tree cats={getChildren(c.id)} />}
        </li>
      ))}
    </ul>
  );
}

export default function CategoriesPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Alle Kategorien <span className="text-base font-normal text-ink-3">({CATEGORY_COUNT})</span></h1>
      <div className="columns-1 gap-4 md:columns-2 xl:columns-3">
        {getRootCategories().map((r) => (
          <details key={r.id} className="card mb-4 break-inside-avoid p-4">
            <summary className="cursor-pointer text-lg font-semibold">
              <CategoryIcon categoryId={r.id} size={20} className="inline text-brand-600" /> {r.name}
            </summary>
            <Link href={categoryUrl(r.id)} className="link mt-2 mb-1 block text-sm">Alle Anzeigen in {r.name}</Link>
            <Tree cats={getChildren(r.id)} />
          </details>
        ))}
      </div>
    </div>
  );
}
