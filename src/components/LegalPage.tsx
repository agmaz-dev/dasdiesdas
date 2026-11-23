export function LegalPage({ title, updated, children }: { title: string; updated?: string; children: React.ReactNode }) {
  return (
    <article className="card prose-legal mx-auto max-w-3xl p-6 sm:p-8">
      <h1 className="mb-1 text-2xl font-bold text-ink">{title}</h1>
      {updated && <p className="mb-6 text-xs text-ink-3">Stand: {updated}</p>}
      {children}
    </article>
  );
}

/** Deutlich sichtbarer Platzhalter für fehlende Pflichtangaben */
export function Missing({ what }: { what: string }) {
  return <mark className="rounded bg-amber-500/25 px-1 text-amber-300">[{what} – bitte in .env eintragen]</mark>;
}
