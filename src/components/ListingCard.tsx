import Link from "next/link";
import type { ListingCard as Card } from "@/lib/server/search";
import { getCategory, getCategoryAttributes } from "@/lib/categories";
import { formatPrice, formatTimeAgo } from "@/lib/format";
import { formatAttributeShort } from "@/lib/categories/format-attr";
import { mediaUrl } from "@/lib/media";
import { CategoryIcon, Icon } from "./Icon";
import { HeartButton } from "./HeartButton";
import { requestNow } from "@/lib/time";

/** Bis zu drei aussagekräftige Merkmale (Marke + Modell zusammengefasst) */
function keyFacts(l: Card): string[] {
  const attrs = (l.attributes ?? {}) as Record<string, unknown>;
  const defs = getCategoryAttributes(l.categoryId);
  const facts: string[] = [];
  for (const d of defs) {
    if (facts.length >= 3) break;
    if (d.type === "model") continue;
    if (d.catalog) {
      const model = defs.find((m) => m.type === "model" && m.parent === d.key);
      const text = [attrs[d.key], model ? attrs[model.key] : undefined].filter((x) => typeof x === "string").join(" ");
      if (text) facts.push(text);
      continue;
    }
    const f = formatAttributeShort(d, attrs[d.key]);
    if (f) facts.push(f);
  }
  return facts;
}

const shortLocation = (l: Card) => (l.district ? `${l.subdistrict ?? l.district}, Berlin` : `${l.city}`);
const rootName = (l: Card) => getCategory(l.categoryId.split("/")[0])?.name ?? "";
const isNew = (l: Card) => !!l.publishedAt && requestNow() - new Date(l.publishedAt).getTime() < 86_400_000;

function Badge({ l }: { l: Card }) {
  if (l.featured) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/65 px-2.5 py-1 text-[11px] font-bold tracking-wide text-white uppercase backdrop-blur">
        <Icon name="star" size={12} className="fill-brand-600 text-brand-600" /> Premium
      </span>
    );
  }
  if (isNew(l)) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/65 px-2.5 py-1 text-[11px] font-bold tracking-wide text-white uppercase backdrop-blur">
        <span className="h-2 w-2 rounded-full bg-emerald-400" /> Neu
      </span>
    );
  }
  if (l.offerType === "WANTED") {
    return <span className="rounded-full border border-teal/40 bg-black/65 px-2.5 py-1 text-[11px] font-bold text-teal uppercase">Gesuch</span>;
  }
  return null;
}

function Photo({ l, className, sizes = "thumb" }: { l: Card; className: string; sizes?: "thumb" }) {
  void sizes;
  const img = l.images[0];
  return (
    <div className={`relative overflow-hidden bg-surface-2 ${className}`}>
      {img ? (
        // eslint-disable-next-line @next/next/no-img-element -- Bilder sind serverseitig optimiert
        <img src={mediaUrl(img.thumb)} alt="" loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
      ) : (
        <div className="grid h-full w-full place-items-center text-ink-3"><CategoryIcon categoryId={l.categoryId} size={36} /></div>
      )}
    </div>
  );
}

function CategoryTag({ l }: { l: Card }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-teal">
      <CategoryIcon categoryId={l.categoryId} size={14} /> {rootName(l)}
    </span>
  );
}

/** Karte im Raster (Desktop) – Bild oben, Titel + Preis darunter */
export function ListingGridCard({ l, fav = false }: { l: Card; fav?: boolean }) {
  const cat = getCategory(l.categoryId);
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition hover:border-ink-3/60">
      <div className="relative">
        <Photo l={l} className="aspect-[4/3]" />
        <div className="absolute top-3 left-3"><Badge l={l} /></div>
        <HeartButton listingId={l.id} initial={fav} className="absolute top-3 right-3 z-10" />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-[15px] leading-snug font-semibold text-ink">
            <Link href={`/anzeige/${l.number}`} className="after:absolute after:inset-0">{l.title}</Link>
          </h3>
          <p className="shrink-0 text-right text-[15px] font-bold whitespace-nowrap text-ink">
            {formatPrice(l.priceCents, l.priceType, null)}
            {cat?.priceUnit && l.priceCents !== null && <span className="block text-[11px] font-normal text-ink-3">{cat.priceUnit}</span>}
          </p>
        </div>
        <p className="flex items-center gap-1 text-xs text-ink-3"><Icon name="pin" size={13} /> {shortLocation(l)}</p>
        <div className="mt-auto pt-1"><CategoryTag l={l} /></div>
      </div>
    </article>
  );
}

