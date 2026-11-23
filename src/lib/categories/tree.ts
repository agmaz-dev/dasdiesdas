// Kategorienbaum von dasdiesdas.
// WICHTIG: Bereits verwendete Kategorien nicht umbenennen bzw. deren Slug nicht ändern,
// da Anzeigen die Kategorie-ID (= Slug-Pfad) speichern. Neue Kategorien können jederzeit ergänzt werden.

import type { AttributeSetKey } from "./attributes";

export type PriceMode = "required" | "optional" | "none" | "free";

export interface CategoryNode {
  name: string;
  slug?: string;
  icon?: string;
  /** Merkmal-Set; wird an Unterkategorien vererbt */
  attrs?: AttributeSetKey;
  /** Einheit hinter dem Preis, z. B. "/ Monat"; wird vererbt */
  priceUnit?: string;
  /** Preisfeld: Pflicht, optional, ausgeblendet oder immer kostenlos; wird vererbt */
  price?: PriceMode;
  /** Bezeichnung des Preisfelds, z. B. "Kaltmiete"; wird vererbt */
  priceLabel?: string;
  children?: CategoryNode[];
}

const n = (name: string, children?: CategoryNode[], opts: Omit<CategoryNode, "name" | "children"> = {}): CategoryNode => ({
  name,
  children,
  ...opts,
});
const leaves = (...names: string[]): CategoryNode[] => names.map((name) => ({ name }));

// ---------- Immobilien ----------

const wohnTypenMiete = leaves(
  "Wohnung", "Haus", "Einfamilienhaus", "Doppelhaushälfte", "Reihenhaus", "Villa", "Bungalow",
  "Penthouse", "Maisonette", "Loft / Atelier", "Dachgeschosswohnung", "Erdgeschosswohnung",
  "Souterrainwohnung", "Bauernhaus / Landhaus", "Möbliertes Wohnen auf Zeit", "Seniorenwohnung",
  "Andere Wohnimmobilien",
);
const wohnTypenKauf = leaves(
  "Eigentumswohnung", "Einfamilienhaus", "Mehrfamilienhaus", "Doppelhaushälfte", "Reihenhaus",
  "Villa", "Bungalow", "Penthouse", "Maisonette", "Loft / Atelier", "Bauernhaus / Landhaus",
  "Resthof", "Schloss / Herrenhaus", "Fertighaus / Neubau", "Tiny House", "Kapitalanlage (vermietet)",
  "Andere Wohnimmobilien",
);
const gewerbeTypen = leaves(
  "Büro / Praxis", "Ladenlokal / Einzelhandel", "Gastronomie / Restaurant", "Café / Bar / Kneipe",
  "Halle / Lager / Produktion", "Werkstatt", "Hotel / Pension", "Bürogebäude", "Wohn- und Geschäftshaus",
  "Coworking-Platz", "Arztpraxis / Therapieräume", "Kiosk / Späti", "Bäckerei / Konditorei",
  "Imbiss / Food Truck Stellplatz", "Friseur- / Kosmetiksalon", "Fitnessstudio / Sportanlage",
  "Tankstelle", "Autohaus / Kfz-Betrieb", "Waschanlage", "Veranstaltungs- / Festsaal",
  "Kino / Theater", "Wellness / Sauna", "Pflegeheim / Klinik", "Kindertagesstätte",
  "Landwirtschaftlicher Betrieb", "Reiterhof", "Energieanlage / Solarpark", "Industrieanlage / Fabrik",
  "Andere Gewerbeimmobilien",
);

const immobilien = n("Immobilien", [
  n("Wohnen", [
    n("Mieten", wohnTypenMiete, { attrs: "wohnen_miete", priceUnit: "/ Monat", priceLabel: "Kaltmiete" }),
    n("Kaufen", wohnTypenKauf, { attrs: "wohnen_kauf", priceLabel: "Kaufpreis" }),
    n("WG-Zimmer & Wohnen auf Zeit", leaves("WG-Zimmer", "Zwischenmiete", "Wohnung auf Zeit", "Studentenwohnheim", "Wohnungstausch"), { attrs: "wohnen_wg", priceUnit: "/ Monat", priceLabel: "Miete" }),
    n("Ferienwohnungen & Ferienhäuser", leaves("Ferienwohnung Deutschland", "Ferienhaus Deutschland", "Ferienwohnung Ausland", "Ferienhaus Ausland", "Monteurzimmer", "Hausboot"), { attrs: "ferien", priceUnit: "/ Nacht", priceLabel: "Preis" }),
    n("Neubauprojekte", leaves("Neubauwohnungen", "Neubauhäuser"), { attrs: "wohnen_kauf", priceLabel: "Preis ab" }),
    n("Wohnen im Alter", leaves("Betreutes Wohnen", "Seniorenresidenz", "Pflegeappartement"), { attrs: "wohnen_miete", priceUnit: "/ Monat", priceLabel: "Monatlich" }),
  ]),
  n("Gewerbeimmobilien", [
    n("Mieten / Pachten", gewerbeTypen, { priceUnit: "/ Monat", priceLabel: "Miete / Pacht" }),
    n("Kaufen", gewerbeTypen, { priceLabel: "Kaufpreis" }),
    n("Nachmieter / Übernahme", gewerbeTypen, { priceLabel: "Ablöse" }),
  ], { attrs: "gewerbe" }),
  n("Grundstücke", [
    n("Kaufen", leaves("Baugrundstück", "Gewerbegrundstück", "Acker- / Landwirtschaftsfläche", "Wald", "Wiese / Weide", "Freizeitgrundstück", "Wassergrundstück", "Sonstige Grundstücke"), { priceLabel: "Kaufpreis" }),
    n("Pachten / Mieten", leaves("Kleingarten / Schrebergarten", "Gartengrundstück", "Landwirtschaftsfläche", "Gewerbefläche", "Stellfläche", "Sonstige Grundstücke"), { priceUnit: "/ Monat", priceLabel: "Pacht" }),
  ], { attrs: "grundstueck" }),
  n("Garagen & Stellplätze", [
    n("Mieten", undefined, { priceUnit: "/ Monat", priceLabel: "Miete" }),
    n("Kaufen", undefined, { priceLabel: "Kaufpreis" }),
  ], { attrs: "stellplatz" }),
  n("Hotels & Tourismus", leaves("Hotel", "Pension / Gästehaus", "Boardinghouse / Apartmenthotel", "Ferienanlage", "Campingplatz", "Jugendherberge / Hostel", "Gasthof"), { attrs: "hotel" }),
  n("Timesharing / Teilzeitwohnrecht", undefined, { attrs: "ferien" }),
  n("Immobilien Ausland", leaves("Türkei", "Spanien", "Italien", "Kroatien", "Griechenland", "Portugal", "Österreich", "Polen", "Andere Länder"), { attrs: "wohnen_kauf" }),
  n("Immobilien-Gesuche", leaves("Wohnung gesucht", "Haus gesucht", "WG-Zimmer gesucht", "Gewerbefläche gesucht", "Grundstück gesucht", "Stellplatz gesucht"), { attrs: "allgemein", price: "optional", priceLabel: "Budget" }),
], { icon: "🏠", price: "required" });

