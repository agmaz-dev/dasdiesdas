import Link from "next/link";
import { ListingGridCard, ListingFeatureCard } from "@/components/ListingCard";
import { Wordmark } from "@/components/Logo";
import { CategoryIcon, Icon } from "@/components/Icon";
import { Notice } from "@/components/Notice";
import { db } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/auth";
import { getCategoryCounts, getFavoriteIds, listingCardSelect, publicListingWhere } from "@/lib/server/search";
import { getRootCategories, getChildren, categoryUrl } from "@/lib/categories";
import { DISTRICT_NAMES, STATE_NAMES } from "@/lib/locations";
import { formatNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

const PILLS = [
  { label: "Wohnungen", href: "/anzeigen/immobilien/wohnen/mieten", cat: "immobilien" },
  { label: "Autos", href: "/anzeigen/fahrzeuge/autos", cat: "fahrzeuge" },
  { label: "Möbel", href: "/anzeigen/haus-und-garten/moebel", cat: "haus-und-garten" },
  { label: "Elektronik", href: "/anzeigen/elektronik", cat: "elektronik" },
  { label: "Mode", href: "/anzeigen/mode-und-beauty", cat: "mode-und-beauty" },
  { label: "Dienstleistungen", href: "/anzeigen/handwerker-und-dienstleistungen", cat: "handwerker-und-dienstleistungen" },
  { label: "Jobs", href: "/anzeigen/jobs-und-stellenangebote", cat: "jobs-und-stellenangebote" },
  { label: "Nachhilfe", href: "/anzeigen/unterricht-und-kurse", cat: "unterricht-und-kurse" },
];

const ROUND = [
  { label: "Wohnen", href: "/anzeigen/immobilien", cat: "immobilien" },
  { label: "Fahrzeuge", href: "/anzeigen/fahrzeuge", cat: "fahrzeuge" },
  { label: "Elektronik", href: "/anzeigen/elektronik", cat: "elektronik" },
  { label: "Haushalt", href: "/anzeigen/haus-und-garten", cat: "haus-und-garten" },
  { label: "Jobs", href: "/anzeigen/jobs-und-stellenangebote", cat: "jobs-und-stellenangebote" },
  { label: "Nachhilfe", href: "/anzeigen/unterricht-und-kurse", cat: "unterricht-und-kurse" },
  { label: "Handwerk", href: "/anzeigen/handwerker-und-dienstleistungen", cat: "handwerker-und-dienstleistungen" },
];

function SectionTitle({ children, href, linkText = "Alle ansehen" }: { children: React.ReactNode; href: string; linkText?: string }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <h2 className="flex items-center gap-3 text-sm font-bold tracking-[0.15em] text-brand-600 uppercase">
        {children} <span aria-hidden className="h-px w-8 bg-brand-600" />
      </h2>
      <Link href={href} className="flex items-center gap-1 text-sm text-ink-2 hover:text-ink">{linkText} <Icon name="chevron" size={15} /></Link>
    </div>
  );
}

