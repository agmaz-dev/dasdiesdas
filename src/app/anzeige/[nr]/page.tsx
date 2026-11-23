import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Gallery } from "@/components/Gallery";
import { FavoriteButton } from "@/components/FavoriteButton";
import { PhoneReveal } from "@/components/PhoneReveal";
import { ContactForm } from "@/components/ContactForm";
import { ListingGridCard } from "@/components/ListingCard";
import { Notice } from "@/components/Notice";
import { getListingByNumber, isPubliclyVisible, STATUS_LABELS } from "@/lib/server/listings";
import { getCurrentUser } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { listingCardSelect, publicListingWhere } from "@/lib/server/search";
import { getAncestors, getCategory, getCategoryAttributes, categoryUrl } from "@/lib/categories";
import { formatAttributeValue } from "@/lib/categories/format-attr";
import { formatPrice, formatDate, formatDateTime, formatNumber } from "@/lib/format";
import { formatLocation } from "@/lib/locations";
import { SITE } from "@/lib/config";
import { Icon } from "@/components/Icon";

type Props = PageProps<"/anzeige/[nr]">;

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { nr } = await props.params;
  const l = await getListingByNumber(nr);
  if (!l || !isPubliclyVisible(l)) return { title: "Anzeige nicht verfügbar", robots: { index: false } };
  const cat = getCategory(l.categoryId);
  const price = formatPrice(l.priceCents, l.priceType, cat?.priceUnit);
  return {
    title: `${l.title}${price ? ` – ${price}` : ""}`,
    description: `${l.description.slice(0, 150).replace(/\s+/g, " ")} – ${formatLocation(l)}`,
    alternates: { canonical: `/anzeige/${l.number}` },
    openGraph: {
      title: l.title,
      description: l.description.slice(0, 200),
      images: l.images[0] ? [{ url: `${SITE.url}/media/${l.images[0].file}` }] : undefined,
    },
  };
}

