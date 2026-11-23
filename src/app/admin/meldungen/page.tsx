import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/server/db";
import { resolveReportAction } from "@/app/actions/admin";
import { formatDateTime } from "@/lib/format";
import { first } from "@/lib/url";

export const metadata: Metadata = { title: "Meldungen", robots: { index: false } };

export default async function AdminReports(props: PageProps<"/admin/meldungen">) {
  const sp = await props.searchParams;
  const showAll = first(sp.alle) === "1";
  const reports = await db.report.findMany({
    where: showAll ? {} : { status: "OPEN" },
    orderBy: { createdAt: showAll ? "desc" : "asc" },
    take: 100,
    include: { listing: { select: { number: true, title: true, status: true } }, reporter: { select: { name: true } } },
  });
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">{showAll ? "Alle Meldungen" : "Offene Meldungen"}</h1>
        <Link href={showAll ? "/admin/meldungen" : "/admin/meldungen?alle=1"} className="link text-sm">{showAll ? "Nur offene anzeigen" : "Alle anzeigen (inkl. erledigte)"}</Link>
      </div>
      {reports.length === 0 && <div className="card p-8 text-center text-ink-2">Keine Meldungen.</div>}
      <ul className="space-y-3">
        {reports.map((r) => (
          <li key={r.id} className="card space-y-2 p-4">
            <div className="flex flex-wrap justify-between gap-2">
              <p className="font-semibold">
                {r.reason} – <Link href={`/anzeige/${r.listing.number}`} className="link" target="_blank">#{r.listing.number} {r.listing.title}</Link>
              </p>
              <span className="text-xs text-ink-3">{formatDateTime(r.createdAt)} · {r.status} · Anzeige: {r.listing.status}</span>
            </div>
            <p className="text-sm whitespace-pre-line text-ink-2">{r.details}</p>
            <p className="text-xs text-ink-3">Gemeldet von: {r.reporter?.name ?? "Gast"}{r.email ? ` (${r.email})` : ""}</p>
            {r.resolution && <p className="text-xs text-ink-2">Entscheidung: {r.resolution}</p>}
            {r.status === "OPEN" && (
              <form action={resolveReportAction} className="flex flex-wrap items-center gap-2 border-t border-line pt-2">
                <input type="hidden" name="id" value={r.id} />
                <input name="resolution" placeholder="Begründung der Entscheidung (wird mitgeteilt)" className="input max-w-md py-1 text-xs" />
                <button name="op" value="block" className="btn-danger py-1 text-xs">Anzeige sperren</button>
                <button name="op" value="dismiss" className="btn-outline py-1 text-xs">Kein Verstoß</button>
              </form>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
