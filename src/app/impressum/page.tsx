import type { Metadata } from "next";
import { LegalPage, Missing } from "@/components/LegalPage";
import { OPERATOR, SITE } from "@/lib/config";

export const metadata: Metadata = { title: "Impressum" };

export default function ImpressumPage() {
  const o = OPERATOR;
  return (
    <LegalPage title="Impressum">
      <h2>Angaben gemäß § 5 Digitale-Dienste-Gesetz (DDG)</h2>
      <p>
        {o.name || <Missing what="Name / Firma" />}{o.legalForm && ` ${o.legalForm}`}<br />
        {o.street || <Missing what="Straße und Hausnummer" />}<br />
        {o.city || <Missing what="PLZ und Ort" />}<br />
        Deutschland
      </p>
      {o.representative && <p>Vertreten durch: {o.representative}</p>}
      <h2>Kontakt</h2>
      <p>
        E-Mail: {o.email || <Missing what="E-Mail-Adresse" />}<br />
        Telefon: {o.phone || <Missing what="Telefonnummer" />}
      </p>
      {o.register && (<><h2>Registereintrag</h2><p>{o.register}</p></>)}
      {o.vatId && (<><h2>Umsatzsteuer-ID</h2><p>Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: {o.vatId}</p></>)}
      <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
      <p>{o.representative || o.name || <Missing what="Name der verantwortlichen Person" />}, Anschrift wie oben</p>
      <h2>Zentrale Kontaktstelle nach Art. 11 und 12 Digital Services Act (DSA)</h2>
      <p>
        Behörden, die EU-Kommission und Nutzer erreichen uns elektronisch unter: {o.email || SITE.supportEmail}. Kommunikation auf Deutsch oder Englisch.
        Rechtswidrige Inhalte können zudem direkt über die Funktion „Anzeige melden“ auf jeder Anzeigenseite gemeldet werden.
      </p>
      <h2>Verbraucherstreitbeilegung</h2>
      <p>Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
      <h2>Haftung für Inhalte Dritter</h2>
      <p>
        {SITE.domain} ist eine Plattform, auf der Nutzer eigene Anzeigen veröffentlichen. Für die Inhalte der Anzeigen sind ausschließlich die jeweiligen Anbieter verantwortlich.
        Wir sind nach den gesetzlichen Bestimmungen (Art. 6 DSA) nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen. Sobald wir von rechtswidrigen Inhalten Kenntnis erlangen, entfernen oder sperren wir diese unverzüglich.
      </p>
    </LegalPage>
  );
}
