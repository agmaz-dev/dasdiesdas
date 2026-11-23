import type { Metadata } from "next";
import { LegalPage, Missing } from "@/components/LegalPage";
import { OPERATOR, SITE, LISTING_DURATION_DAYS } from "@/lib/config";

export const metadata: Metadata = { title: "Datenschutzerklärung" };

export default function DatenschutzPage() {
  const o = OPERATOR;
  return (
    <LegalPage title="Datenschutzerklärung" updated="November 2026">
      <h2>1. Verantwortlicher</h2>
      <p>
        Verantwortlich für die Datenverarbeitung auf {SITE.domain} im Sinne der Datenschutz-Grundverordnung (DSGVO) ist:<br />
        {o.name || <Missing what="Name / Firma" />}, {o.street || <Missing what="Straße" />}, {o.city || <Missing what="PLZ Ort" />}<br />
        E-Mail: {o.email || <Missing what="E-Mail" />}
      </p>

      <h2>2. Überblick</h2>
      <p>
        Wir verarbeiten personenbezogene Daten nur, soweit dies für den Betrieb der Plattform erforderlich ist. Wir setzen <strong>keine Analyse- oder Tracking-Werkzeuge</strong>,
        keine Werbe-Cookies und keine Social-Media-Plugins ein. Schriftarten werden nicht von Drittanbietern geladen.
      </p>

      <h2>3. Hosting und Server-Logfiles</h2>
      <p>
        Die Website wird gehostet bei: {o.hosting || <Missing what="Hosting-Anbieter mit Anschrift" />}. Beim Aufruf der Website verarbeitet der Server technisch notwendige Daten
        (IP-Adresse, Datum und Uhrzeit, aufgerufene Seite, Browsertyp). Dies dient der Auslieferung und der Sicherheit der Website (Art. 6 Abs. 1 lit. f DSGVO).
        Die IP-Adresse wird zudem kurzzeitig im Arbeitsspeicher genutzt, um Missbrauch (z. B. massenhafte Anmeldeversuche) zu begrenzen. Mit dem Hoster besteht ein Vertrag zur Auftragsverarbeitung (Art. 28 DSGVO).
      </p>

      <h2>4. Cookies</h2>
      <p>
        Wir verwenden ausschließlich ein technisch notwendiges Cookie („dds_session“), das Ihre Anmeldung speichert. Es wird nur gesetzt, wenn Sie sich anmelden, und läuft nach 30 Tagen
        oder bei Abmeldung ab. Rechtsgrundlage ist § 25 Abs. 2 Nr. 2 TDDDG sowie Art. 6 Abs. 1 lit. b DSGVO. Eine Einwilligung ist dafür nicht erforderlich.
      </p>

      <h2>5. Registrierung und Nutzerkonto</h2>
      <p>
        Für die Registrierung verarbeiten wir Name, E-Mail-Adresse, Passwort (nur als sicherer Hash gespeichert), optional Telefonnummer sowie bei gewerblichen Anbietern Firmenname,
        Anschrift, USt-IdNr. und Impressumsangaben. Rechtsgrundlage ist die Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO). Die Angaben gewerblicher Anbieter werden als Impressum veröffentlicht
        (gesetzliche Pflicht nach § 5 DDG, Art. 6 Abs. 1 lit. c DSGVO).
      </p>

      <h2>6. Anzeigen</h2>
      <p>
        Inhalte Ihrer Anzeigen (Titel, Beschreibung, Bilder, Merkmale, Preis, Ort/Postleitzahl bzw. Berliner Bezirk und Ortsteil, Ihr öffentlicher Name und – falls gewählt – Ihre Telefonnummer)
        sind öffentlich sichtbar. Ihre genaue Adresse wird nicht abgefragt und nicht veröffentlicht. Aus hochgeladenen Bildern entfernen wir automatisch alle Metadaten (EXIF), einschließlich GPS-Standortdaten.
        Anzeigen laufen nach {LISTING_DURATION_DAYS} Tagen ab und können jederzeit gelöscht werden.
      </p>

      <h2>7. Nachrichten zwischen Nutzern</h2>
      <p>
        Nachrichten werden auf unseren Servern gespeichert, um sie den Beteiligten zuzustellen (Art. 6 Abs. 1 lit. b DSGVO). Ihre E-Mail-Adresse wird dem Gegenüber nicht angezeigt.
        Über neue Nachrichten informieren wir Sie per E-Mail. Wir lesen Nachrichten nicht inhaltlich mit; eine Einsicht erfolgt nur, wenn dies zur Aufklärung gemeldeter Rechtsverstöße erforderlich ist.
      </p>

      <h2>8. E-Mail-Versand</h2>
      <p>
        Für den Versand von System-E-Mails (Bestätigung, Passwort, Benachrichtigungen) nutzen wir: {process.env.MAIL_PROVIDER_INFO || <Missing what="E-Mail-Dienstleister mit Anschrift" />}.
        Mit dem Dienstleister besteht ein Auftragsverarbeitungsvertrag.
      </p>

      <h2>9. Meldungen rechtswidriger Inhalte</h2>
      <p>
        Wenn Sie eine Anzeige melden, verarbeiten wir die Meldung, Ihre Begründung und – falls angegeben – Ihre E-Mail-Adresse, um die Meldung zu prüfen und Sie über die Entscheidung zu informieren
        (Art. 16 DSA, Art. 6 Abs. 1 lit. c DSGVO). Der Name der meldenden Person wird dem Anbieter nicht mitgeteilt.
      </p>

      <h2>10. Speicherdauer</h2>
      <p>
        Wir speichern Ihre Daten, solange Ihr Konto besteht. Nach Löschung des Kontos werden alle zugehörigen Daten (Anzeigen, Bilder, Nachrichten, Merklisten) unverzüglich gelöscht,
        sofern keine gesetzlichen Aufbewahrungspflichten entgegenstehen. Nicht verwendete Bild-Uploads werden nach 24 Stunden automatisch entfernt.
      </p>

      <h2>11. Empfänger und Drittländer</h2>
      <p>Eine Weitergabe an Dritte erfolgt nur an die genannten Auftragsverarbeiter oder wenn wir gesetzlich dazu verpflichtet sind. Eine Übermittlung in Drittländer außerhalb der EU/des EWR findet nicht statt.</p>

      <h2>12. Ihre Rechte</h2>
      <ul>
        <li>Auskunft (Art. 15 DSGVO) und Datenübertragbarkeit (Art. 20 DSGVO) – direkt unter „Einstellungen → Daten herunterladen“</li>
        <li>Berichtigung (Art. 16 DSGVO) – direkt in Ihren Einstellungen und Anzeigen</li>
        <li>Löschung (Art. 17 DSGVO) – direkt unter „Einstellungen → Konto löschen“</li>
        <li>Einschränkung der Verarbeitung (Art. 18 DSGVO) und Widerspruch (Art. 21 DSGVO)</li>
        <li>Beschwerde bei einer Aufsichtsbehörde, z. B. bei der Berliner Beauftragten für Datenschutz und Informationsfreiheit (www.datenschutz-berlin.de)</li>
      </ul>

      <h2>13. Automatisierte Entscheidungen</h2>
      <p>Eine automatisierte Entscheidungsfindung einschließlich Profiling (Art. 22 DSGVO) findet nicht statt.</p>
    </LegalPage>
  );
}
