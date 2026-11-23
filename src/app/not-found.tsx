import Link from "next/link";
import { Icon } from "@/components/Icon";

export default function NotFound() {
  return (
    <div className="card mx-auto max-w-lg p-8 text-center">
      <Icon name="search" size={44} className="mx-auto text-brand-600" />
      <h1 className="mt-2 text-2xl font-bold">Seite nicht gefunden</h1>
      <p className="mt-2 text-ink-2">Die Seite oder Anzeige existiert nicht (mehr). Vielleicht wurde sie bereits verkauft oder gelöscht.</p>
      <div className="mt-4 flex justify-center gap-2">
        <Link href="/" className="btn-primary">Zur Startseite</Link>
        <Link href="/anzeigen" className="btn-outline">Alle Anzeigen</Link>
      </div>
    </div>
  );
}
