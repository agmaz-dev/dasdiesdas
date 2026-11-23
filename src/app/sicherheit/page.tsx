import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Sicherheitstipps" };

export default function SafetyPage() {
  return (
    <LegalPage title="Sicher kaufen, verkaufen und mieten">
      <h2>Für Käufer und Mieter</h2>
      <ul>
        <li>Zahlen Sie möglichst erst bei Übergabe, nachdem Sie die Ware geprüft haben. Vorsicht bei Vorkasse an Unbekannte, Western Union, Gutscheinkarten oder Krypto.</li>
        <li>Wohnungen: Niemals Kaution oder „Besichtigungsgebühr“ überweisen, bevor Sie die Wohnung besichtigt und einen Vertrag unterschrieben haben. Schicken Sie keine Ausweiskopien vorab.</li>
        <li>Fahrzeuge, Boote, Flugzeuge: Papiere (Zulassung, Brief, Lufttüchtigkeitszeugnis), Fahrgestell- bzw. Seriennummer und Halter prüfen. Bei hohen Werten Gutachter hinzuziehen.</li>
        <li>Ungewöhnlich niedrige Preise und Zeitdruck („heute noch“, „bin im Ausland“) sind typische Warnsignale.</li>
      </ul>
      <h2>Für Verkäufer und Vermieter</h2>
      <ul>
        <li>Klicken Sie nicht auf Links, die angeblich eine Zahlung „freischalten“ oder einen „sicheren Versand“ bestätigen – das ist fast immer Phishing.</li>
        <li>Geben Sie niemals Bestätigungscodes, PINs, Passwörter oder Online-Banking-Daten weiter.</li>
        <li>Prüfen Sie bei Barzahlung größere Scheine. Bei Überweisung warten Sie den tatsächlichen Zahlungseingang ab (kein Screenshot!).</li>
      </ul>
      <h2>Treffen</h2>
      <ul>
        <li>Treffen Sie sich an belebten Orten oder nehmen Sie eine Begleitperson mit.</li>
        <li>Bleiben Sie für die Kommunikation im Nachrichtensystem von dasdiesdas – so können wir bei Betrug helfen.</li>
      </ul>
      <h2>Etwas Verdächtiges entdeckt?</h2>
      <p>Melden Sie die Anzeige über „Anzeige melden“. Bei einem Betrugsverdacht erstatten Sie bitte zusätzlich Anzeige bei der Polizei, in Berlin auch online über die Internetwache.</p>
    </LegalPage>
  );
}
