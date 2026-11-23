import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FilterPanel } from "@/components/FilterPanel";
import { ListingRow } from "@/components/ListingCard";
import { Pagination } from "@/components/Pagination";
import { SortSelect } from "@/components/SortSelect";
import { SaveSearchButton } from "@/components/SaveSearchButton";
import { getAncestors, getCategory, getChildren, getRootCategories, getCategoryAttributes, categoryUrl } from "@/lib/categories";
import { catalogModels, OTHER_BRAND } from "@/lib/catalog";
import { searchListings, getSubcategoryCounts, getBrandModelCounts, getFavoriteIds, SORTS } from "@/lib/server/search";
import { getCurrentUser } from "@/lib/server/auth";
import { buildUrl, first } from "@/lib/url";
import { formatNumber } from "@/lib/format";
import { CategoryIcon } from "@/components/Icon";

type Props = PageProps<"/anzeigen/[[...slug]]">;

function resolveCategory(slug: string[] | undefined) {
  if (!slug || slug.length === 0) return { id: undefined };
  const id = slug.map((s) => decodeURIComponent(s)).join("/");
  const cat = getCategory(id);
  if (!cat) notFound();
  return { id, cat };
}

function locationLabel(sp: Record<string, string | string[] | undefined>) {
  const parts = [first(sp.ortsteil) || first(sp.bezirk), first(sp.ort), first(sp.bundesland)].filter(Boolean);
  return parts.length ? parts.join(", ") : "";
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params;
  const sp = await props.searchParams;
  const { cat } = resolveCategory(slug);
  const loc = locationLabel(sp);
  const what = cat ? cat.name : "Alle Anzeigen";
  return {
    title: `${what}${loc ? ` in ${loc}` : ""}${first(sp.q) ? ` – „${first(sp.q)}“` : ""}`,
    description: `${what}${loc ? ` in ${loc}` : " in Berlin und ganz Deutschland"}: aktuelle Kleinanzeigen auf dasdiesdas.`,
    robots: first(sp.q) || first(sp.seite) ? { index: false, follow: true } : undefined,
  };
}

