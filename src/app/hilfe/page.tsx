import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { PROHIBITED_ITEMS } from "@/lib/prohibited";
import { LISTING_DURATION_DAYS, MAX_IMAGES_PER_LISTING, SITE } from "@/lib/config";

export const metadata: Metadata = { title: "Hilfe & FAQ" };

const FAQ: [string, React.ReactNode][] = [
  ["Was kostet eine Anzeige?", "Das Aufgeben von Anzeigen ist kostenlos – für private und gewerbliche Anbieter."],
  ["Wie gebe ich eine Anzeige auf?", <>Registrieren Sie sich, bestätigen Sie Ihre E-Mail-Adresse und klicken Sie auf <Link href="/anzeige-aufgeben" className="link">„Anzeige aufgeben“</Link>. Wählen Sie die passende Kategorie – Sie können die Kategoriesuche nutzen – und füllen Sie das Formular aus.</>],
  ["Wie lange bleibt meine Anzeige online?", `${LISTING_DURATION_DAYS} Tage. Ab 7 Tage vor Ablauf können Sie die Anzeige unter „Meine Anzeigen“ kostenlos verlängern.`],
  ["Wie viele Bilder kann ich hochladen?", `Bis zu ${MAX_IMAGES_PER_LISTING} Bilder je Anzeige (JPG, PNG, WebP, max. 15 MB). Das erste Bild ist das Titelbild. Standortdaten (GPS) werden automatisch aus den Bildern entfernt.`],
  ["Was ist der Unterschied zwischen Angebot und Gesuch?", "Mit einem Angebot bieten Sie etwas an. Mit einem Gesuch suchen Sie etwas, z. B. eine Wohnung, ein bestimmtes Auto oder einen Nachhilfelehrer."],
  ["Wie kontaktiere ich einen Anbieter?", "Über das Nachrichtenformular auf der Anzeigenseite. Ihre E-Mail-Adresse bleibt dabei verborgen. Antworten finden Sie unter „Nachrichten“ und erhalten zusätzlich eine E-Mail-Benachrichtigung."],
  ["Ich bin Händler, Makler oder Firma – was muss ich beachten?", <>Führen Sie Ihr Konto als „gewerblich“ und hinterlegen Sie in den <Link href="/konto/einstellungen" className="link">Einstellungen</Link> Firmenname, Anschrift und weitere Impressumsangaben. Diese werden bei Ihren Anzeigen angezeigt.</>],
  ["Warum ist meine Anzeige „in Prüfung“?", "Wenn die Vorab-Prüfung aktiv ist, schauen wir neue oder geänderte Anzeigen kurz an, bevor sie online gehen. Sie werden per E-Mail informiert."],
  ["Wie lösche ich mein Konto?", <>Unter <Link href="/konto/einstellungen" className="link">Einstellungen → Konto löschen</Link>. Dort können Sie auch alle Ihre Daten herunterladen.</>],
];

export default function HelpPage() {
  return (
    <LegalPage title="Hilfe & häufige Fragen">
      {FAQ.map(([q, a]) => (
        <details key={q} className="mb-2 rounded-md border border-line p-3">
          <summary className="cursor-pointer font-semibold text-ink">{q}</summary>
          <p className="mt-2">{a}</p>
        </details>
      ))}

      <h2 id="verbotene-artikel">Verbotene und eingeschränkte Artikel</h2>
      {PROHIBITED_ITEMS.map((g) => (
        <div key={g.title}>
          <h3>{g.title}</h3>
          <ul>{g.items.map((i) => <li key={i}>{i}</li>)}</ul>
        </div>
      ))}

      <h2 id="meldeverfahren">Rechtswidrige Inhalte melden</h2>
      <p>
        Auf jeder Anzeigenseite finden Sie unten den Link „Anzeige melden“. Bitte geben Sie eine nachvollziehbare Begründung an. Sie erhalten eine Eingangsbestätigung und – sofern Sie eine
        E-Mail-Adresse angeben – eine Mitteilung über unsere Entscheidung. Rechteinhaber und Behörden erreichen uns außerdem unter {SITE.supportEmail}.
      </p>
      <p>Weitere Fragen? <Link href="/kontakt" className="link">Kontakt aufnehmen</Link></p>
    </LegalPage>
  );
}
