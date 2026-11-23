import Link from "next/link";
import { Logo } from "./Logo";
import { SearchBar } from "./SearchBar";
import { HeaderSearch } from "./HeaderSearch";
import { UserMenu } from "./UserMenu";
import { BottomNav } from "./BottomNav";
import { Icon } from "./Icon";
import { getCurrentUser } from "@/lib/server/auth";
import { getUnreadCount } from "@/lib/server/messages";

const NAV = [
  ["/anzeigen", "Entdecken"],
  ["/anzeigen/immobilien/wohnen/mieten", "Mieten"],
  ["/anzeigen/fahrzeuge", "Fahrzeuge"],
  ["/anzeigen/handwerker-und-dienstleistungen", "Dienstleistungen"],
  ["/anzeigen/nachbarschaft-und-veranstaltungen", "Nachbarschaft"],
] as const;

export async function Header() {
  const user = await getCurrentUser();
  const unread = user ? await getUnreadCount(user.id) : 0;
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-page/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3">
          <Logo />
          <nav aria-label="Bereiche" className="hidden items-center gap-5 text-sm font-medium text-ink-2 xl:flex">
            {NAV.map(([href, label]) => <Link key={href} href={href} className="hover:text-ink">{label}</Link>)}
          </nav>
          <HeaderSearch><SearchBar /></HeaderSearch>
          <div className="ml-auto flex items-center gap-3">
            <Link href="/anzeige-aufgeben" className="hidden items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink hover:border-brand-600 md:inline-flex">
              <span className="grid h-6 w-6 place-items-center rounded-full border-2 border-brand-600 text-brand-600"><Icon name="plus" size={14} strokeWidth={2.6} /></span>
              Anzeige aufgeben
            </Link>
            {user ? (
              <UserMenu name={user.name} isAdmin={user.role === "ADMIN"} unread={unread} />
            ) : (
              <Link href="/anmelden" className="flex items-center gap-2 rounded-full border border-line px-3 py-2 text-sm font-medium text-ink-2 hover:text-ink">
                <Icon name="user" size={18} /> Anmelden
              </Link>
            )}
          </div>
        </div>
      </header>
      <BottomNav unread={unread} />
    </>
  );
}
