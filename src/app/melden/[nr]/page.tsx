import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getListingByNumber } from "@/lib/server/listings";
import { getCurrentUser } from "@/lib/server/auth";
import { ReportForm } from "./ReportForm";
import { REPORT_REASONS } from "@/lib/reports";

export const metadata: Metadata = { title: "Anzeige melden", robots: { index: false } };

export default async function ReportPage(props: PageProps<"/melden/[nr]">) {
  const { nr } = await props.params;
  const l = await getListingByNumber(nr);
  if (!l || l.status === "DELETED") notFound();
  const user = await getCurrentUser();
  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-2xl font-bold">Anzeige melden</h1>
      <p className="text-sm text-ink-2">
        Anzeige Nr. {l.number}: <Link href={`/anzeige/${l.number}`} className="link">{l.title}</Link>
      </p>
      <p className="text-sm text-ink-2">
        Melden Sie uns Inhalte, die Ihrer Meinung nach rechtswidrig sind oder gegen unsere <Link href="/agb" className="link">AGB</Link> verstoßen.
        Wir bearbeiten jede Meldung sorgfältig und zeitnah (Melde- und Abhilfeverfahren nach Art. 16 Digital Services Act).
      </p>
      <div className="card p-5">
        <ReportForm listingId={l.id} needsEmail={!user} reasons={[...REPORT_REASONS]} />
      </div>
    </div>
  );
}