// ---------- Fahrzeuge ----------

const bootTypen = leaves(
  "Motoryacht", "Segelyacht", "Segelboot / Jolle", "Katamaran", "Gulet", "Motorboot / Sportboot",
  "Kajütboot", "Angelboot", "Schlauchboot / RIB", "Jetski / Wassermotorrad", "Kanu / Kajak",
  "Ruderboot", "SUP / Surfbrett", "Hausboot", "Elektroboot", "Fahrgastschiff", "Arbeitsboot",
  "Frachtschiff / Binnenschiff", "Fischkutter", "Andere Wasserfahrzeuge",
);

const fahrzeuge = n("Fahrzeuge", [
  n("Autos", leaves("Limousine", "Kombi", "Kleinwagen", "Cabrio / Roadster", "Coupé", "Van / Minibus", "Sportwagen", "Andere"), { attrs: "pkw" }),
  n("SUV, Geländewagen & Pick-up", leaves("SUV", "Geländewagen", "Pick-up"), { attrs: "pkw" }),
  n("Elektroautos", leaves("Elektroauto", "Plug-in-Hybrid", "Hybrid"), { attrs: "pkw" }),
  n("Motorräder & Motorroller", leaves("Motorrad", "Chopper / Cruiser", "Sportler / Supersportler", "Naked Bike", "Tourer / Reiseenduro", "Enduro / Cross", "Supermoto", "Motorroller", "Mofa / Moped", "E-Roller", "Trike", "Gespann / Seitenwagen", "Andere"), { attrs: "motorrad" }),
  n("Quads, ATV & UTV", leaves("Quad", "ATV", "UTV / Side-by-Side", "Buggy"), { attrs: "motorrad" }),
  n("Transporter & Kleinbusse", leaves("Kastenwagen", "Pritschenwagen", "Kipper bis 3,5 t", "Kleinbus", "Kühlfahrzeug", "Andere"), { attrs: "nutzfahrzeug" }),
  n("Nutzfahrzeuge & Lkw", leaves("Lkw über 7,5 t", "Lkw bis 7,5 t", "Sattelzugmaschine", "Kipper", "Betonmischer", "Abschleppwagen", "Kommunalfahrzeug", "Feuerwehr / Sonderfahrzeug", "Andere"), { attrs: "nutzfahrzeug" }),
  n("Busse", leaves("Reisebus", "Linienbus", "Midibus", "Partybus", "Andere"), { attrs: "nutzfahrzeug" }),
  n("Anhänger & Auflieger", leaves("Pkw-Anhänger", "Kofferanhänger", "Autotransporter", "Pferdeanhänger", "Bootsanhänger / Trailer", "Sattelauflieger", "Kipperanhänger", "Verkaufsanhänger / Food Trailer", "Andere"), { attrs: "anhaenger" }),
  n("Wohnmobile & Wohnwagen", [
    n("Wohnmobile", leaves("Alkoven", "Teilintegriert", "Vollintegriert", "Kastenwagen / Camper Van", "Pick-up-Camper"), { attrs: "wohnmobil" }),
    n("Wohnwagen", leaves("Wohnwagen", "Mobilheim", "Tiny House auf Rädern"), { attrs: "wohnwagen" }),
  ]),
  n("Boote & Schiffe", [
    n("Kaufen", bootTypen),
    n("Mieten / Charter", bootTypen, { priceUnit: "/ Tag" }),
    n("Liegeplätze", leaves("Liegeplatz Wasser", "Winterlager / Halle"), { attrs: "stellplatz", priceUnit: "/ Saison" }),
  ], { attrs: "boot" }),
  n("Flugzeuge & Luftfahrzeuge", [
    n("Motorflugzeuge", leaves("Einmotorig", "Zweimotorig", "Ultraleichtflugzeug (UL)", "Business Jet", "Turboprop", "Oldtimer-Flugzeug")),
    n("Hubschrauber", leaves("Kolbenmotor-Hubschrauber", "Turbinen-Hubschrauber", "Ultraleicht-Hubschrauber / Gyrocopter")),
    n("Segelflugzeuge & Motorsegler", leaves("Segelflugzeug", "Motorsegler", "Eigenstarter")),
    n("Gleitschirme & Drachen", leaves("Gleitschirm", "Motorschirm / Paramotor", "Hängegleiter / Drachen", "Rettungsschirm")),
    n("Heißluftballone", undefined),
    n("Flugzeug-Charter & Anteile", leaves("Flugzeug-Charter", "Halteranteile / Co-Ownership"), { priceUnit: "/ Stunde" }),
    n("Drohnen", leaves("Kameradrohne", "FPV-Drohne", "Profi- / Industriedrohne", "Agrardrohne"), { attrs: "drohne" }),
  ], { attrs: "luftfahrzeug" }),
  n("Oldtimer & Klassiker", leaves("Oldtimer Pkw", "Youngtimer", "Oldtimer Motorrad", "Oldtimer Nutzfahrzeug", "Oldtimer Traktor", "DDR-Fahrzeuge"), { attrs: "pkw" }),
  n("Unfallfahrzeuge & Bastlerfahrzeuge", leaves("Unfallwagen Pkw", "Unfallmotorrad", "Motorschaden", "Ankauf / Export"), { attrs: "pkw" }),
  n("Fahrzeuge mit Behindertenumbau", leaves("Rollstuhlgerechte Fahrzeuge", "Fahrhilfen / Umbauten"), { attrs: "pkw" }),
  n("Fahrräder & E-Bikes", leaves("Fahrrad", "E-Bike / Pedelec", "Lastenrad", "Kinderfahrrad", "E-Scooter", "Fahrradanhänger"), { attrs: "fahrrad" }),
  n("Fahrzeugvermietung", leaves("Autovermietung", "Transportervermietung", "Wohnmobilvermietung", "Motorradvermietung", "Hochzeitsautos / Limousinen-Service", "Carsharing-Angebote"), { attrs: "allgemein", priceUnit: "/ Tag" }),
  n("Kennzeichen & Taxi-/Mietwagenkonzessionen", leaves("Wunschkennzeichen", "Taxikonzession", "Mietwagenkonzession"), { attrs: "allgemein" }),
], { icon: "🚗", price: "required" });

