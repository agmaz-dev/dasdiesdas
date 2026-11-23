import Link from "next/link";
import { getRootCategories, getChildren, getAncestors, getAllCategories, getCategoryLabel, type Category } from "@/lib/categories";
import { CategorySearch } from "./CategorySearch";
import { CategoryIcon } from "./Icon";

/** Schrittweise Kategorieauswahl (Spaltenansicht) */
export function CategoryPicker({ selected, hrefBase }: { selected?: Category; hrefBase: string }) {
  const path = selected ? getAncestors(selected.id) : [];
  const columns: { parent?: Category; items: Category[] }[] = [{ items: getRootCategories() }];
  for (const p of path) if (!p.isLeaf) columns.push({ parent: p, items: getChildren(p.id) });
  const leaves = getAllCategories().filter((c) => c.isLeaf).map((c) => ({ id: c.id, label: getCategoryLabel(c.id) }));

  return (
    <div className="space-y-4">
      <div className="card p-5"><CategorySearch leaves={leaves} hrefBase={hrefBase} /></div>
      <div className="card overflow-x-auto">
        <div className="flex min-h-80 divide-x divide-line">
          {columns.map((col, i) => (
            <ul key={i} className="w-64 shrink-0 py-1">
              {col.parent && <li className="px-3 py-1 text-xs font-semibold text-ink-3 uppercase">{col.parent.name}</li>}
              {col.items.map((c) => {
                const active = path.some((p) => p.id === c.id);
                return (
                  <li key={c.id}>
                    <Link href={`${hrefBase}${encodeURIComponent(c.id)}`} className={`flex items-center justify-between gap-2 px-3 py-1.5 text-sm ${active ? "bg-brand-700 text-white" : "hover:bg-surface-2"}`}>
                      <span className="flex items-center gap-2">{i === 0 && <CategoryIcon categoryId={c.id} size={17} />}{c.name}</span>
                      {!c.isLeaf && <span aria-hidden>›</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          ))}
        </div>
      </div>
    </div>
  );
}