/** Große Bildkarte mit Text auf dem Foto (Handy-Startseite) */
export function ListingFeatureCard({ l, fav = false }: { l: Card; fav?: boolean }) {
  const cat = getCategory(l.categoryId);
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-line bg-surface">
      <Photo l={l} className="aspect-[16/10]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
      <div className="absolute top-3 left-3"><Badge l={l} /></div>
      <HeartButton listingId={l.id} initial={fav} className="absolute top-3 right-3 z-10" />
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-3.5">
        <h3 className="line-clamp-1 font-semibold text-white">
          <Link href={`/anzeige/${l.number}`} className="after:absolute after:inset-0">{l.title}</Link>
        </h3>
        <p className="flex items-center gap-1 text-xs text-white/80"><Icon name="pin" size={13} className="text-brand-600" /> {shortLocation(l)}</p>
        <div className="flex items-end justify-between gap-2">
          <p className="text-xl font-extrabold text-brand-600">
            {formatPrice(l.priceCents, l.priceType, null)}
            {cat && l.priceCents !== null && <span className="ml-1.5 text-xs font-medium text-white/80">{cat.priceUnit ?? cat.priceLabel}</span>}
          </p>
          {l.publishedAt && <span className="flex items-center gap-1 text-xs text-white/70"><Icon name="clock" size={13} /> {formatTimeAgo(l.publishedAt, requestNow())}</span>}
        </div>
      </div>
    </article>
  );
}

/** Listeneintrag (Suchergebnisse) – Bild links, Infos rechts */
export function ListingRow({ l, fav = false }: { l: Card; fav?: boolean }) {
  const cat = getCategory(l.categoryId);
  const facts = keyFacts(l);
  return (
    <article className="group relative flex overflow-hidden rounded-2xl border border-line bg-surface transition hover:border-ink-3/60">
      <div className="relative w-36 shrink-0 sm:w-56">
        <Photo l={l} className="h-full min-h-32 sm:min-h-40" />
        {l._count.images > 0 && <span className="absolute top-2 left-2 rounded-md bg-black/65 px-1.5 py-0.5 text-[11px] font-medium text-white">1/{l._count.images}</span>}
        <div className="absolute bottom-2 left-2"><Badge l={l} /></div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1 p-3 pr-12 sm:p-4 sm:pr-14">
        <p className="text-lg font-extrabold text-brand-600">
          {formatPrice(l.priceCents, l.priceType, null)}
          {cat?.priceUnit && l.priceCents !== null && <span className="ml-1 text-xs font-medium text-ink-3">{cat.priceUnit}</span>}
        </p>
        <h3 className="line-clamp-2 font-semibold text-ink">
          <Link href={`/anzeige/${l.number}`} className="after:absolute after:inset-0">{l.title}</Link>
        </h3>
        {facts.length > 0 && <p className="truncate text-sm text-ink-2">{facts.join(" · ")}</p>}
        <p className="flex flex-wrap items-center gap-x-1 text-xs text-ink-3">
          <Icon name="pin" size={13} /> {shortLocation(l)}
          {l.publishedAt && <> · {formatTimeAgo(l.publishedAt, requestNow())}</>}
          {l.user.accountType === "COMMERCIAL" && <> · Gewerblich</>}
        </p>
        <div className="mt-auto flex justify-end pt-1">
          <span className="rounded-full border border-teal/50 px-2.5 py-0.5"><CategoryTag l={l} /></span>
        </div>
      </div>
      <HeartButton listingId={l.id} initial={fav} className="absolute top-3 right-3 z-10" />
    </article>
  );
}
