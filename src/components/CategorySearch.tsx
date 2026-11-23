"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export function CategorySearch({ leaves, hrefBase }: { leaves: { id: string; label: string }[]; hrefBase: string }) {
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    const terms = q.toLowerCase().trim().split(/\s+/).filter((t) => t.length >= 2);
    if (!terms.length) return [];
    return leaves.filter((l) => terms.every((t) => l.label.toLowerCase().includes(t))).slice(0, 30);
  }, [q, leaves]);
  return (
    <div>
      <label htmlFor="cat-search" className="label">Kategorie suchen</label>
      <input id="cat-search" className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="z. B. Segelboot, Nachhilfe Mathe, Bagger, Wohnung mieten" autoComplete="off" />
      {results.length > 0 && (
        <ul className="mt-2 max-h-80 divide-y divide-line overflow-y-auto rounded-md border border-line bg-surface">
          {results.map((r) => (
            <li key={r.id}>
              <Link href={`${hrefBase}${encodeURIComponent(r.id)}`} className="block px-3 py-2 text-sm hover:bg-brand-50">{r.label}</Link>
            </li>
          ))}
        </ul>
      )}
      {q.trim().length >= 2 && results.length === 0 && <p className="mt-2 text-sm text-ink-3">Keine Kategorie gefunden. Wählen Sie unten schrittweise aus.</p>}
    </div>
  );
}
