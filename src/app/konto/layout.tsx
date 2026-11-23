import Link from "next/link";
import { requireUser } from "@/lib/server/auth";

const NAV = [
  ["/konto", "Übersicht"],
  ["/konto/anzeigen", "Meine Anzeigen"],
  ["/konto/nachrichten", "Nachrichten"],
  ["/konto/merkliste", "Merkliste"],
  ["/konto/suchen", "Gespeicherte Suchen"],
  ["/konto/einstellungen", "Einstellungen"],
] as const;

export default async function AccountLayout({ children }: LayoutProps<"/konto">) {
  await requireUser("/konto");
  return (
    <div className="grid gap-6 md:grid-cols-[220px_1fr]">
      <nav aria-label="Kontobereich" className="card hidden h-fit p-2 md:block">
        <ul className="flex flex-wrap gap-1 md:flex-col">
          {NAV.map(([href, label]) => (
            <li key={href}><Link href={href} className="block rounded px-3 py-2 text-sm text-ink-2 hover:bg-surface-2 hover:text-brand-500">{label}</Link></li>
          ))}
        </ul>
      </nav>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
