import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/server/db";
import { listingCardSelect, publicListingWhere } from "@/lib/server/search";
import { ListingGridCard } from "@/components/ListingCard";
import { Pagination } from "@/components/Pagination";
import { formatDate, formatNumber } from "@/lib/format";
import { PAGE_SIZE } from "@/lib/config";

type Props = PageProps<"/nutzer/[id]">;

async function load(id: string) {
  if (!/^[a-z0-9]{10,40}$/.test(id)) return null;
  return db.user.findFirst({
    where: { id, blockedAt: null },
    select: { id: true, name: true, accountType: true, companyName: true, companyAddress: true, vatId: true, imprint: true, createdAt: true, emailVerifiedAt: true },
  });
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const u = await load((await props.params).id);
  if (!u) return { title: "Nutzer nicht gefunden" };
  return { title: `Anzeigen von ${u.accountType === "COMMERCIAL" && u.companyName ? u.companyName : u.name}` };
}

export default async function UserPage(props: Props) {
  const { id } = await props.params;
  const sp = await props.searchParams;
  const u = await load(id);
  if (!u) notFound();
  const page = Math.max(1, Number(sp.seite) || 1);
  const where = { ...publicListingWhere(), userId: u.id };
  const [total, items] = await Promise.all([
    db.listing.count({ where }),
    db.listing.findMany({ where, select: listingCardSelect, orderBy: { publishedAt: "desc" }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
  ]);
  const display = u.accountType === "COMMERCIAL" && u.companyName ? u.companyName : u.name;

  return (
    <div className="space-y-4">
      <div className="card flex flex-wrap items-start justify-between gap-4 p-5">
        <div>
          <p className="text-xs text-ink-3 uppercase">{u.accountType === "COMMERCIAL" ? "Gewerblicher Anbieter" : "Privater Anbieter"}</p>
          <h1 className="text-2xl font-bold">{display}</h1>
          <p className="text-sm text-ink-3">Aktiv seit {formatDate(u.createdAt)} · {formatNumber(total)} aktive Anzeigen {u.emailVerifiedAt && "· ✓ E-Mail bestätigt"}</p>
        </div>
        {u.accountType === "COMMERCIAL" && (u.companyAddress || u.imprint) && (
          <div className="max-w-sm text-sm whitespace-pre-line text-ink-2">
            <p className="font-semibold text-ink">Impressum</p>
            {u.companyName && <p>{u.companyName}</p>}
            {u.companyAddress && <p>{u.companyAddress}</p>}
            {u.vatId && <p>USt-IdNr.: {u.vatId}</p>}
            {u.imprint && <p>{u.imprint}</p>}
          </div>
        )}
      </div>
      {items.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{items.map((l) => <ListingGridCard key={l.id} l={l} />)}</div>
      ) : (
        <div className="card p-8 text-center text-ink-2">Keine aktiven Anzeigen.</div>
      )}
      <Pagination page={page} pages={Math.max(1, Math.ceil(total / PAGE_SIZE))} hrefFor={(p) => `/nutzer/${u.id}${p > 1 ? `?seite=${p}` : ""}`} />
    </div>
  );
}
