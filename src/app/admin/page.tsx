import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/server/db";
import { formatNumber } from "@/lib/format";
import { moderationEnabled } from "@/lib/config";
import { publicListingWhere } from "@/lib/server/search";
import { requestNow } from "@/lib/time";

export const metadata: Metadata = { title: "Administration", robots: { index: false } };

export default async function AdminHome() {
  const dayAgo = new Date(requestNow() - 86_400_000);
  const [users, users24, active, pending, reports, listings24, messages24] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { createdAt: { gt: dayAgo } } }),
    db.listing.count({ where: publicListingWhere() }),
    db.listing.count({ where: { status: "PENDING" } }),
    db.report.count({ where: { status: "OPEN" } }),
    db.listing.count({ where: { createdAt: { gt: dayAgo } } }),
    db.message.count({ where: { createdAt: { gt: dayAgo } } }),
  ]);
  const tiles = [
    ["Nutzer gesamt", users, "/admin/nutzer"],
    ["Neue Nutzer (24 h)", users24, "/admin/nutzer"],
    ["Aktive Anzeigen", active, "/admin/anzeigen?status=ACTIVE"],
    ["Neue Anzeigen (24 h)", listings24, "/admin/anzeigen"],
    ["Warten auf Freigabe", pending, "/admin/anzeigen?status=PENDING"],
    ["Offene Meldungen", reports, "/admin/meldungen"],
    ["Nachrichten (24 h)", messages24, "/admin"],
  ] as const;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Übersicht</h1>
      <p className="text-sm text-ink-2">Vorab-Moderation neuer Anzeigen: <strong>{moderationEnabled() ? "aktiv" : "aus"}</strong> (Umgebungsvariable LISTING_MODERATION).</p>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {tiles.map(([label, value, href]) => (
          <Link key={label} href={href} className={`card p-4 hover:shadow-md ${(label === "Offene Meldungen" || label === "Warten auf Freigabe") && value > 0 ? "border-amber-500/40 bg-amber-500/10" : ""}`}>
            <p className="text-3xl font-bold text-brand-500">{formatNumber(value)}</p>
            <p className="text-sm text-ink-2">{label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