export default async function SearchPage(props: Props) {
  const { slug } = await props.params;
  const sp = await props.searchParams;
  const { id, cat } = resolveCategory(slug);
  const base = id ? categoryUrl(id) : "/anzeigen";

  // Leere Parameter aus der Formularübertragung entfernen (saubere URLs)
  const emptyKeys = Object.entries(sp).filter(([, v]) => v === "" || (Array.isArray(v) && v.every((x) => x === ""))).map(([k]) => k);
  if (emptyKeys.length) redirect(buildUrl(base, sp, Object.fromEntries(emptyKeys.map((k) => [k, null]))));

  // Marke → Modell (z. B. Autos, Motorräder, Smartphones)
  const attrDefs = id ? getCategoryAttributes(id) : [];
  const brandDef = attrDefs.find((d) => d.catalog && d.type === "select");
  const modelDef = brandDef ? attrDefs.find((d) => d.type === "model" && d.parent === brandDef.key) : undefined;
  const selBrand = brandDef ? first(sp[`a_${brandDef.key}`]) : "";
  const selModel = modelDef ? first(sp[`a_${modelDef.key}`]) : "";

  const [result, subCounts, user, bm] = await Promise.all([
    searchListings(id, sp),
    getSubcategoryCounts(id, sp),
    getCurrentUser(),
    id && brandDef && modelDef ? getBrandModelCounts(id, sp, brandDef.key, modelDef.key) : Promise.resolve(null),
  ]);
  const favs = await getFavoriteIds(user?.id, result.items.map((l) => l.id));
  const children = id ? getChildren(id) : getRootCategories();
  const ancestors = id ? getAncestors(id) : [];
  const loc = locationLabel(sp);
  const crumbs = [{ label: "Startseite", href: "/" }, { label: "Alle Anzeigen", href: "/anzeigen" }, ...ancestors.map((a) => ({ label: a.name, href: categoryUrl(a.id) }))];
  const keepParams = (target: string) => buildUrl(target, sp, { seite: null });

  return (
    <div className="space-y-4">
      <Breadcrumbs items={crumbs} />
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <aside className="space-y-4">
          {children.length > 0 && (
            <nav aria-label="Unterkategorien" className="card p-4">
              <p className="mb-2 text-sm font-semibold text-ink">{cat ? cat.name : "Kategorien"}</p>
              {cat?.parentId && (
                <Link href={keepParams(categoryUrl(cat.parentId))} className="mb-1 block text-sm text-ink-3 hover:text-brand-500">‹ {getCategory(cat.parentId)?.name}</Link>
              )}
              {cat && !cat.parentId && (
                <Link href={keepParams("/anzeigen")} className="mb-1 block text-sm text-ink-3 hover:text-brand-500">‹ Alle Kategorien</Link>
              )}
              <ul className="max-h-[28rem] space-y-0.5 overflow-y-auto">
                {children.map((c) => (
                  <li key={c.id}>
                    <Link href={keepParams(categoryUrl(c.id))} className={`flex justify-between gap-2 rounded px-1 py-0.5 text-sm hover:bg-surface-2 hover:text-brand-500 ${subCounts[c.id] ? "text-ink-2" : "text-ink-3"}`}>
                      <span className="flex items-center gap-2">{!id && <CategoryIcon categoryId={c.id} size={16} className="text-brand-600" />}{c.name}</span>
                      <span className="text-xs">{formatNumber(subCounts[c.id] ?? 0)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
          {bm && brandDef && modelDef && (
            <nav aria-label={selBrand ? "Modelle" : "Marken"} className="card p-4">
              {!selBrand ? (
                <>
                  <p className="mb-2 text-sm font-semibold text-ink">{brandDef.label}</p>
                  <ul className="max-h-[28rem] space-y-0.5 overflow-y-auto">
                    {(brandDef.options ?? []).map((b) => (
                      <li key={b}>
                        <Link href={buildUrl(base, sp, { [`a_${brandDef.key}`]: b, [`a_${modelDef.key}`]: null, seite: null })} className={`flex justify-between gap-2 rounded px-1 py-0.5 text-sm hover:bg-surface-2 hover:text-brand-500 ${bm.brands[b] ? "text-ink-2" : "text-ink-3"}`}>
                          <span>{b}</span>
                          <span className="text-xs">{formatNumber(bm.brands[b] ?? 0)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <>
                  <Link href={buildUrl(base, sp, { [`a_${brandDef.key}`]: null, [`a_${modelDef.key}`]: null, seite: null })} className="mb-1 block text-sm text-ink-3 hover:text-brand-500">‹ Alle {brandDef.label === "Marke" ? "Marken" : "Hersteller"}</Link>
                  <p className="mb-2 text-sm font-semibold text-ink">{selBrand} – Modelle</p>
                  <ul className="max-h-[28rem] space-y-0.5 overflow-y-auto">
                    <li>
                      <Link href={buildUrl(base, sp, { [`a_${modelDef.key}`]: null, seite: null })} className={`flex justify-between gap-2 rounded px-1 py-0.5 text-sm hover:bg-surface-2 ${!selModel ? "font-semibold text-brand-500" : "text-ink-2"}`}>
                        <span>Alle Modelle</span>
                        <span className="text-xs">{formatNumber(bm.brands[selBrand] ?? 0)}</span>
                      </Link>
                    </li>
                    {[...new Set([...(modelDef.catalog && selBrand !== OTHER_BRAND ? catalogModels(modelDef.catalog, selBrand) : []), ...Object.keys(bm.models)])].map((m) => (
                      <li key={m}>
                        <Link href={buildUrl(base, sp, { [`a_${modelDef.key}`]: m, seite: null })} className={`flex justify-between gap-2 rounded px-1 py-0.5 text-sm hover:bg-surface-2 hover:text-brand-500 ${m === selModel ? "font-semibold text-brand-500" : bm.models[m] ? "text-ink-2" : "text-ink-3"}`}>
                          <span>{m}</span>
                          <span className="text-xs">{formatNumber(bm.models[m] ?? 0)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </nav>
          )}
          <FilterPanel categoryId={id} action={base} sp={sp} />
        </aside>

        <section aria-label="Suchergebnisse" className="min-w-0">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold">
                {cat ? cat.name : "Alle Anzeigen"}
                {selBrand && <> – {selBrand}{selModel && ` ${selModel}`}</>}
                {loc && <span className="font-normal text-ink-3"> in {loc}</span>}
              </h1>
              <p className="text-sm text-ink-3">
                {formatNumber(result.total)} {result.total === 1 ? "Ergebnis" : "Ergebnisse"}
                {first(sp.q) && <> für „{first(sp.q)}“</>}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <SaveSearchButton loggedIn={!!user} />
              <SortSelect value={result.sortKey} options={Object.entries(SORTS).map(([value, s]) => ({ value, label: s.label }))} />
            </div>
          </div>

          {result.items.length ? (
            <div className="space-y-3">
              {result.items.map((l) => <ListingRow key={l.id} l={l} fav={favs.has(l.id)} />)}
            </div>
          ) : (
            <div className="card p-10 text-center">
              <p className="font-semibold text-ink-2">Keine passenden Anzeigen gefunden.</p>
              <p className="mt-1 text-sm text-ink-3">Versuchen Sie es mit weniger Filtern oder einem anderen Suchbegriff.</p>
              <div className="mt-4 flex justify-center gap-2">
                <Link href={base} className="btn-outline">Filter zurücksetzen</Link>
                <Link href={id ? `/anzeige-aufgeben?kategorie=${encodeURIComponent(id)}` : "/anzeige-aufgeben"} className="btn-accent">Gesuch aufgeben</Link>
              </div>
            </div>
          )}

          <Pagination page={result.page} pages={result.pages} hrefFor={(p) => buildUrl(base, sp, { seite: p === 1 ? null : String(p) })} />
        </section>
      </div>
    </div>
  );
}
