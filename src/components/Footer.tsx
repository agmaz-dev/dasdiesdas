import Link from "next/link";
import { SITE } from "@/lib/config";
import { Wordmark } from "./Logo";

export function Footer() {
  const col = "space-y-1.5 text-sm";
  const a = "text-ink-3 hover:text-ink";
  return (
    <footer className="mt-16 border-t border-line bg-page pb-20 text-ink-3 md:pb-0">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Wordmark size={22} />
          <p className="mt-3 text-sm text-ink-3">{SITE.claim}.</p>
          <p className="mt-4 text-xs font-semibold tracking-[0.3em] text-ink-3 uppercase">Berlin<span className="text-brand-600">.</span> Alles<span className="text-teal">.</span> Einfach<span className="text-brand-600">.</span></p>
        </div>
        <div>
          <p className="mb-2 font-semibold text-white">Entdecken</p>
          <ul className={col}>
            <li><Link className={a} href="/kategorien">Alle Kategorien</Link></li>
            <li><Link className={a} href="/anzeigen?bundesland=Berlin">Anzeigen in Berlin</Link></li>
            <li><Link className={a} href="/anzeigen/immobilien">Immobilien</Link></li>
            <li><Link className={a} href="/anzeigen/fahrzeuge">Fahrzeuge</Link></li>
            <li><Link className={a} href="/anzeigen/jobs-und-stellenangebote">Jobs</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-2 font-semibold text-white">Hilfe & Sicherheit</p>
          <ul className={col}>
            <li><Link className={a} href="/hilfe">Hilfe & FAQ</Link></li>
            <li><Link className={a} href="/sicherheit">Sicherheitstipps</Link></li>
            <li><Link className={a} href="/hilfe#verbotene-artikel">Verbotene Artikel</Link></li>
            <li><Link className={a} href="/kontakt">Kontakt</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-2 font-semibold text-white">Rechtliches</p>
          <ul className={col}>
            <li><Link className={a} href="/impressum">Impressum</Link></li>
            <li><Link className={a} href="/datenschutz">Datenschutz</Link></li>
            <li><Link className={a} href="/agb">AGB & Nutzungsbedingungen</Link></li>
            <li><Link className={a} href="/hilfe#meldeverfahren">Inhalte melden (DSA)</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line py-4 text-center text-xs text-ink-3">
        © {new Date().getFullYear()} {SITE.domain} · Alle Angaben in Anzeigen stammen von den jeweiligen Anbietern.
      </div>
    </footer>
  );
}
