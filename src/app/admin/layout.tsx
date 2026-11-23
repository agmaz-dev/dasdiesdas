import Link from "next/link";
import { requireAdmin } from "@/lib/server/auth";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requireAdmin();
  return (
    <div className="space-y-4">
      <nav className="card flex flex-wrap gap-1 p-2 text-sm" aria-label="Administration">
        <span className="px-3 py-2 font-bold text-brand-800">Administration</span>
        {[["/admin", "Übersicht"], ["/admin/anzeigen?status=PENDING", "Freigaben"], ["/admin/anzeigen", "Alle Anzeigen"], ["/admin/meldungen", "Meldungen"], ["/admin/nutzer", "Nutzer"]].map(([href, label]) => (
          <Link key={href} href={href} className="rounded px-3 py-2 hover:bg-surface-2">{label}</Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
