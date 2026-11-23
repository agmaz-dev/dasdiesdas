// Verbotene bzw. eingeschränkte Inhalte (Grundlage für AGB, Hilfe und Moderation)
export const PROHIBITED_ITEMS: { title: string; items: string[] }[] = [
  {
    title: "Grundsätzlich verboten",
    items: [
      "Waffen, Munition und wesentliche Waffenteile, die dem Waffengesetz unterliegen, sowie verbotene Gegenstände nach Anlage 2 WaffG (z. B. Springmesser, Schlagringe)",
      "Betäubungsmittel, psychoaktive Substanzen, Cannabis und Cannabis-Samen zum Konsum, sowie Utensilien, die zum Drogenkonsum beworben werden",
      "Verschreibungs- und apothekenpflichtige Arzneimittel, Dopingmittel",
      "Gefälschte Markenware, Raubkopien, Software-Keys aus unklarer Herkunft, gestohlene oder unterschlagene Ware",
      "Propagandamittel und Kennzeichen verfassungswidriger Organisationen (§§ 86, 86a StGB), volksverhetzende Inhalte",
      "Pornografische Inhalte, sexuelle Dienstleistungen und jugendgefährdende Medien",
      "Menschliche Organe, Körperteile und Ausweisdokumente; Bankkonten, Kreditkarten, Nutzerkonten",
      "Geschützte Tier- und Pflanzenarten ohne die erforderlichen Nachweise (Washingtoner Artenschutzübereinkommen, BArtSchV)",
      "Welpen und Kitten unter 8 Wochen; der Versand lebender Wirbeltiere; Tiere als Gewinn oder Preis",
      "Pyrotechnik ab Kategorie F2 durch Privatpersonen sowie nicht zugelassene Pyrotechnik",
      "Glücksspiel ohne Erlaubnis, Schneeballsysteme, Multi-Level-Marketing und „Geld-verdienen-von-zu-Hause“-Angebote",
      "Ghostwriting von Prüfungs- und Abschlussarbeiten",
    ],
  },
  {
    title: "Nur unter Bedingungen erlaubt",
    items: [
      "Alkohol, Tabakwaren und E-Zigaretten: nur gewerbliche Anbieter mit wirksamer Altersprüfung bei Übergabe",
      "Immobilienanzeigen: Pflichtangaben aus dem Energieausweis (§ 87 GEG); bei Mietwohnungen gilt das Bestellerprinzip für die Maklerprovision",
      "Ferienwohnungen in Berlin: Angabe der Registriernummer nach dem Zweckentfremdungsverbot-Gesetz",
      "Stellenanzeigen: diskriminierungsfrei nach AGG, mindestens gesetzlicher Mindestlohn, keine Vorabgebühren für Bewerber",
      "Neuwagen: Angaben zu Kraftstoffverbrauch und CO₂-Emissionen nach Pkw-EnVKV",
      "Luftfahrzeuge, Drohnen und Boote: Angaben zu Zulassung, Kennzeichnung und erforderlichen Berechtigungen müssen zutreffen",
      "Lebensmittel: nur unbedenkliche Ware; gewerbliche Anbieter müssen Kennzeichnungspflichten erfüllen",
    ],
  },
];