// ---------- Ersatzteile & Zubehör ----------

const teile = n("Ersatzteile & Zubehör", [
  n("Auto-Ersatzteile", leaves("Motor & Anbauteile", "Getriebe & Antrieb", "Karosserie", "Beleuchtung", "Bremsen", "Fahrwerk & Lenkung", "Abgasanlage", "Elektrik & Sensoren", "Innenraum & Sitze", "Klima & Heizung", "Filter & Verschleißteile", "Andere")),
  n("Reifen & Felgen", leaves("Kompletträder", "Reifen", "Felgen", "Radkappen & Zubehör"), { attrs: "reifen" }),
  n("Auto-Zubehör", leaves("Car-HiFi & Navigation", "Dachboxen & Träger", "Anhängerkupplungen", "Innenausstattung", "Außenzubehör", "Kindersitze", "Pflege & Werkzeug", "Ladestationen / Wallboxen", "Tuning & Styling")),
  n("Motorrad-Teile & Zubehör", leaves("Motorrad-Ersatzteile", "Motorradreifen", "Helme", "Bekleidung & Protektoren", "Koffer & Taschen", "Tuning")),
  n("Nutzfahrzeug-Teile", leaves("Lkw-Teile", "Transporter-Teile", "Anhänger-Teile", "Bus-Teile")),
  n("Boots- & Schiffszubehör", leaves("Bootsmotoren", "Segel & Rigg", "Elektronik & Navigation", "Sicherheit & Rettung", "Beschläge & Ausrüstung", "Trailer", "Wassersport-Zubehör")),
  n("Luftfahrt-Teile & Avionik", leaves("Avionik", "Triebwerke & Propeller", "Zellenteile", "Pilotenausrüstung", "Drohnen-Zubehör")),
  n("Wohnmobil- & Camping-Zubehör", leaves("Markisen & Vorzelte", "Elektrik & Solar", "Wasser & Sanitär", "Fahrradträger", "Campingmöbel")),
  n("Fahrrad-Teile & Zubehör", leaves("Rahmen & Gabeln", "Laufräder & Reifen", "Antrieb & Schaltung", "E-Bike-Akkus & Motoren", "Bekleidung & Helme", "Schlösser & Zubehör")),
], { icon: "🔧", attrs: "teile", price: "required" });

// ---------- Elektronik ----------

