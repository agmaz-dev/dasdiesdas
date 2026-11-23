import Link from "next/link";
import { getRootCategories, getChildren, categoryUrl } from "@/lib/categories";
import { formatNumber } from "@/lib/format";
import { CategoryIcon } from "./Icon";

export function CategorySidebar({ counts }: { counts: Record<string, number> }) {
  return (
    <nav aria-label="Kategorien" className="card divide-y divide-line">
      {getRootCategories().map((root) => (
        <details key={root.id} className="group">
          <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2.5 text-sm font-semibold text-ink hover:bg-surface-2">
            <CategoryIcon categoryId={root.id} size={18} className="w-6 text-brand-600" />
            <span className="flex-1">{root.name}</span>
            <span className="text-xs font-normal text-ink-3">{formatNumber(counts[root.id] ?? 0)}</span>
            <span aria-hidden className="text-ink-3 transition group-open:rotate-90">›</span>
          </summary>
          <ul className="pb-2">
            <li>
              <Link href={categoryUrl(root.id)} className="block px-11 py-1 text-sm font-medium text-brand-500 hover:underline">Alle in {root.name}</Link>
            </li>
            {getChildren(root.id).map((c) => (
              <li key={c.id}>
                <Link href={categoryUrl(c.id)} className="flex justify-between px-11 py-1 pr-3 text-sm text-ink-2 hover:bg-surface-2 hover:text-brand-500">
                  <span>{c.name}</span>
                  <span className="text-xs text-ink-3">{formatNumber(counts[c.id] ?? 0)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </details>
      ))}
    </nav>
  );
}
