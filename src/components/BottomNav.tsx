"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./Icon";

/** Untere Navigationsleiste für das Handy (wie in den Entwürfen) */
export function BottomNav({ unread }: { unread: number }) {
  const path = usePathname();
  const item = (href: string, icon: string, label: string, active: boolean, badge?: number) => (
    <Link href={href} className={`relative flex min-w-14 flex-col items-center gap-0.5 py-1 text-[11px] font-medium ${active ? "text-brand-600" : "text-ink-3"}`}>
      <Icon name={icon} size={23} />
      {label}
      {badge ? <span className="absolute -top-0.5 right-2 rounded-full bg-brand-600 px-1.5 text-[10px] font-bold text-white">{badge}</span> : null}
    </Link>
  );
  return (
    <nav aria-label="Hauptnavigation" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 pb-[max(env(safe-area-inset-bottom),8px)] backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-md items-end justify-around px-2 pt-1.5">
        {item("/", "home", "Start", path === "/")}
        {item("/anzeigen", "search", "Suchen", path.startsWith("/anzeigen"))}
        <Link href="/anzeige-aufgeben" aria-label="Anzeige aufgeben" className="-mt-7 flex flex-col items-center gap-0.5 text-[11px] font-semibold text-brand-600">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-brand-600 text-white shadow-lg shadow-brand-600/30">
            <Icon name="plus" size={28} strokeWidth={2.4} />
          </span>
          Inserieren
        </Link>
        {item("/konto/nachrichten", "chat", "Nachrichten", path.startsWith("/konto/nachrichten"), unread)}
        {item("/konto", "user", "Profil", path === "/konto" || (path.startsWith("/konto") && !path.startsWith("/konto/nachrichten")))}
      </div>
    </nav>
  );
}