const elektronik = n("Elektronik", [
  n("Handys & Smartphones", leaves("iPhone", "Samsung", "Google Pixel", "Xiaomi", "Andere Smartphones", "Tastenhandys / Seniorenhandys"), { attrs: "handy" }),
  n("Handy-Zubehör", leaves("Hüllen & Schutzfolien", "Ladegeräte & Kabel", "Kopfhörer & Headsets", "Smartwatches & Fitnesstracker", "Ersatzteile")),
  n("Computer & Laptops", leaves("Laptops / Notebooks", "Desktop-PCs", "Apple Mac", "Gaming-PCs", "Server", "Mini-PCs / Raspberry Pi"), { attrs: "computer" }),
  n("Tablets & E-Reader", leaves("iPad", "Android-Tablets", "Windows-Tablets", "E-Reader"), { attrs: "tablet" }),
  n("PC-Zubehör & Komponenten", leaves("Monitore", "Grafikkarten", "Prozessoren & Mainboards", "Arbeitsspeicher", "Festplatten & SSDs", "Tastaturen & Mäuse", "Drucker & Scanner", "Netzwerk & WLAN", "Software")),
  n("Foto & Kamera", leaves("Spiegelreflex- & Systemkameras", "Kompaktkameras", "Objektive", "Actioncams", "Videokameras", "Studio & Licht", "Stative & Zubehör", "Analog & Sofortbild")),
  n("TV & Video", leaves("Fernseher", "Beamer & Leinwände", "Receiver & Streaming-Geräte", "DVD- & Blu-ray-Player", "Satellitenanlagen")),
  n("Audio & HiFi", leaves("Lautsprecher & Soundbars", "Verstärker & Receiver", "Plattenspieler", "Kopfhörer", "Stereoanlagen", "DJ-Equipment", "Smart Speaker")),
  n("Konsolen & Videospiele", leaves("PlayStation", "Xbox", "Nintendo", "PC-Spiele", "Retro-Konsolen", "VR-Brillen", "Gaming-Zubehör")),
  n("Haushaltsgeräte", leaves("Kühlschränke & Gefriergeräte", "Waschmaschinen & Trockner", "Geschirrspüler", "Herde & Backöfen", "Kaffeemaschinen", "Küchenkleingeräte", "Staubsauger & Saugroboter", "Klima & Heizgeräte", "Nähmaschinen")),
  n("Smart Home & Sicherheit", leaves("Überwachungskameras", "Alarmanlagen", "Smart-Home-Systeme", "Türsprechanlagen")),
  n("Telefone & Faxgeräte", undefined),
  n("Elektronik-Bauteile & Messtechnik", leaves("Bauteile", "Messgeräte", "Funk & Amateurfunk", "Solartechnik & Powerstations")),
], { icon: "📱", attrs: "marke_waren", price: "required" });

// ---------- Haus & Garten ----------

const hausGarten = n("Haus & Garten", [
  n("Möbel", leaves("Sofas & Sessel", "Betten & Matratzen", "Schränke & Kommoden", "Tische & Stühle", "Regale", "Büromöbel", "Kinder- & Jugendmöbel", "Gartenmöbel", "Antike Möbel")),
  n("Küche & Esszimmer", leaves("Einbauküchen", "Geschirr & Besteck", "Töpfe & Pfannen", "Küchenhelfer")),
  n("Dekoration & Wohnaccessoires", leaves("Bilder & Rahmen", "Lampen & Leuchten", "Teppiche", "Gardinen & Vorhänge", "Spiegel", "Kerzen & Deko", "Pflanzen & Übertöpfe")),
  n("Bad & Sanitär", leaves("Badmöbel", "Armaturen", "Duschen & Wannen", "Waschbecken & WCs")),
  n("Heimtextilien", leaves("Bettwäsche", "Handtücher", "Kissen & Decken")),
  n("Garten & Pflanzen", leaves("Gartengeräte", "Rasenmäher & Mähroboter", "Grills", "Pools & Teiche", "Gartenhäuser & Gewächshäuser", "Pflanzen & Saatgut", "Bewässerung", "Brennholz")),
  n("Heimwerken & Baumarkt", leaves("Elektrowerkzeuge", "Handwerkzeuge", "Baumaterial", "Fliesen & Bodenbeläge", "Fenster & Türen", "Heizung & Sanitär", "Elektroinstallation", "Farben & Lacke", "Leitern & Gerüste", "Holz")),
  n("Haushalt & Reinigung", leaves("Reinigungsgeräte", "Aufbewahrung", "Bügeln & Wäschepflege")),
], { icon: "🛋️", attrs: "waren", price: "required" });

// ---------- Mode & Beauty ----------

const mode = n("Mode & Beauty", [
  n("Damenbekleidung", leaves("Kleider", "Hosen & Jeans", "Oberteile & Blusen", "Jacken & Mäntel", "Röcke", "Sportbekleidung", "Umstandsmode", "Abendmode & Brautmode", "Dessous & Bademode"), { attrs: "kleidung" }),
  n("Herrenbekleidung", leaves("Hosen & Jeans", "Hemden", "T-Shirts & Pullover", "Jacken & Mäntel", "Anzüge", "Sportbekleidung", "Unterwäsche & Bademode"), { attrs: "kleidung" }),
  n("Damenschuhe", leaves("Sneaker", "Stiefel", "Pumps & High Heels", "Sandalen", "Ballerinas", "Sportschuhe"), { attrs: "schuhe" }),
  n("Herrenschuhe", leaves("Sneaker", "Business-Schuhe", "Stiefel", "Sandalen", "Sportschuhe"), { attrs: "schuhe" }),
  n("Taschen & Accessoires", leaves("Handtaschen", "Rucksäcke", "Koffer & Reisetaschen", "Geldbörsen", "Gürtel", "Sonnenbrillen", "Hüte & Mützen", "Schals & Tücher")),
  n("Uhren", leaves("Herrenuhren", "Damenuhren", "Luxusuhren", "Smartwatches", "Taschenuhren", "Wand- & Standuhren")),
  n("Schmuck", leaves("Ringe", "Ketten & Anhänger", "Armbänder", "Ohrringe", "Goldschmuck", "Silberschmuck", "Modeschmuck", "Edelsteine")),
  n("Beauty & Gesundheit", leaves("Parfum", "Make-up & Kosmetik", "Haarpflege & Styling", "Hautpflege", "Rasierer & Epilierer", "Wellness & Massage", "Medizinische Hilfsmittel")),
  n("Traditionelle & kulturelle Mode", leaves("Trachten / Dirndl", "Orientalische Mode", "Afrikanische Mode", "Asiatische Mode")),
], { icon: "👗", attrs: "marke_waren", price: "required" });

// ---------- Familie, Kind & Baby ----------

