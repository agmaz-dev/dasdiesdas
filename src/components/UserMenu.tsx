"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { logoutAction } from "@/app/actions/auth";

export function UserMenu({ name, isAdmin, unread }: { name: string; isAdmin: boolean; unread: number }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const item = "block px-4 py-2.5 text-sm text-ink-2 hover:bg-surface-2 hover:text-ink";
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="relative flex items-center gap-2 rounded-full border border-line py-1 pr-3 pl-1 text-sm text-ink-2 hover:text-ink"
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-surface-2 font-semibold text-ink uppercase">{name.slice(0, 1)}</span>
        <span className="hidden max-w-32 truncate sm:inline">{name}</span>
        {unread > 0 && <span className="absolute top-0 left-6 h-2.5 w-2.5 rounded-full bg-brand-600 ring-2 ring-page" aria-label={`${unread} ungelesene Nachrichten`} />}
        <span aria-hidden>▾</span>
      </button>
      {open && (
        <div role="menu" className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-xl border border-line bg-surface py-1 shadow-2xl shadow-black/50"
          // Nur bei Links schließen – das Abmelde-Formular muss erst abgesendet werden
          onClick={(e) => { if ((e.target as HTMLElement).closest("a")) setOpen(false); }}
        >
          <Link href="/konto" className={item} role="menuitem">Mein Konto</Link>
          <Link href="/konto/anzeigen" className={item} role="menuitem">Meine Anzeigen</Link>
          <Link href="/konto/nachrichten" className={item} role="menuitem">
            Nachrichten {unread > 0 && <span className="ml-1 rounded-full bg-brand-600 px-1.5 text-xs font-bold text-white">{unread}</span>}
          </Link>
          <Link href="/konto/merkliste" className={item} role="menuitem">Merkliste</Link>
          <Link href="/konto/suchen" className={item} role="menuitem">Gespeicherte Suchen</Link>
          <Link href="/konto/einstellungen" className={item} role="menuitem">Einstellungen</Link>
          {isAdmin && <Link href="/admin" className={`${item} font-semibold text-brand-500`} role="menuitem">Administration</Link>}
          <form action={logoutAction} className="border-t border-line">
            <button type="submit" className={`${item} w-full text-left`} role="menuitem">Abmelden</button>
          </form>
        </div>
      )}
    </div>
  );
}
