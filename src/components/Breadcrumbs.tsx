import Link from "next/link";

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Brotkrümelnavigation" className="text-sm text-ink-3">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1">
            {i > 0 && <span aria-hidden>›</span>}
            {it.href && i < items.length - 1 ? (
              <Link href={it.href} className="hover:text-brand-500 hover:underline">{it.label}</Link>
            ) : (
              <span className="font-medium text-ink-2" aria-current={i === items.length - 1 ? "page" : undefined}>{it.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