const familie = n("Familie, Kind & Baby", [
  n("Babyausstattung", leaves("Kinderwagen & Buggys", "Autositze", "Babytragen", "Hochstühle", "Babyphone", "Wickeln & Pflegen", "Stillen & Füttern")),
  n("Kinderzimmer", leaves("Kinderbetten", "Wickelkommoden", "Kinderschränke", "Deko & Textilien")),
  n("Kinderkleidung", leaves("Baby (bis Gr. 86)", "Mädchen", "Jungen", "Kinderschuhe"), { attrs: "kleidung" }),
  n("Spielzeug", leaves("LEGO & Bausteine", "Puppen & Zubehör", "Spielfahrzeuge", "Gesellschaftsspiele & Puzzles", "Lernspielzeug", "Draußen spielen", "Plüschtiere", "Modelleisenbahn")),
  n("Schulbedarf", leaves("Schulranzen", "Schulbücher", "Lernhilfen")),
], { icon: "🧸", attrs: "waren", price: "required" });

// ---------- Freizeit, Hobby & Nachbarschaft ----------

const freizeit = n("Freizeit, Hobby & Sport", [
  n("Sport & Fitness", leaves("Fitnessgeräte", "Fußball", "Tennis & Badminton", "Golf", "Wintersport", "Wassersport", "Kampfsport", "Reitsport", "Angeln", "Laufen", "Yoga & Pilates", "Teamsport")),
  n("Camping & Outdoor", leaves("Zelte", "Schlafsäcke & Isomatten", "Rucksäcke", "Outdoorbekleidung", "Kocher & Zubehör")),
  n("Musikinstrumente", leaves("Gitarren & Bässe", "Klaviere & Flügel", "Keyboards & Synthesizer", "Schlagzeug & Percussion", "Blasinstrumente", "Streichinstrumente", "Saz / Bağlama & Orientalische Instrumente", "Studio & Recording", "Verstärker & Effekte", "Noten")),
  n("Bücher, Filme & Musik", leaves("Romane & Literatur", "Sachbücher", "Kinderbücher", "Fachbücher & Studium", "Comics & Manga", "Zeitschriften", "CDs & Vinyl", "DVDs & Blu-rays"), { attrs: "medien" }),
  n("Sammeln", leaves("Münzen", "Briefmarken", "Sammelkarten", "Modellautos", "Militaria (legal)", "Postkarten", "Figuren", "Autogramme", "Andere Sammlungen")),
  n("Antiquitäten & Kunst", leaves("Gemälde", "Skulpturen", "Antike Möbel", "Porzellan & Keramik", "Teppiche & Kelims", "Kunsthandwerk", "Fotografie & Drucke")),
  n("Basteln & Handarbeit", leaves("Stoffe & Nähzubehör", "Wolle & Stricken", "Malbedarf", "Modellbau", "Bastelmaterial")),
  n("Modellbau & RC", leaves("RC-Autos", "RC-Flugzeuge & Helikopter", "RC-Boote", "Modelleisenbahn")),
  n("Reisen & Gutscheine", leaves("Reisegutscheine", "Gutscheine", "Reisebegleitung", "Mitfahrgelegenheit"), { attrs: "allgemein" }),
  n("Tickets & Eintrittskarten", leaves("Konzerte", "Sport", "Theater & Musical", "Comedy", "Festivals", "Messen", "Sonstige Tickets"), { attrs: "tickets" }),
], { icon: "⚽", attrs: "waren", price: "required" });

const nachbarschaft = n("Nachbarschaft & Veranstaltungen", [
  n("Zu verschenken", leaves("Möbel", "Elektronik", "Kleidung", "Kinder", "Pflanzen", "Lebensmittel (foodsharing)", "Sonstiges"), { attrs: "verschenken", price: "free" }),
  n("Tauschen", leaves("Tausche Möbel", "Tausche Elektronik", "Tausche Kleidung", "Tausche Sonstiges"), { attrs: "waren", price: "none" }),
  n("Nachbarschaftshilfe", leaves("Hilfe angeboten", "Hilfe gesucht", "Einkaufshilfe", "Begleitung"), { attrs: "allgemein", price: "optional" }),
  n("Veranstaltungen", leaves("Flohmärkte", "Konzerte & Partys", "Kurse & Workshops", "Kultur & Ausstellungen", "Sport-Events", "Kinder & Familie", "Religiöse & kulturelle Feste", "Sonstige"), { attrs: "veranstaltung", price: "optional", priceLabel: "Eintritt" }),
  n("Freizeitpartner & Gruppen", leaves("Sportpartner", "Reisepartner", "Musiker gesucht", "Sprachtandem", "Vereine & Gruppen"), { attrs: "allgemein", price: "none" }),
  n("Verloren & Gefunden", leaves("Verloren", "Gefunden"), { attrs: "allgemein", price: "none" }),
  n("Lebensmittel & Getränke", leaves("Obst & Gemüse", "Honig & Imkereiprodukte", "Selbstgemachtes", "Getränke", "Spezialitäten"), { attrs: "lebensmittel", price: "required" }),
], { icon: "🤝" });

// ---------- Tiere ----------

