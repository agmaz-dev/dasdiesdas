import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, Missing } from "@/components/LegalPage";
import { OPERATOR, SITE, LISTING_DURATION_DAYS, MAX_IMAGES_PER_LISTING } from "@/lib/config";
import { PROHIBITED_ITEMS } from "@/lib/prohibited";

export const metadata: Metadata = { title: "AGB & Nutzungsbedingungen" };

export default function AgbPage() {
  return (
    <LegalPage title="Allgemeine Geschäftsbedingungen und Nutzungsbedingungen" updated="November 2026">
      <h2>§ 1 Geltungsbereich und Anbieter</h2>
      <p>
        Diese Bedingungen gelten für die Nutzung der Online-Plattform {SITE.domain} (nachfolgend „Plattform“), betrieben von {OPERATOR.name || <Missing what="Betreiber" />}
        (nachfolgend „wir“). Abweichende Bedingungen von Nutzern gelten nicht.
      </p>

      <h2>§ 2 Leistungen der Plattform</h2>
      <p>
        Die Plattform ermöglicht es Nutzern, Anzeigen zum Verkauf, zur Vermietung, zum Tausch, zur Verschenkung oder zur Suche von Waren, Immobilien, Fahrzeugen, Dienstleistungen,
        Unterricht, Stellen und sonstigen Angeboten zu veröffentlichen und miteinander in Kontakt zu treten. Die Nutzung ist derzeit kostenlos.
      </p>
      <p>
        <strong>Wir sind nicht Vertragspartei</strong> der zwischen Nutzern geschlossenen Verträge. Für Angebote, deren Richtigkeit, die Abwicklung, Zahlung und Gewährleistung sind ausschließlich die beteiligten Nutzer verantwortlich.
      </p>

      <h2>§ 3 Registrierung</h2>
      <ul>
        <li>Die Registrierung ist nur volljährigen, unbeschränkt geschäftsfähigen Personen sowie Unternehmen erlaubt. Pro Person ist ein Konto zulässig.</li>
        <li>Die Angaben bei der Registrierung müssen wahr und vollständig sein. Zugangsdaten sind geheim zu halten.</li>
        <li>Wer gewerblich handelt, muss das Konto als „gewerblich“ führen und ein vollständiges Impressum hinterlegen (§ 5 DDG). Gegenüber Verbrauchern gelten dann die gesetzlichen Verbraucherschutzvorschriften, insbesondere zu Widerrufsrecht und Informationspflichten.</li>
      </ul>

      <h2>§ 4 Anzeigen</h2>
      <ul>
        <li>Anzeigen müssen der gewählten Kategorie entsprechen, wahrheitsgemäß sein und dürfen nur eigene bzw. zur Vermittlung berechtigte Angebote enthalten.</li>
        <li>Pro Angebot ist eine Anzeige erlaubt. Eine Anzeige ist {LISTING_DURATION_DAYS} Tage online und kann danach verlängert werden. Je Anzeige können bis zu {MAX_IMAGES_PER_LISTING} Bilder hochgeladen werden.</li>
        <li>Bilder und Texte dürfen keine Rechte Dritter verletzen. Mit dem Hochladen räumen Sie uns ein einfaches, unentgeltliches, auf die Laufzeit der Anzeige beschränktes Recht ein, die Inhalte auf der Plattform darzustellen.</li>
        <li>Kontaktdaten, Links zu Drittseiten oder Werbung für andere Plattformen sind im Anzeigentext nicht gestattet, soweit sie nicht dem Angebot selbst dienen.</li>
      </ul>

      <h2 id="verboten">§ 5 Verbotene Inhalte</h2>
      <p>Verboten sind alle Inhalte, die gegen geltendes Recht, die guten Sitten oder Rechte Dritter verstoßen. Insbesondere gilt:</p>
      {PROHIBITED_ITEMS.map((g) => (
        <div key={g.title}>
          <h3>{g.title}</h3>
          <ul>{g.items.map((i) => <li key={i}>{i}</li>)}</ul>
        </div>
      ))}

      <h2>§ 6 Moderation, Melde- und Abhilfeverfahren</h2>
      <ul>
        <li>Jeder kann Inhalte über die Funktion „Anzeige melden“ melden (Art. 16 DSA). Wir prüfen Meldungen sorgfältig, zeitnah und objektiv.</li>
        <li>Wir können Anzeigen vor Veröffentlichung prüfen, ablehnen, sperren oder entfernen sowie Konten vorübergehend oder dauerhaft sperren, wenn ein Verstoß gegen Gesetze oder diese Bedingungen vorliegt oder konkret droht. Die Schwere, Häufigkeit und Folgen eines Verstoßes werden dabei berücksichtigt.</li>
        <li>Betroffene erhalten eine Begründung der Entscheidung (Art. 17 DSA) und können ihr widersprechen, indem sie auf die Benachrichtigung antworten oder uns unter {SITE.supportEmail} kontaktieren (internes Beschwerdemanagement nach Art. 20 DSA). Daneben steht der Weg zu einer zertifizierten außergerichtlichen Streitbeilegungsstelle (Art. 21 DSA) sowie zu den Gerichten offen.</li>
        <li>Personen, die häufig offensichtlich unbegründete Meldungen abgeben, können von der Meldefunktion ausgeschlossen werden (Art. 23 DSA).</li>
      </ul>

      <h2>§ 7 Pflichten bei der Kommunikation</h2>
      <p>
        Das Nachrichtensystem darf nur zur Kommunikation über konkrete Anzeigen genutzt werden. Spam, Belästigung, Phishing sowie das Weiterleiten auf betrügerische Zahlungsseiten sind untersagt.
      </p>

      <h2>§ 8 Haftung</h2>
      <p>
        Wir haften unbeschränkt für Vorsatz und grobe Fahrlässigkeit sowie bei Verletzung von Leben, Körper oder Gesundheit. Bei leichter Fahrlässigkeit haften wir nur bei Verletzung wesentlicher
        Vertragspflichten, begrenzt auf den vorhersehbaren, typischerweise eintretenden Schaden. Für Inhalte der Nutzer und für Verträge zwischen Nutzern übernehmen wir keine Haftung.
        Eine ständige Verfügbarkeit der Plattform kann nicht gewährleistet werden.
      </p>

      <h2>§ 9 Freistellung</h2>
      <p>Nutzer stellen uns von Ansprüchen Dritter frei, die auf einer schuldhaften Rechtsverletzung durch ihre Inhalte beruhen, einschließlich angemessener Kosten der Rechtsverteidigung.</p>

      <h2>§ 10 Laufzeit und Kündigung</h2>
      <p>Der Nutzungsvertrag läuft auf unbestimmte Zeit. Nutzer können ihn jederzeit durch Löschen des Kontos in den Einstellungen beenden. Wir können mit einer Frist von zwei Wochen ordentlich kündigen; das Recht zur außerordentlichen Kündigung bleibt unberührt.</p>

      <h2>§ 11 Änderungen</h2>
      <p>Wir können diese Bedingungen mit Wirkung für die Zukunft ändern. Über Änderungen informieren wir registrierte Nutzer mindestens sechs Wochen vorher per E-Mail. Widerspricht der Nutzer nicht innerhalb dieser Frist, gelten die Änderungen als angenommen; auf diese Folge weisen wir in der Mitteilung gesondert hin.</p>

      <h2>§ 12 Schlussbestimmungen</h2>
      <p>
        Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts. Gegenüber Verbrauchern gilt diese Rechtswahl nur, soweit dadurch nicht zwingende Schutzvorschriften des
        Staates ihres gewöhnlichen Aufenthalts entzogen werden. Ist der Nutzer Kaufmann, ist Gerichtsstand Berlin. Siehe auch <Link href="/datenschutz" className="link">Datenschutzerklärung</Link> und <Link href="/impressum" className="link">Impressum</Link>.
      </p>
    </LegalPage>
  );
}
