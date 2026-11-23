import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/auth";
import { moderateUserAction } from "@/app/actions/admin";
import { formatDate } from "@/lib/format";
import { first } from "@/lib/url";

export const metadata: Metadata = { title: "Nutzer verwalten", robots: { index: false } };

export default async function AdminUsers(props: PageProps<"/admin/nutzer">) {
  const sp = await props.searchParams;
  const me = await getCurrentUser();
  const q = first(sp.q).trim();
  const where: Prisma.UserWhereInput = q ? { OR: [{ email: { contains: q, mode: "insensitive" } }, { name: { contains: q, mode: "insensitive" } }, { companyName: { contains: q, mode: "insensitive" } }] } : {};
  const users = await db.user.findMany({ where, orderBy: { createdAt: "desc" }, take: 100, include: { _count: { select: { listings: true } } } });
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Nutzer</h1>
      <form className="card flex gap-2 p-3" method="get">
        <input name="q" defaultValue={q} placeholder="Name, E-Mail oder Firma" className="input max-w-sm" />
        <button className="btn-primary">Suchen</button>
      </form>
      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-surface-2 text-xs text-ink-3 uppercase">
            <tr><th className="p-2">Nutzer</th><th className="p-2">Art</th><th className="p-2">Anzeigen</th><th className="p-2">Seit</th><th className="p-2">Status</th><th className="p-2">Aktionen</th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.map((u) => (
              <tr key={u.id} className={u.blockedAt ? "bg-red-500/10" : ""}>
                <td className="p-2">
                  <Link href={`/nutzer/${u.id}`} className="font-medium hover:text-brand-500">{u.name}</Link>
                  <div className="text-xs text-ink-3">{u.email}{u.companyName ? ` · ${u.companyName}` : ""}</div>
                </td>
                <td className="p-2">{u.accountType === "COMMERCIAL" ? "Gewerblich" : "Privat"}{u.role === "ADMIN" && <span className="ml-1 rounded bg-brand-100 px-1 text-xs text-brand-800">Admin</span>}</td>
                <td className="p-2"><Link className="link" href={`/admin/anzeigen?q=${encodeURIComponent(u.email)}`}>{u._count.listings}</Link></td>
                <td className="p-2 whitespace-nowrap">{formatDate(u.createdAt)}</td>
                <td className="p-2 text-xs">
                  {u.blockedAt ? `Gesperrt${u.blockedReason ? `: ${u.blockedReason}` : ""}` : u.emailVerifiedAt ? "Aktiv" : "E-Mail unbestätigt"}
                </td>
                <td className="p-2">
                  {u.id !== me?.id && (
                    <form action={moderateUserAction} className="flex flex-wrap gap-1">
                      <input type="hidden" name="id" value={u.id} />
                      {u.blockedAt ? (
                        <button name="op" value="unblock" className="btn-outline py-1 text-xs">Entsperren</button>
                      ) : (
                        <>
                          <input name="reason" placeholder="Grund" className="input w-28 py-1 text-xs" />
                          <button name="op" value="block" className="btn-danger py-1 text-xs">Sperren</button>
                        </>
                      )}
                      {!u.emailVerifiedAt && <button name="op" value="verify" className="btn-outline py-1 text-xs">E-Mail bestätigen</button>}
                      {u.role === "ADMIN" ? (
                        <button name="op" value="remove-admin" className="btn-outline py-1 text-xs">Admin entziehen</button>
                      ) : (
                        <button name="op" value="make-admin" className="btn-outline py-1 text-xs">Zum Admin</button>
                      )}
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