const tiere = n("Tiere", [
  n("Hunde", leaves("Welpen", "Erwachsene Hunde", "Deckrüden"), { attrs: "tier" }),
  n("Katzen", leaves("Kitten", "Erwachsene Katzen", "Deckkater"), { attrs: "tier" }),
  n("Kleintiere", leaves("Kaninchen", "Meerschweinchen", "Hamster", "Mäuse & Ratten", "Chinchillas", "Frettchen"), { attrs: "tier" }),
  n("Vögel", leaves("Wellensittiche", "Papageien & Sittiche", "Kanarienvögel", "Tauben", "Exoten"), { attrs: "tier" }),
  n("Fische & Aquaristik", leaves("Aquarienfische", "Teichfische / Koi", "Garnelen & Wirbellose", "Wasserpflanzen"), { attrs: "tier" }),
  n("Reptilien & Terraristik", leaves("Schlangen", "Echsen", "Schildkröten", "Amphibien", "Insekten & Spinnen"), { attrs: "tier" }),
  n("Pferde & Ponys", leaves("Pferde", "Ponys", "Fohlen", "Reitbeteiligung", "Pferdeboxen & Weiden"), { attrs: "pferd" }),
  n("Nutztiere", leaves("Rinder", "Schafe", "Ziegen", "Schweine", "Hühner & Geflügel", "Alpakas & Lamas", "Bienenvölker"), { attrs: "nutztier" }),
  n("Tierbedarf", leaves("Hundebedarf", "Katzenbedarf", "Kleintierbedarf", "Vogelbedarf", "Aquarien & Zubehör", "Terrarien & Zubehör", "Reitbedarf", "Futter"), { attrs: "waren" }),
  n("Tierbetreuung & Dienstleistungen", leaves("Hundesitter / Gassi-Service", "Katzensitter", "Tierpension", "Hundetraining", "Tierfriseur", "Tiertransport"), { attrs: "service", price: "optional" }),
  n("Vermisste & gefundene Tiere", leaves("Vermisst", "Gefunden"), { attrs: "vermisst", price: "none" }),
], { icon: "🐾", price: "optional" });

// ---------- Maschinen & Industrie ----------

const maschinen = n("Maschinen & Industrie", [
  n("Baumaschinen", leaves("Bagger", "Minibagger", "Radlader", "Kompaktlader", "Planierraupe / Dozer", "Grader", "Walzen", "Dumper", "Teleskoplader", "Baukräne / Turmdrehkräne", "Mobilkräne", "Betonpumpen", "Asphaltfertiger", "Bohrgeräte", "Brecher & Siebanlagen", "Gerüste & Schalung", "Baucontainer", "Andere Baumaschinen")),
  n("Landmaschinen", [
    n("Traktoren", leaves("Standardtraktor", "Schmalspurtraktor", "Kompakttraktor", "Oldtimer-Traktor"), { attrs: "traktor" }),
    n("Erntemaschinen", leaves("Mähdrescher", "Feldhäcksler", "Rübenroder", "Kartoffelroder", "Ballenpressen")),
    n("Bodenbearbeitung & Saat", leaves("Pflüge", "Grubber & Eggen", "Sämaschinen", "Fräsen")),
    n("Pflanzenschutz & Düngung", leaves("Feldspritzen", "Düngerstreuer", "Güllefässer")),
    n("Hof- & Stalltechnik", leaves("Hoflader", "Melktechnik", "Fütterungstechnik", "Stalleinrichtung")),
    n("Forstmaschinen", leaves("Harvester", "Forwarder", "Seilwinden", "Holzspalter", "Häcksler")),
    n("Landwirtschaftliche Anhänger", undefined),
    n("Bewässerung", undefined),
  ]),
  n("Flurförderzeuge & Lagertechnik", leaves("Gabelstapler", "Hubwagen", "Arbeitsbühnen & Hubsteiger", "Regalsysteme", "Container")),
  n("Industrie- & Werkstattmaschinen", leaves("CNC-Maschinen", "Drehmaschinen", "Fräsmaschinen", "Bohrmaschinen", "Pressen & Stanzen", "Schweißgeräte", "Laser- & Plasmaschneider", "Kompressoren", "Holzbearbeitung", "Metallbearbeitung", "Kunststoffverarbeitung", "Verpackungsmaschinen", "Druckmaschinen", "Textilmaschinen", "Hebebühnen & Kfz-Werkstatttechnik")),
  n("Gastronomie- & Lebensmitteltechnik", leaves("Großküchengeräte", "Kühltechnik", "Backöfen & Bäckereitechnik", "Kaffeemaschinen (Gewerbe)", "Fleischereitechnik", "Food Trucks & Verkaufsstände", "Gastro-Einrichtung")),
  n("Energie & Elektrotechnik", leaves("Stromerzeuger / Generatoren", "Photovoltaik & Speicher", "Windkraft", "Transformatoren", "Schaltanlagen", "Kabel & Leitungen", "Blockheizkraftwerke")),
  n("Medizintechnik & Laborgeräte", leaves("Praxiseinrichtung", "Dentaltechnik", "Laborgeräte", "Rollstühle & Pflegebetten", "Kosmetik- & Studiogeräte")),
  n("Büro- & Ladeneinrichtung", leaves("Büroausstattung", "Ladeneinrichtung", "Kassensysteme", "Verkaufsautomaten")),
  n("Maschinen-Ersatzteile", leaves("Baumaschinen-Teile", "Landmaschinen-Teile", "Industrie-Ersatzteile", "Hydraulik", "Motoren & Getriebe"), { attrs: "teile" }),
  n("Maschinenvermietung", leaves("Baumaschinen mieten", "Landmaschinen mieten", "Arbeitsbühnen mieten", "Stapler mieten"), { priceUnit: "/ Tag" }),
  n("Unternehmen & Firmenverkauf", leaves("Firmenverkauf / Nachfolge", "Beteiligungen", "Franchise", "Geschäftsübernahme"), { attrs: "allgemein" }),
], { icon: "🚜", attrs: "maschine", price: "required" });

// ---------- Handwerker & Dienstleistungen ----------

