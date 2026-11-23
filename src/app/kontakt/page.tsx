import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { OPERATOR, SITE } from "@/lib/config";

export const metadata: Metadata = { title: "Kontakt" };

export default function ContactPage() {
  const email = OPERATOR.email || SITE.supportEmail;
  return (
    <LegalPage title="Kontakt">
      <p>Sie erreichen unseren Support per E-Mail: <a href={`mailto:${email}`} className="link">{email}</a></p>
      <p>Bitte geben Sie bei Fragen zu einer Anzeige immer die Anzeigennummer an.</p>
      <h2>Rechtsverstöße melden</h2>
      <p>Für Meldungen zu konkreten Anzeigen nutzen Sie bitte den Link „Anzeige melden“ auf der Anzeigenseite. So können wir Ihre Meldung am schnellsten bearbeiten.</p>
      <p>Häufige Fragen beantworten wir in der <Link href="/hilfe" className="link">Hilfe</Link>.</p>
    </LegalPage>
  );
}
