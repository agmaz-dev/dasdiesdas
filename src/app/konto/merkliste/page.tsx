import type { Metadata } from "next";
import { requireUser } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { listingCardSelect } from "@/lib/server/search";
import { isPubliclyVisible } from "@/lib/server/listings";
import { ListingRow } from "@/components/ListingCard";
import { removeFavoriteAction } from "@/app/actions/user-lists";

export const metadata: Metadata = { title: "Merkliste", robots: { index: false } };

export default async function FavoritesPage() {
  const user = await requireUser("/konto/merkliste");
  const favs = await db.favorite.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { listing: { select: { ...listingCardSelect, status: true, expiresAt: true, user: { select: { accountType: true, companyName: true, blockedAt: true } } } } },
  });
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Merkliste</h1>
      {favs.length === 0 && <div className="card p-8 text-center text-ink-2">Noch keine Anzeigen gemerkt. Klicken Sie auf einer Anzeige auf „♡ Merken“.</div>}
      <ul className="space-y-2">
        {favs.map(({ listing: l }) => {
          const visible = isPubliclyVisible(l);
          return (
            <li key={l.id} className="relative">
              {visible ? <ListingRow l={l} /> : <div className="card p-4 text-sm text-ink-3">„{l.title}“ ist nicht mehr verfügbar.</div>}
              <form action={removeFavoriteAction} className="absolute top-2 right-2">
                <input type="hidden" name="listingId" value={l.id} />
                <button className="rounded bg-surface/90 px-2 py-1 text-xs text-red-300 shadow hover:bg-surface">Entfernen</button>
              </form>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