export default async function HomePage(props: PageProps<"/">) {
  const sp = await props.searchParams;
  const base = publicListingWhere();
  const [counts, premium, latest, berlin, total, user] = await Promise.all([
    getCategoryCounts(),
    db.listing.findMany({ where: { ...base, featured: true }, select: listingCardSelect, orderBy: { publishedAt: "desc" }, take: 8 }),
    db.listing.findMany({ where: base, select: listingCardSelect, orderBy: { publishedAt: "desc" }, take: 8 }),
    db.listing.findMany({ where: { ...base, state: "Berlin" }, select: listingCardSelect, orderBy: { publishedAt: "desc" }, take: 4 }),
    db.listing.count({ where: base }),
    getCurrentUser(),
  ]);
  const top = premium.length >= 4 ? premium : latest;
  const favs = await getFavoriteIds(user?.id, [...top, ...latest, ...berlin].map((l) => l.id));

  return (
    <div className="space-y-12">
      {sp["konto-geloescht"] === "1" && <Notice kind="success">Ihr Konto und alle zugehörigen Daten wurden gelöscht.</Notice>}

      {/* Hero */}
      <section className="flex flex-col items-center gap-4 text-center sm:gap-5 sm:pt-10">
        <h1 className="sr-only">dasdiesdas – Kleinanzeigen für Berlin und ganz Deutschland</h1>
        <span className="hidden sm:block"><Wordmark size={88} /></span>
        <p className="hidden text-sm font-semibold tracking-[0.35em] text-ink-2 uppercase sm:block">
          Finde, was <span className="text-teal">zählt</span>. Verkaufe, was <span className="text-brand-600">begeistert</span>.
        </p>
        <form action="/anzeigen" method="get" role="search" className="mt-2 flex w-full max-w-3xl flex-col gap-2 rounded-2xl border border-line bg-surface p-2 sm:flex-row sm:items-center sm:rounded-full sm:pl-5">
          <div className="flex flex-1 items-center gap-2 px-3 sm:px-0">
            <Icon name="search" size={20} className="text-ink-3" />
            <label htmlFor="home-q" className="sr-only">Suchbegriff</label>
            <input id="home-q" name="q" placeholder="Wonach suchst du? z. B. 2-Zimmer Kreuzberg" className="min-w-0 flex-1 bg-transparent py-3 text-base text-ink outline-none placeholder:text-ink-3" maxLength={100} />
          </div>
          <div className="flex items-center gap-2 border-line px-3 sm:border-l sm:px-4">
            <Icon name="pin" size={18} className="text-ink-3" />
            <label htmlFor="home-ort" className="sr-only">Ort</label>
            <select id="home-ort" name="bundesland" defaultValue="Berlin" className="bg-transparent py-3 text-sm font-medium text-ink outline-none">
              <option value="">Ganz Deutschland</option>
              {STATE_NAMES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button type="submit" className="flex items-center justify-center gap-2 rounded-full bg-brand-800 px-7 py-3 font-semibold text-white hover:bg-brand-600">
            Suchen <Icon name="chevron" size={18} />
          </button>
        </form>
        <p className="text-xs text-ink-3">{formatNumber(total)} aktive Anzeigen · kostenlos inserieren</p>

        {/* Kategorie-Pillen (Desktop) */}
        <nav aria-label="Schnellauswahl" className="hidden max-w-5xl flex-wrap justify-center gap-2 sm:flex">
          <Link href="/anzeigen" className="flex items-center gap-2 rounded-xl border border-brand-600 bg-brand-50 px-4 py-2.5 text-sm font-semibold text-brand-500"><Icon name="grid" size={17} /> Alle</Link>
          {PILLS.map((p) => (
            <Link key={p.href} href={p.href} className="flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-ink-2 hover:border-ink-3 hover:text-ink">
              <CategoryIcon categoryId={p.cat} size={17} /> {p.label}
            </Link>
          ))}
          <Link href="/kategorien" className="flex items-center gap-1 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-ink-2 hover:text-ink">Mehr <Icon name="chevron" size={15} /></Link>
        </nav>
      </section>

      {/* Runde Kategorien (Handy) */}
      <section className="sm:hidden">
        <div className="mb-3 flex items-center justify-between"><h2 className="font-semibold text-ink">Kategorien</h2><Link href="/kategorien" className="text-sm text-brand-500">Alle anzeigen ›</Link></div>
        <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-1">
          {ROUND.map((c) => (
            <Link key={c.href} href={c.href} className="flex shrink-0 flex-col items-center gap-1.5 text-xs text-ink-2">
              <span className="grid h-16 w-16 place-items-center rounded-full border border-line bg-surface text-brand-600"><CategoryIcon categoryId={c.cat} size={26} /></span>
              {c.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Premium / Empfohlen */}
      <section>
        <SectionTitle href="/anzeigen" linkText="Alle Anzeigen">{premium.length >= 4 ? "Premium-Anzeigen" : "Neueste Anzeigen"}</SectionTitle>
        {top.length ? (
          <>
            <div className="hidden gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-4">{top.map((l) => <ListingGridCard key={l.id} l={l} fav={favs.has(l.id)} />)}</div>
            <div className="space-y-3 sm:hidden">{top.slice(0, 6).map((l) => <ListingFeatureCard key={l.id} l={l} fav={favs.has(l.id)} />)}</div>
          </>
        ) : (
          <div className="card p-10 text-center">
            <p className="text-ink-2">Noch keine Anzeigen vorhanden.</p>
            <Link href="/anzeige-aufgeben" className="btn-primary mt-4">Erste Anzeige aufgeben</Link>
          </div>
        )}
      </section>

      {premium.length >= 4 && (
        <section>
          <SectionTitle href="/anzeigen?sort=neu">Neu eingestellt</SectionTitle>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">{latest.map((l) => <ListingGridCard key={l.id} l={l} fav={favs.has(l.id)} />)}</div>
        </section>
      )}

      {/* Berlin */}
      <section>
        <SectionTitle href="/anzeigen?bundesland=Berlin" linkText="Alle in Berlin">Neu in Berlin</SectionTitle>
        {berlin.length > 0 && <div className="mb-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">{berlin.map((l) => <ListingGridCard key={l.id} l={l} fav={favs.has(l.id)} />)}</div>}
        <div className="flex flex-wrap gap-2">
          {DISTRICT_NAMES.map((d) => (
            <Link key={d} href={`/anzeigen?bundesland=Berlin&bezirk=${encodeURIComponent(d)}`} className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm text-ink-2 hover:border-brand-600 hover:text-ink">{d}</Link>
          ))}
        </div>
      </section>

      {/* Alle Kategorien */}
      <section>
        <SectionTitle href="/kategorien" linkText="Kategorienübersicht">Alle Kategorien</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {getRootCategories().map((root) => (
            <div key={root.id} className="card p-4">
              <Link href={categoryUrl(root.id)} className="flex items-center gap-3 font-semibold text-ink hover:text-brand-500">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-surface-2 text-brand-600"><CategoryIcon categoryId={root.id} size={20} /></span>
                <span className="flex-1">{root.name}</span>
                <span className="text-xs font-normal text-ink-3">{formatNumber(counts[root.id] ?? 0)}</span>
              </Link>
              <ul className="mt-3 space-y-1 text-sm">
                {getChildren(root.id).slice(0, 5).map((c) => (
                  <li key={c.id}><Link href={categoryUrl(c.id)} className="text-ink-3 hover:text-ink">{c.name}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
