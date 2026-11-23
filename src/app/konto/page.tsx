import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { getUnreadCount } from "@/lib/server/messages";
import { Notice } from "@/components/Notice";
import { ResendVerification } from "@/components/ResendVerification";
import { formatNumber } from "@/lib/format";
import { Icon } from "@/components/Icon";

export const metadata: Metadata = { title: "Mein Konto", robots: { index: false } };

export default async function AccountPage(props: PageProps<"/konto">) {
  const sp = await props.searchParams;
  const user = await requireUser("/konto");
  const [active, pending, favs, unread] = await Promise.all([
    db.listing.count({ where: { userId: user.id, status: "ACTIVE", expiresAt: { gt: new Date() } } }),
    db.listing.count({ where: { userId: user.id, status: "PENDING" } }),
    db.favorite.count({ where: { userId: user.id } }),
    getUnreadCount(user.id),
  ]);
  const tiles = [
    { label: "Aktive Anzeigen", value: active, href: "/konto/anzeigen" },
    { label: "In Prüfung", value: pending, href: "/konto/anzeigen" },
    { label: "Ungelesene Nachrichten", value: unread, href: "/konto/nachrichten" },
    { label: "Gemerkte Anzeigen", value: favs, href: "/konto/merkliste" },
  ];
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Hallo {user.name}!</h1>
      {sp.willkommen === "1" && <Notice kind="success">Ihr Konto wurde erstellt. Wir haben Ihnen eine E-Mail zur Bestätigung gesendet.</Notice>}
      {sp.passwort === "1" && <Notice kind="success">Ihr Passwort wurde geändert.</Notice>}
      {!user.emailVerified && (
        <Notice kind="warning">
          Ihre E-Mail-Adresse <strong>{user.email}</strong> ist noch nicht bestätigt. Erst danach können Sie Anzeigen aufgeben und Nachrichten senden. <ResendVerification />
        </Notice>
      )}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((t) => (
          <Link key={t.label} href={t.href} className="card p-4 hover:shadow-md">
            <p className="text-3xl font-bold text-brand-500">{formatNumber(t.value)}</p>
            <p className="text-sm text-ink-2">{t.label}</p>
          </Link>
        ))}
      </div>
      <nav aria-label="Kontobereich" className="card divide-y divide-line md:hidden">
        {[["/konto/anzeigen", "Meine Anzeigen"], ["/konto/nachrichten", "Nachrichten"], ["/konto/merkliste", "Merkliste"], ["/konto/suchen", "Gespeicherte Suchen"], ["/konto/einstellungen", "Einstellungen"]].map(([href, label]) => (
          <Link key={href} href={href} className="flex items-center justify-between px-4 py-3.5 text-ink-2 hover:text-ink">{label}<Icon name="chevron" size={18} className="text-ink-3" /></Link>
        ))}
      </nav>
      <div className="flex flex-wrap gap-2">
        <Link href="/anzeige-aufgeben" className="btn-accent"><Icon name="plus" size={18} /> Neue Anzeige aufgeben</Link>
        <Link href={`/nutzer/${user.id}`} className="btn-outline">Mein öffentliches Profil</Link>
      </div>
    </div>
  );
}