export default async function ListingPage(props: Props) {
  const { nr } = await props.params;
  const sp = await props.searchParams;
  const l = await getListingByNumber(nr);
  if (!l) notFound();
  const user = await getCurrentUser();
  const isOwner = user?.id === l.userId;
  const isAdmin = user?.role === "ADMIN";
  const visible = isPubliclyVisible(l);
  if (!visible && !isOwner && !isAdmin) notFound();
  if (l.status === "DELETED" && !isAdmin) notFound();

  if (visible && !isOwner) {
    await db.listing.update({ where: { id: l.id }, data: { views: { increment: 1 } }, select: { id: true } });
  }

  const cat = getCategory(l.categoryId);
  const ancestors = getAncestors(l.categoryId);
  const attrs = (l.attributes ?? {}) as Record<string, unknown>;
  const facts = getCategoryAttributes(l.categoryId)
    .map((d) => ({ d, v: formatAttributeValue(d, attrs[d.key]) }))
    .filter((x): x is { d: (typeof x)["d"]; v: string } => x.v !== null);
  const factsMain = facts.filter((f) => f.d.type !== "boolean");
  const factsBool = facts.filter((f) => f.d.type === "boolean");

  const [isFav, similar, sellerCount] = await Promise.all([
    user ? db.favorite.findUnique({ where: { userId_listingId: { userId: user.id, listingId: l.id } } }).then(Boolean) : false,
    db.listing.findMany({
      where: { ...publicListingWhere(), categoryId: l.categoryId, id: { not: l.id } },
      select: listingCardSelect,
      orderBy: { publishedAt: "desc" },
      take: 4,
    }),
    db.listing.count({ where: { ...publicListingWhere(), userId: l.userId } }),
  ]);

  const price = formatPrice(l.priceCents, l.priceType, cat?.priceUnit);
  const seller = l.user;
  const sellerName = seller.accountType === "COMMERCIAL" && seller.companyName ? seller.companyName : seller.name;

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: "Startseite", href: "/" }, ...ancestors.map((a) => ({ label: a.name, href: categoryUrl(a.id) })), { label: `Anzeige ${l.number}` }]} />

      {sp.neu === "1" && (
        <Notice kind="success">
          {l.status === "PENDING" ? "Ihre Anzeige wurde gespeichert und wird nach einer kurzen Prüfung freigeschaltet." : "Ihre Anzeige ist jetzt online. Viel Erfolg!"}
        </Notice>
      )}
      {!visible && (
        <Notice kind="warning">
          Status: <strong>{STATUS_LABELS[l.status]}</strong>
          {l.status === "ACTIVE" && l.expiresAt && l.expiresAt <= new Date() && " (abgelaufen – bitte verlängern)"}
          {l.rejectReason && <> – Grund: {l.rejectReason}</>}. Diese Anzeige ist für andere Nutzer nicht sichtbar.
        </Notice>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <article className="min-w-0 space-y-4">
          <div className="card p-4">
            <h1 className="text-xl font-bold text-ink sm:text-2xl">{l.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
              {price && <p className="text-2xl font-extrabold text-brand-500">{price}</p>}
              {l.offerType === "WANTED" && <span className="rounded bg-violet-500/15 px-2 py-0.5 text-sm font-medium text-violet-300">Gesuch</span>}
              {cat && cat.priceMode !== "none" && l.priceCents !== null && cat.priceLabel !== "Preis" && <span className="text-sm text-ink-3">{cat.priceLabel}</span>}
            </div>
            <p className="mt-1 flex items-center gap-1 text-sm text-ink-3"><Icon name="pin" size={15} className="text-brand-600" /> {formatLocation(l)}{l.district ? `, ${l.postalCode}` : ""}</p>
          </div>

          <Gallery images={l.images} title={l.title} />

          <section className="card p-4">
            <h2 className="mb-3 text-lg font-semibold">Details</h2>
            <dl className="grid grid-cols-1 gap-x-6 text-sm sm:grid-cols-2">
              <div className="flex justify-between gap-4 border-b border-line py-1.5"><dt className="text-ink-3">Anzeigennummer</dt><dd className="font-medium">{l.number}</dd></div>
              {l.publishedAt && <div className="flex justify-between gap-4 border-b border-line py-1.5"><dt className="text-ink-3">Online seit</dt><dd className="font-medium">{formatDate(l.publishedAt)}</dd></div>}
              <div className="flex justify-between gap-4 border-b border-line py-1.5"><dt className="text-ink-3">Kategorie</dt><dd className="text-right font-medium"><Link className="link" href={categoryUrl(l.categoryId)}>{cat?.name}</Link></dd></div>
              <div className="flex justify-between gap-4 border-b border-line py-1.5"><dt className="text-ink-3">Anbieter</dt><dd className="font-medium">{seller.accountType === "COMMERCIAL" ? "Gewerblich" : "Privat"}</dd></div>
              {factsMain.map(({ d, v }) => (
                <div key={d.key} className="flex justify-between gap-4 border-b border-line py-1.5"><dt className="text-ink-3">{d.label}</dt><dd className="text-right font-medium">{v}</dd></div>
              ))}
            </dl>
            {factsBool.length > 0 && (
              <>
                <h3 className="mt-4 mb-2 font-semibold">Ausstattung & Merkmale</h3>
                <ul className="grid grid-cols-1 gap-1 text-sm sm:grid-cols-2">
                  {factsBool.map(({ d }) => <li key={d.key} className="flex items-center gap-2"><Icon name="check" size={15} className="text-teal" />{d.label}</li>)}
                </ul>
              </>
            )}
          </section>

          <section className="card p-4">
            <h2 className="mb-3 text-lg font-semibold">Beschreibung</h2>
            <div className="text-sm leading-relaxed break-words whitespace-pre-line text-ink-2">{l.description}</div>
          </section>

          {similar.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold">Ähnliche Anzeigen</h2>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {similar.map((s) => <ListingGridCard key={s.id} l={s} />)}
              </div>
            </section>
          )}
        </article>

        <aside className="space-y-4">
          <div className="card space-y-3 p-4">
            <div>
              <p className="text-xs text-ink-3 uppercase">{seller.accountType === "COMMERCIAL" ? "Gewerblicher Anbieter" : "Privater Anbieter"}</p>
              <Link href={`/nutzer/${seller.id}`} className="text-lg font-semibold hover:text-brand-500">{sellerName}</Link>
              <p className="text-xs text-ink-3">Aktiv seit {formatDate(seller.createdAt)} · {formatNumber(sellerCount)} aktive Anzeigen</p>
              {seller.emailVerifiedAt && <p className="flex items-center gap-1 text-xs text-ink-3"><Icon name="shield" size={14} className="text-brand-600" /> Verifiziert (E-Mail bestätigt)</p>}
            </div>
            {isOwner ? (
              <div className="space-y-2">
                <Link href={`/anzeige/${l.number}/bearbeiten`} className="btn-primary w-full">Anzeige bearbeiten</Link>
                <Link href="/konto/anzeigen" className="btn-outline w-full">Meine Anzeigen verwalten</Link>
                <p className="text-xs text-ink-3">{formatNumber(l.views)} Aufrufe{l.expiresAt && ` · läuft bis ${formatDate(l.expiresAt)}`}</p>
              </div>
            ) : visible ? (
              <>
                {l.showPhone && l.phone && <PhoneReveal phone={l.phone} />}
                <ContactForm listingId={l.id} title={l.title} />
              </>
            ) : null}
            {!isOwner && <FavoriteButton listingId={l.id} initial={isFav} loginHref={`/anmelden?weiter=/anzeige/${l.number}`} />}
          </div>

          {seller.accountType === "COMMERCIAL" && (
            <div className="card p-4 text-sm">
              <h2 className="mb-2 font-semibold">Impressum des Anbieters</h2>
              {seller.imprint || seller.companyAddress ? (
                <div className="space-y-1 whitespace-pre-line text-ink-2">
                  {seller.companyName && <p className="font-medium">{seller.companyName}</p>}
                  {seller.companyAddress && <p>{seller.companyAddress}</p>}
                  {seller.vatId && <p>USt-IdNr.: {seller.vatId}</p>}
                  {seller.imprint && <p>{seller.imprint}</p>}
                </div>
              ) : (
                <p className="text-ink-3">Der Anbieter hat noch kein Impressum hinterlegt.</p>
              )}
            </div>
          )}

          <div className="card p-4 text-sm text-ink-2">
            <h2 className="mb-2 font-semibold text-ink">Sicher handeln</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>Keine Vorauszahlung per Überweisung oder Gutschein an Unbekannte.</li>
              <li>Möglichst persönlich treffen und Ware vor Ort prüfen.</li>
              <li>Niemals Codes, Ausweiskopien oder Zugangsdaten weitergeben.</li>
            </ul>
            <Link href="/sicherheit" className="link mt-2 inline-block">Mehr Sicherheitstipps</Link>
          </div>

          <div className="text-center text-xs text-ink-3">
            Zuletzt aktualisiert: {formatDateTime(l.updatedAt)} ·{" "}
            <Link href={`/melden/${l.number}`} className="link">Anzeige melden</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
