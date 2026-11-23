import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { manageListingAction } from "@/app/actions/listings";
import { STATUS_LABELS } from "@/lib/server/listings";
import { getCategory, getCategoryLabel } from "@/lib/categories";
import { formatDate, formatNumber, formatPrice } from "@/lib/format";
import { mediaUrl } from "@/lib/media";
import { ConfirmButton } from "@/components/ConfirmButton";
import { requestNow } from "@/lib/time";
import { Icon, CategoryIcon } from "@/components/Icon";

export const metadata: Metadata = { title: "Meine Anzeigen", robots: { index: false } };

const STATUS_STYLE: Record<string, string> = {
  ACTIVE: "bg-emerald-500/15 text-emerald-300",
  PENDING: "bg-amber-500/15 text-amber-300",
  REJECTED: "bg-red-500/15 text-red-300",
  INACTIVE: "bg-line text-ink-2",
  BLOCKED: "bg-red-500/25 text-red-300",
  EXPIRED: "bg-line text-ink-2",
};

export default async function MyListingsPage() {
  const user = await requireUser("/konto/anzeigen");
  const listings = await db.listing.findMany({
    where: { userId: user.id, status: { not: "DELETED" } },
    orderBy: { createdAt: "desc" },
    include: { images: { take: 1, orderBy: { position: "asc" }, select: { thumb: true } }, _count: { select: { favorites: true, conversations: true } } },
  });
  const now = requestNow();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Meine Anzeigen</h1>
        <Link href="/anzeige-aufgeben" className="btn-accent"><Icon name="plus" size={18} /> Neue Anzeige</Link>
      </div>
      {listings.length === 0 && <div className="card p-8 text-center text-ink-2">Sie haben noch keine Anzeigen.</div>}
      <ul className="space-y-2">
        {listings.map((l) => {
          const expired = l.status === "ACTIVE" && (!l.expiresAt || l.expiresAt.getTime() < now);
          const statusKey = expired ? "EXPIRED" : l.status;
          const canExtend = (l.status === "ACTIVE" || l.status === "INACTIVE") && (!l.expiresAt || l.expiresAt.getTime() - now < 7 * 86_400_000);
          const op = (name: string, label: string, cls = "btn-outline py-1 text-xs") => (
            <form action={manageListingAction}>
              <input type="hidden" name="id" value={l.id} />
              <input type="hidden" name="op" value={name} />
              <button className={cls}>{label}</button>
            </form>
          );
          return (
            <li key={l.id} className="card flex flex-col gap-3 p-3 sm:flex-row">
              <div className="h-20 w-28 shrink-0 overflow-hidden rounded bg-surface-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {l.images[0] ? <img src={mediaUrl(l.images[0].thumb)} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-2xl text-ink-3"><CategoryIcon categoryId={l.categoryId} size={26} /></div>}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/anzeige/${l.number}`} className="font-semibold hover:text-brand-500">{l.title}</Link>
                  <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${STATUS_STYLE[statusKey]}`}>{expired ? "Abgelaufen" : STATUS_LABELS[l.status]}</span>
                </div>
                <p className="truncate text-xs text-ink-3">{getCategoryLabel(l.categoryId)}</p>
                <p className="text-sm font-semibold text-brand-500">{formatPrice(l.priceCents, l.priceType, getCategory(l.categoryId)?.priceUnit)}</p>
                <p className="text-xs text-ink-3">
                  Nr. {l.number} · {formatNumber(l.views)} Aufrufe · {l._count.favorites} gemerkt · {l._count.conversations} Anfragen
                  {l.expiresAt && ` · läuft bis ${formatDate(l.expiresAt)}`}
                </p>
                {l.rejectReason && (l.status === "REJECTED" || l.status === "BLOCKED") && <p className="mt-1 text-xs text-red-300">Grund: {l.rejectReason}</p>}
              </div>
              <div className="flex flex-wrap items-start gap-1 sm:w-56 sm:justify-end">
                {l.status !== "BLOCKED" && <Link href={`/anzeige/${l.number}/bearbeiten`} className="btn-outline py-1 text-xs">Bearbeiten</Link>}
                {l.status === "ACTIVE" && !expired && op("deactivate", "Deaktivieren")}
                {l.status === "INACTIVE" && op("activate", "Aktivieren")}
                {canExtend && op("extend", "Verlängern", "btn-primary py-1 text-xs")}
                <form action={manageListingAction}>
                  <input type="hidden" name="id" value={l.id} />
                  <input type="hidden" name="op" value="delete" />
                  <ConfirmButton message="Anzeige endgültig löschen? Bilder werden entfernt." className="btn-outline py-1 text-xs text-red-300">Löschen</ConfirmButton>
                </form>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
