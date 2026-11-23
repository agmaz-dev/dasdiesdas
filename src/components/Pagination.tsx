import Link from "next/link";

export function Pagination({ page, pages, hrefFor }: { page: number; pages: number; hrefFor: (p: number) => string }) {
  if (pages <= 1) return null;
  const nums = new Set<number>([1, pages, page - 2, page - 1, page, page + 1, page + 2]);
  const list = [...nums].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);
  const cls = "min-w-9 rounded-md border px-3 py-1.5 text-center text-sm";
  return (
    <nav aria-label="Seitennavigation" className="mt-6 flex flex-wrap items-center justify-center gap-1">
      {page > 1 && <Link className={`${cls} border-line bg-surface hover:bg-surface-2`} href={hrefFor(page - 1)} rel="prev">‹ Zurück</Link>}
      {list.map((n, i) => (
        <span key={n} className="flex items-center gap-1">
          {i > 0 && n - list[i - 1] > 1 && <span className="px-1 text-ink-3">…</span>}
          {n === page ? (
            <span className={`${cls} border-brand-700 bg-brand-700 font-semibold text-white`} aria-current="page">{n}</span>
          ) : (
            <Link className={`${cls} border-line bg-surface hover:bg-surface-2`} href={hrefFor(n)}>{n}</Link>
          )}
        </span>
      ))}
      {page < pages && <Link className={`${cls} border-line bg-surface hover:bg-surface-2`} href={hrefFor(page + 1)} rel="next">Weiter ›</Link>}
    </nav>
  );
}
