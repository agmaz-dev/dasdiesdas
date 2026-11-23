import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma } from "@/generated/prisma/client";
import type { ListingStatus } from "@/generated/prisma/enums";
import { db } from "@/lib/server/db";
import { moderateListingAction } from "@/app/actions/admin";
import { STATUS_LABELS } from "@/lib/server/listings";
import { getCategoryLabel, getCategory } from "@/lib/categories";
import { formatDateTime, formatPrice } from "@/lib/format";
import { formatLocation } from "@/lib/locations";
import { mediaUrl } from "@/lib/media";
import { Pagination } from "@/components/Pagination";
import { buildUrl, first } from "@/lib/url";

export const metadata: Metadata = { title: "Anzeigen verwalten", robots: { index: false } };
const STATUSES = Object.keys(STATUS_LABELS) as ListingStatus[];

export default async function AdminListings(props: PageProps<"/admin/anzeigen">) {
  const sp = await props.searchParams;
  const status = STATUSES.includes(first(sp.status) as ListingStatus) ? (first(sp.status) as ListingStatus) : undefined;
  const q = first(sp.q).trim();
  const page = Math.max(1, Number(first(sp.seite)) || 1);
  const where: Prisma.ListingWhereInput = {
    ...(status ? { status } : {}),
    ...(q ? (/^\d+$/.test(q) ? { number: Number(q) } : { OR: [{ searchText: { contains: q.toLowerCase() } }, { user: { email: { contains: q, mode: "insensitive" } } }] }) : {}),
  };
  const take = 30;
  const [total, items] = await Promise.all([
    db.listing.count({ where }),
    db.listing.findMany({
      where,
      orderBy: { createdAt: status === "PENDING" ? "asc" : "desc" },
      skip: (page - 1) * take,
      take,
      include: { user: { select: { id: true, name: true, email: true, accountType: true } }, images: { take: 3, orderBy: { position: "asc" }, select: { thumb: true } }, _count: { select: { reports: { where: { status: "OPEN" } } } } },
    }),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Anzeigen {status && `– ${STATUS_LABELS[status]}`} <span className="text-base font-normal text-ink-3">({total})</span></h1>
      <form className="card flex flex-wrap gap-2 p-3" method="get">
        <input name="q" defaultValue={q} placeholder="Nr., Text oder E-Mail des Anbieters" className="input max-w-xs" />
        <select name="status" defaultValue={status ?? ""} className="input max-w-48">
          <option value="">Alle Status</option>
          {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
        <button className="btn-primary">Filtern</button>
      </form>
      <ul className="space-y-3">
        {items.map((l) => (
          <li key={l.id} className="card space-y-2 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <Link href={`/anzeige/${l.number}`} className="font-semibold hover:text-brand-500" target="_blank">#{l.number} {l.title}</Link>
                <p className="text-xs text-ink-3">{getCategoryLabel(l.categoryId)} · {formatLocation(l)} · {formatPrice(l.priceCents, l.priceType, getCategory(l.categoryId)?.priceUnit)}</p>
                <p className="text-xs text-ink-3">
                  von <Link href={`/admin/nutzer?q=${encodeURIComponent(l.user.email)}`} className="link">{l.user.name} ({l.user.email})</Link> · {l.user.accountType === "COMMERCIAL" ? "gewerblich" : "privat"} · erstellt {formatDateTime(l.createdAt)}
                </p>
              </div>
              <div className="flex gap-2 text-xs">
                <span className="rounded bg-surface-2 px-2 py-0.5 font-medium">{STATUS_LABELS[l.status]}</span>
                {l.featured && <span className="rounded bg-brand-50 px-2 py-0.5 font-medium text-brand-500">★ Premium</span>}
                {l._count.reports > 0 && <Link href="/admin/meldungen" className="rounded bg-red-500/15 px-2 py-0.5 font-medium text-red-300">{l._count.reports} Meldung(en)</Link>}
              </div>
            </div>
            <div className="flex gap-2">
              {l.images.map((i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i.thumb} src={mediaUrl(i.thumb)} alt="" className="h-16 w-20 rounded object-cover" />
              ))}
            </div>
            <p className="line-clamp-3 text-sm whitespace-pre-line text-ink-2">{l.description}</p>
            {l.rejectReason && <p className="text-xs text-red-300">Grund: {l.rejectReason}</p>}
            {l.status !== "DELETED" && (
              <form action={moderateListingAction} className="flex flex-wrap items-center gap-2 border-t border-line pt-2">
                <input type="hidden" name="id" value={l.id} />
                {l.status !== "ACTIVE" && <button name="op" value="approve" className="btn-primary py-1 text-xs">Freigeben</button>}
                <input name="reason" placeholder="Begründung (für Ablehnen/Sperren)" className="input max-w-sm py-1 text-xs" />
                {l.status === "PENDING" && <button name="op" value="reject" className="btn-outline py-1 text-xs">Ablehnen</button>}
                {l.status !== "BLOCKED" && <button name="op" value="block" className="btn-danger py-1 text-xs">Sperren</button>}
                <button name="op" value={l.featured ? "unfeature" : "feature"} className="btn-outline py-1 text-xs">{l.featured ? "Premium entfernen" : "★ Als Premium markieren"}</button>
              </form>
            )}
          </li>
        ))}
      </ul>
      {items.length === 0 && <div className="card p-8 text-center text-ink-2">Keine Anzeigen gefunden.</div>}
      <Pagination page={page} pages={Math.max(1, Math.ceil(total / take))} hrefFor={(p) => buildUrl("/admin/anzeigen", sp, { seite: p > 1 ? String(p) : null })} />
    </div>
  );
}
