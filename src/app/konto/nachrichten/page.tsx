import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { formatRelativeDay } from "@/lib/format";
import { mediaUrl } from "@/lib/media";

export const metadata: Metadata = { title: "Nachrichten", robots: { index: false } };

export default async function InboxPage() {
  const user = await requireUser("/konto/nachrichten");
  const convs = await db.conversation.findMany({
    where: { OR: [{ buyerId: user.id }, { sellerId: user.id }] },
    orderBy: { updatedAt: "desc" },
    take: 200,
    include: {
      listing: { select: { title: true, number: true, images: { take: 1, orderBy: { position: "asc" }, select: { thumb: true } } } },
      buyer: { select: { name: true } },
      seller: { select: { name: true, companyName: true, accountType: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1, select: { body: true, createdAt: true, senderId: true } },
      _count: { select: { messages: { where: { readAt: null, senderId: { not: user.id } } } } },
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Nachrichten</h1>
      {convs.length === 0 ? (
        <div className="card p-8 text-center text-ink-2">Noch keine Nachrichten. Schreiben Sie Anbietern direkt über die Anzeigenseite.</div>
      ) : (
        <ul className="card divide-y divide-line">
          {convs.map((c) => {
            const other = c.buyerId === user.id ? (c.seller.accountType === "COMMERCIAL" && c.seller.companyName ? c.seller.companyName : c.seller.name) : c.buyer.name;
            const last = c.messages[0];
            const unread = c._count.messages;
            return (
              <li key={c.id}>
                <Link href={`/konto/nachrichten/${c.id}`} className={`flex gap-3 p-3 hover:bg-surface-2 ${unread ? "bg-brand-50/60" : ""}`}>
                  <div className="h-14 w-16 shrink-0 overflow-hidden rounded bg-surface-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {c.listing.images[0] && <img src={mediaUrl(c.listing.images[0].thumb)} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-2">
                      <p className={`truncate text-sm ${unread ? "font-bold" : "font-semibold"}`}>{other}</p>
                      {last && <span className="shrink-0 text-xs text-ink-3">{formatRelativeDay(last.createdAt)}</span>}
                    </div>
                    <p className="truncate text-xs text-ink-3">{c.listing.title} · {c.buyerId === user.id ? "Ihre Anfrage" : "Anfrage an Sie"}</p>
                    {last && <p className="truncate text-sm text-ink-2">{last.senderId === user.id ? "Sie: " : ""}{last.body}</p>}
                  </div>
                  {unread > 0 && <span className="self-center rounded-full bg-accent-500 px-2 text-xs font-bold text-white">{unread}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
