import { getRootCategories } from "@/lib/categories";
import { Icon } from "./Icon";

export function SearchBar({ defaultQuery = "", defaultCategory = "" }: { defaultQuery?: string; defaultCategory?: string }) {
  const roots = getRootCategories();
  const rootOfDefault = defaultCategory.split("/")[0];
  return (
    <form action="/suche" method="get" role="search" className="flex w-full items-center overflow-hidden rounded-xl border border-line bg-surface-2 pl-3">
      <Icon name="search" size={18} className="shrink-0 text-ink-3" />
      <label htmlFor="header-q" className="sr-only">Suchbegriff</label>
      <input id="header-q" name="q" defaultValue={defaultQuery} placeholder="Suchen in Berlin und ganz Deutschland …" className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-ink outline-none placeholder:text-ink-3" maxLength={100} />
      <label htmlFor="header-kat" className="sr-only">Kategorie</label>
      <select id="header-kat" name="kategorie" defaultValue={rootOfDefault} className="hidden max-w-40 border-l border-line bg-transparent px-2 py-2 text-sm text-ink-2 outline-none lg:block">
        <option value="">Alle Kategorien</option>
        {roots.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <button type="submit" className="self-stretch bg-brand-800 px-4 text-sm font-semibold text-white hover:bg-brand-600">Suchen</button>
    </form>
  );
}
