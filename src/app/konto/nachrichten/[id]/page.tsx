import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { formatDateTime, formatPrice } from "@/lib/format";
import { getCategory } from "@/lib/categories";
import { mediaUrl } from "@/lib/media";
import { Icon } from "@/components/Icon";
import { ReplyForm } from "./ReplyForm";

export const metadata: Metadata = { title: "Unterhaltung", robots: { index: false } };

const timeFmt = new Intl.DateTimeFormat("de-DE", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Berlin" });

export default async function ConversationPage(props: PageProps<"/konto/nachrichten/[id]">) {
  const { id } = await props.params;
  const user = await requireUser(`/konto/nachrichten/${id}`);
  const conv = await db.conversation.findFirst({
    where: { id, OR: [{ buyerId: user.id }, { sellerId: user.id }] },
    include: {
      listing: { select: { title: true, number: true, status: true, priceCents: true, priceType: true, categoryId: true, images: { take: 1, orderBy: { position: "asc" }, select: { thumb: true } } } },
      buyer: { select: { name: true, emailVerifiedAt: true } },
      seller: { select: { name: true, companyName: true, accountType: true, emailVerifiedAt: true } },
      messages: { orderBy: { createdAt: "asc" }, take: 500 },
    },
  });
  if (!conv) notFound();
  await db.message.updateMany({ where: { conversationId: conv.id, senderId: { not: user.id }, readAt: null }, data: { readAt: new Date() } });

  const iAmBuyer = conv.buyerId === user.id;
  const other = iAmBuyer ? (conv.seller.accountType === "COMMERCIAL" && conv.seller.companyName ? conv.seller.companyName : conv.seller.name) : conv.buyer.name;
  const otherVerified = !!(iAmBuyer ? conv.seller.emailVerifiedAt : conv.buyer.emailVerifiedAt);
  const l = conv.listing;
  const day = (d: Date) => d.toLocaleDateString("de-DE", { timeZone: "Europe/Berlin" });

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div className="card flex items-center gap-3 p-3">
        <Link href="/konto/nachrichten" aria-label="Zurück zu allen Nachrichten" className="grid h-9 w-9 place-items-center rounded-full text-ink-2 hover:bg-surface-2"><Icon name="chevron" size={20} className="rotate-180" /></Link>
        <span className="grid h-11 w-11 place-items-center rounded-full bg-surface-2 text-lg font-semibold text-ink uppercase">{other.slice(0, 1)}</span>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold text-ink">{other}</h1>
          {otherVerified && <p className="flex items-center gap-1 text-xs text-ink-3"><Icon name="shield" size={14} className="text-brand-600" /> Verifiziert (E-Mail bestätigt)</p>}
        </div>
      </div>

      <Link href={`/anzeige/${l.number}`} className="card flex items-center gap-3 p-3 hover:border-ink-3/60">
        <div className="h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-surface-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {l.images[0] && <img src={mediaUrl(l.images[0].thumb)} alt="" className="h-full w-full object-cover" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-ink">{l.title}</p>
          <p className="text-sm text-ink-3">{formatPrice(l.priceCents, l.priceType, getCategory(l.categoryId)?.priceUnit)}</p>
        </div>
        <span className="flex items-center gap-1 text-sm font-medium text-brand-500">Zur Anzeige <Icon name="chevron" size={15} /></span>
      </Link>

      <ol className="flex flex-col gap-2 py-2">
        {conv.messages.map((m, i) => {
          const mine = m.senderId === user.id;
          const showDay = i === 0 || day(conv.messages[i - 1].createdAt) !== day(m.createdAt);
          return (
            <li key={m.id} className="flex flex-col">
              {showDay && <p className="my-2 text-center text-xs text-ink-3">{formatDateTime(m.createdAt).split(",")[0]}</p>}
              <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed ${mine ? "rounded-br-md bg-brand-800 text-white" : "rounded-bl-md bg-surface-2 text-ink"}`}>
                  <p className="break-words whitespace-pre-line">{m.body}</p>
                  <p className={`mt-1 flex items-center justify-end gap-1 text-[11px] ${mine ? "text-white/75" : "text-ink-3"}`}>
                    {timeFmt.format(m.createdAt)}
                    {mine && (
                      <span aria-label={m.readAt ? "gelesen" : "zugestellt"} title={m.readAt ? "gelesen" : "zugestellt"} className={`flex ${m.readAt ? "text-brand-200" : "text-white/60"}`}>
                        <Icon name="check" size={13} strokeWidth={2.4} /><Icon name="check" size={13} strokeWidth={2.4} className="-ml-2" />
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {l.status === "BLOCKED" ? (
        <p className="text-sm text-ink-3">Diese Anzeige wurde gesperrt. Es können keine weiteren Nachrichten gesendet werden.</p>
      ) : (
        <ReplyForm conversationId={conv.id} />
      )}
      <p className="text-xs text-ink-3">
        Vorsicht bei Vorkasse, Zahlungslinks oder der Bitte, die Kommunikation auf andere Dienste zu verlagern. <Link href="/sicherheit" className="link">Sicherheitstipps</Link>
      </p>
    </div>
  );
}