const dienstleistungen = n("Handwerker & Dienstleistungen", [
  n("Renovierung & Bau", leaves("Maler & Lackierer", "Bodenleger / Parkett", "Fliesenleger", "Trockenbau", "Maurer & Betonbau", "Dachdecker", "Zimmerer", "Fassade & Dämmung", "Fenster & Türen", "Schlüsseldienst", "Abbruch & Entkernung", "Architekten & Bauplanung", "Komplettsanierung")),
  n("Elektro, Sanitär & Heizung", leaves("Elektriker", "Installateur / Sanitär", "Heizungsbau & Wärmepumpen", "Klimaanlagen", "Photovoltaik-Installation", "Wallbox-Installation", "Rohrreinigung", "Schornsteinfeger")),
  n("Umzug & Transport", leaves("Umzugsunternehmen", "Umzugshelfer", "Möbeltransport", "Kurierdienst", "Entrümpelung & Haushaltsauflösung", "Klaviertransport", "Lagerung / Self-Storage", "Möbelmontage"), { attrs: "umzug" }),
  n("Reinigung", leaves("Wohnungsreinigung", "Büroreinigung", "Fensterreinigung", "Teppich- & Polsterreinigung", "Endreinigung nach Umzug", "Treppenhausreinigung", "Gebäudereinigung")),
  n("Garten & Außenanlagen", leaves("Gartenpflege", "Garten- & Landschaftsbau", "Baumfällung & Baumpflege", "Zaunbau", "Pflasterarbeiten", "Winterdienst", "Poolbau & -pflege")),
  n("Haushalt & Reparaturen", leaves("Hausmeisterservice", "Haushaltsgeräte-Reparatur", "Handy- & PC-Reparatur", "TV- & Elektronik-Reparatur", "Schneiderei & Änderungen", "Schuster", "Uhrmacher & Goldschmied", "Kammerjäger / Schädlingsbekämpfung")),
  n("Auto & Fahrzeugservice", leaves("Kfz-Werkstatt", "Karosserie & Lack", "Reifenservice", "Fahrzeugaufbereitung", "Abschleppdienst", "Kfz-Gutachter", "Autoglas", "Fahrzeugüberführung", "Bootsservice & Winterlager", "Flugzeugwartung")),
  n("Computer, IT & Internet", leaves("IT-Service & Netzwerk", "Webdesign & Webentwicklung", "App-Entwicklung", "Online-Marketing & SEO", "Social Media", "Datenrettung", "Grafikdesign")),
  n("Büro, Recht & Finanzen", leaves("Steuerberatung", "Buchhaltung", "Rechtsanwälte", "Übersetzer & Dolmetscher", "Versicherungen", "Finanzberatung", "Immobilienmakler", "Hausverwaltung", "Unternehmensberatung", "Notare")),
  n("Gesundheit & Pflege", leaves("Ambulante Pflege", "Seniorenbetreuung", "Physiotherapie", "Massage", "Ernährungsberatung", "Hebammen", "Psychologische Beratung", "Heilpraktiker")),
  n("Beauty & Wellness", leaves("Friseur", "Kosmetik", "Nageldesign", "Barbershop", "Make-up Artist", "Tattoo & Piercing", "Wimpern & Augenbrauen")),
  n("Events & Feiern", leaves("Hochzeitsplanung", "Catering", "DJ & Musiker", "Fotografen & Videografen", "Location-Vermietung", "Deko & Blumen", "Zauberer & Entertainer", "Kinderanimation", "Equipment-Verleih", "Konditorei & Hochzeitstorten")),
  n("Kreativ & Medien", leaves("Fotografie", "Video & Film", "Texte & Lektorat", "Druck & Werbetechnik", "Musikproduktion")),
  n("Sicherheit", leaves("Sicherheitsdienst", "Alarmanlagen-Installation", "Detektei")),
  n("Sonstige Dienstleistungen", leaves("Tierdienstleistungen", "Fahrdienste", "Behördengänge & Begleitung", "Sonstiges")),
], { icon: "🛠️", attrs: "service", price: "optional", priceLabel: "Preis ab" });

// ---------- Unterricht & Kurse ----------

const unterricht = n("Unterricht & Kurse", [
  n("Nachhilfe & Schule", leaves("Mathematik", "Deutsch", "Englisch", "Physik", "Chemie", "Biologie", "Geschichte & Politik", "Latein", "Informatik", "Hausaufgabenbetreuung", "Abiturvorbereitung", "MSA-Vorbereitung", "Grundschulförderung", "Legasthenie & Dyskalkulie")),
  n("Studium & Uni", leaves("Mathematik & Statistik", "Wirtschaft & BWL", "Jura", "Medizin", "Ingenieurwesen", "Informatik", "Abschlussarbeiten-Coaching (ohne Ghostwriting)")),
  n("Sprachkurse", leaves("Deutsch als Fremdsprache", "Integrationskurs-Vorbereitung", "Englisch", "Türkisch", "Arabisch", "Französisch", "Spanisch", "Italienisch", "Russisch", "Polnisch", "Ukrainisch", "Chinesisch", "Japanisch", "Kurdisch", "Persisch", "Gebärdensprache", "Andere Sprachen")),
  n("Musikunterricht", leaves("Gitarre", "Klavier", "Gesang", "Schlagzeug", "Geige", "Saz / Bağlama", "Oud", "Darbuka", "Bass", "Blasinstrumente", "Musiktheorie", "DJ-Kurse")),
  n("Tanzkurse", leaves("Standard & Latein", "Salsa & Bachata", "Hip-Hop & Streetdance", "Ballett", "Orientalischer Tanz", "Volkstanz", "Kindertanz", "Hochzeitstanz")),
  n("Sport & Fitness", leaves("Personal Training", "Yoga", "Pilates", "Kampfsport & Selbstverteidigung", "Schwimmkurse", "Tennis", "Reitunterricht", "Klettern", "Golf", "Segel- & Surfkurse")),
  n("Fahrschulen & Führerschein", leaves("Autoführerschein", "Motorradführerschein", "Lkw & Bus", "Bootsführerschein (SBF)", "Pilotenschein (PPL/UL)", "Drohnenführerschein", "Fahrsicherheitstraining"), { attrs: "fahrschule" }),
  n("Computer & IT", leaves("Programmieren", "Office-Programme", "Bildbearbeitung & Design", "Computer für Senioren", "IT-Zertifizierungen", "KI-Anwendungen")),
  n("Kunst & Kreativität", leaves("Malen & Zeichnen", "Fotografie", "Töpfern & Keramik", "Nähen & Schneidern", "Schauspiel", "Kalligrafie")),
  n("Beruf & Weiterbildung", leaves("Bewerbungstraining", "Rhetorik & Präsentation", "Coaching", "Buchhaltung & Steuern", "Gastronomie & Barista", "Erste-Hilfe-Kurse", "Sachkundenachweise")),
  n("Kochen & Backen", leaves("Kochkurse", "Backkurse", "Internationale Küche")),
  n("Kinderbetreuung & Frühförderung", leaves("Babykurse (PEKiP & Co.)", "Kreativkurse für Kinder", "Frühförderung")),
], { icon: "🎓", attrs: "unterricht", price: "optional", priceUnit: "/ Std.", priceLabel: "Preis" });

// ---------- Jobs ----------

const jobBranchen = leaves(
  "Büro & Verwaltung", "IT & Softwareentwicklung", "Ingenieurwesen & Technik", "Handwerk",
  "Bau & Architektur", "Gastronomie & Hotellerie", "Einzelhandel & Verkauf", "Logistik & Lager",
  "Fahrer & Kurier", "Gesundheit & Medizin", "Pflege & Betreuung", "Erziehung & Pädagogik",
  "Lehrer & Dozenten", "Reinigung & Facility", "Sicherheit & Bewachung", "Marketing & Werbung",
  "Vertrieb & Außendienst", "Kundenservice & Callcenter", "Finanzen & Buchhaltung", "Banken & Versicherungen",
  "Recht", "Personalwesen", "Medien & Design", "Produktion & Fertigung", "Kfz & Mechatronik",
  "Landwirtschaft & Gartenbau", "Tourismus & Reisen", "Kosmetik & Friseur", "Sport & Fitness",
  "Öffentlicher Dienst", "Soziales & Non-Profit", "Wissenschaft & Forschung", "Luftfahrt & Schifffahrt",
  "Energie & Umwelt", "Immobilien", "Sonstige Berufe",
);

const jobs = n("Jobs & Stellenangebote", [
  n("Stellenangebote", jobBranchen),
  n("Minijobs & Nebenjobs", leaves("Aushilfe", "Minijob", "Studentenjob", "Wochenendjob", "Heimarbeit")),
  n("Ausbildung & Praktikum", leaves("Ausbildungsplätze", "Duales Studium", "Praktikum", "Werkstudent", "FSJ / BFD")),
  n("Freelancer & Projekte", leaves("IT-Projekte", "Design & Medien", "Texte & Übersetzung", "Beratung", "Handwerk")),
  n("Stellengesuche", jobBranchen, { attrs: "jobsuche" }),
], { icon: "💼", attrs: "job", price: "none" });

// ---------- Haushaltshilfe & Betreuung ----------

const betreuung = n("Haushaltshilfe & Betreuung", [
  n("Babysitter & Kinderbetreuung", leaves("Babysitter", "Tagesmutter / Tagesvater", "Kindermädchen / Nanny", "Au-pair", "Leihgroßeltern")),
  n("Senioren- & Krankenbetreuung", leaves("Seniorenbetreuung", "24-Stunden-Pflege", "Alltagsbegleitung", "Demenzbetreuung", "Pflegekraft")),
  n("Haushaltshilfe & Reinigungskraft", leaves("Haushaltshilfe", "Putzhilfe", "Bügelservice", "Haushälterin")),
  n("Hauspersonal", leaves("Koch / Köchin", "Chauffeur / Fahrer", "Gärtner", "Hausmeister", "Butler / Hausverwalter")),
  n("Betreuung gesucht", leaves("Kinderbetreuung gesucht", "Seniorenbetreuung gesucht", "Haushaltshilfe gesucht")),
], { icon: "👪", attrs: "haushaltshilfe", price: "optional", priceUnit: "/ Std.", priceLabel: "Stundenlohn" });

// ---------- Sonstiges ----------

const sonstiges = n("Sonstiges", [
  n("Büro & Schreibwaren", undefined, { attrs: "waren" }),
  n("Hochzeit & Feste", leaves("Brautkleider", "Anzüge", "Dekoration", "Ringe"), { attrs: "waren" }),
  n("Religiöse & kulturelle Artikel", undefined, { attrs: "waren" }),
  n("Alles Andere", undefined, { attrs: "waren" }),
], { icon: "📦", price: "required" });

export const CATEGORY_TREE: CategoryNode[] = [
  immobilien,
  fahrzeuge,
  teile,
  elektronik,
  hausGarten,
  mode,
  familie,
  freizeit,
  tiere,
  maschinen,
  dienstleistungen,
  unterricht,
  jobs,
  betreuung,
  nachbarschaft,
  sonstiges,
];
