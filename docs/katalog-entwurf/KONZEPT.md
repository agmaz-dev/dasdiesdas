# Katalog-Entwurf dasdiesdas – Konzept, Entscheidungen, offene Punkte

Stand: 24.11.2026 · Erarbeitet im Chat mit dem Inhaber (Claude, Chrome-Seitenleiste)

**Zuerst lesen.** Diese Datei beschreibt den neuen Aufbau von Katalog, Filtern und „Anzeige aufgeben“.
Der klickbare Entwurf liegt daneben:

| Datei | Inhalt |
|---|---|
| `index.html` | Klickbarer Entwurf (Desktop-Webseite). Lokal öffnen: im Ordner `npx serve` oder `python3 -m http.server`, dann `index.html` aufrufen (lädt `data.json` per fetch, direktes Öffnen per Doppelklick geht nicht). |
| `data.json` | Vollständige Daten des Entwurfs: Kategorienbaum (1.360 Kategorien), Merkmal-Sets, Marke→Modell-Kataloge, Markenlisten je Unterkategorie, Abhängigkeiten, Hinweise. |
| `KONZEPT.md` | Diese Datei. |

Online-Version des Entwurfs (nur für den Inhaber sichtbar): Claude-Artefakt „dasdiesdas Katalog-Entwurf“
(https://claude.ai/artifact/DkKfbRep7tjo8PhtmJ1U1K).

Wichtig: Der Entwurf ist **noch nicht** in die echte Seite (Next.js, `src/lib/categories/tree.ts`, `attributes.ts`, `src/lib/catalog`) übernommen.
Die Live-Vorschau auf Cloudflare ist unverändert. Anzeigen und Zahlen im Entwurf sind ausgedacht.

---

## 1. Grundkonzept (vom Inhaber abgenommen – nicht verwerfen)

1. **Katalog links, Anzeigen in der Mitte.** Schmale Seitenleiste zum Durchklicken *nach unten* (Pfad oben, „‹ zurück“, Anzahl je Kategorie).
   Die Anzeigen in der Mitte bleiben immer sichtbar und wechseln bei jedem Klick sofort mit.
2. **Katalog statt reiner KI-Suche.** Der Kunde soll sehen, dass er alles sieht (Inhaltsverzeichnis). Die Suche führt *in* den Katalog.
3. **Desktop-Webseitenansicht** ist die Vorlage (keine Handyansicht als Basis).
4. **Eigenschaften unter dem Katalog** als anklickbare Knöpfe mit Mehrfachauswahl.
   Innerhalb einer Eigenschaft „oder“, zwischen Eigenschaften „und“; bei „Ausstattung und Merkmale“ muss alles Gewählte vorhanden sein.
5. **Reihenfolge der Eigenschaften (überall):**
   1. Die Sache finden – je Kategorie festgelegt (z. B. Ersatzteile: Zustand → Hersteller; Reifen: Saison → Breite → Querschnitt → Zoll; Kleidung/Schuhe: Marke → Modell → Größe)
   2. Weitere Details, Ausstattung und Merkmale
   3. **Preis**
   4. **Übergabe**
   5. **Ort und Umkreis**

   Preis, Übergabe und Ort sind anfangs zugeklappt. Die ersten 4 „Finden“-Eigenschaften sind aufgeklappt.
6. **Zahlenwerte:** feste Stufen als Knöpfe **plus** Felder „von“ und „bis“ zum Selbsteintragen. Nur „von“, nie „ab“ (Inhaber-Entscheidung).
7. **Jede Unterscheidung nur an einer Stelle.** Was Ordner im Katalog ist (z. B. Fahrzeugart, Handy-Marke, Fahrradart), erscheint nicht zusätzlich als Eigenschaft.
   Regel im Entwurf: Eine Auswahl-Eigenschaft wird ausgeblendet, wenn ≥ 2 ihrer Werte als Unterkategorien im Pfad vorkommen.
8. **Gewählte Eigenschaften oben als Chips** mit ✕ und „Alle Eigenschaften löschen“.
9. **Ort:** PLZ oder Ortsname + Umkreis (5, 10, 25, 50, 100 km, ganz Deutschland). Keine festen Bezirkslisten im Filter.
   Bei „Immobilien Ausland“ entfällt der Ort-Filter; im Formular wird „Ort / Region im Ausland“ abgefragt.

## 2. Kopfzeile und Suche

- **Logo** „das**dies**das“: nur „dies“ orange, größer (36 px im Entwurf). Logo-Grafik bleibt die der echten Seite (Vorentwurf).
- **Suchfeld** breit, reicht fast bis „Anzeige aufgeben“.
- **KI fest im Suchfeld** (kein Extra-Knopf): ✦ links, „mit KI“ rechts.
  - Beim Tippen: oben „✦ Mit KI suchen: …“, darunter passende Kategorien mit vollem Pfad.
  - Enter: KI wertet den Satz aus → öffnet Kategorie, setzt Eigenschaften, Preis, Ort; Zeile „KI hat verstanden: …“ über den Anzeigen.
  - Erkennt u. a. Marke → Unterkategorie (Lloyd → Business-Schuhe, Rolex → Luxusuhren), Modelle (iPhone 18 Pro Max, PS5 Pro, RTX 5070 Ti),
    Reifengrößen (205 55 R16), „65 Zoll“, „bis 15.000 €“, „in Potsdam 10 km“, PLZ.
  - **Im Entwurf nur Regelwerk im Browser.** Auf der echten Seite: **Cloudflare Workers AI** (kostenlos, im bestehenden Worker), gleiches Ergebnisformat.
    Hinweis: `docs/STAND.md` nennt noch „Claude-API“ für KI-Vorschläge – laut Rahmenbedingung des Inhabers gilt **Cloudflare-KI statt Claude-API**, keine neuen Konten/Kreditkarten.
- **Suchabkürzungen** (im Entwurf `SHORT` in `index.html`): z. B. „Elektroauto“ → Autos + Kraftstoff Elektro, „Oldtimer“ → Autos + H-Kennzeichen,
  „Kapitalanlage“ → Wohnen › Kaufen + vermietet, „iPad“, „Brautkleid“, „Food Truck“, „Balkonkraftwerk“, „PS5“, „RTX“, „DDR5“ …

## 3. „Anzeige aufgeben“

- Gleicher Katalog: Schritt 1 Kategorie bis zur letzten Ebene wählen (links oder per Suche), Schritt 2 Formular.
- Formular-Blöcke: **Was bietest du an?** (Titel, Beschreibung, bis 10 Fotos) → **Eigenschaften** (genau die Filter-Eigenschaften der Kategorie) → **Preis** (+ VB, Hinweis der Kategorie) → **Übergabe und Ort** (PLZ + Ort).
- Pflichtfelder rot geprüft (Titel ≥ 5 Zeichen, PLZ 5 Ziffern, Zahlen in Grenzen).
- Abhängige Felder (Marke → Modell/Prozessor usw.) wie im Filter.
- Entwurf speichert nichts. Hinweis: Laut `docs/STAND.md` ist „Inserieren in 4 Schritten (Foto zuerst) mit Preisvorschlag“ bereits als nächster Schritt geplant – beides zusammenführen.

## 4. Kategorien – Änderungen gegenüber `tree.ts`

Vollständige Daten in `data.json` (`tree`). Wichtigste Änderungen:

### Fahrzeuge
- **Autos** mit 11 Fahrzeugarten als Ordner: Limousine, Kombi, Kleinwagen, SUV, Geländewagen, Pick-up, Van / Minibus, Cabrio / Roadster, Coupé, Sportwagen, Andere.
  Merkmal „Fahrzeugtyp“ entfällt.
- **Gelöscht/zusammengelegt:** „SUV, Geländewagen & Pick-up“, „Elektroautos“ (→ Kraftstoff), „Oldtimer & Klassiker“ (→ Merkmal „Oldtimer / Youngtimer (H-Kennzeichen)“),
  „Unfallfahrzeuge & Bastlerfahrzeuge“ (→ Fahrzeugzustand), „Fahrzeuge mit Behindertenumbau“ (→ Merkmal bei Autos und Transportern).
  Dabei weggefallen ohne neuen Platz: Oldtimer Nutzfahrzeug, DDR-Fahrzeuge, Motorschaden, Ankauf / Export, Fahrhilfen / Umbauten (Oldtimer-Traktor liegt unter Landmaschinen).
- **Kennzeichen & Taxi-/Mietwagenkonzessionen gelöscht** (Konzessionen dürfen nicht einzeln verkauft werden). **Wunschkennzeichen** bleibt als eigener Punkt unter Fahrzeuge.
- **Fahrräder:** Fahrradarten als Ordner (City / Trekking, Mountainbike, Rennrad / Gravel, E-Bike / Pedelec, Lastenrad, Kinderrad, BMX, Klapprad, E-Scooter, Fahrradanhänger, Andere); Merkmal „Art“ entfällt.
- **Boote:** SUP / Surfbrett raus (→ Sport › Wassersport), Hausboot-Charter raus (→ Ferienwohnungen).
- Eigene Merkmal-Sets für Motorroller/Mofa/E-Roller, Quads, E-Scooter, Fahrradanhänger, Kanu/Kajak/Ruderboot, Liegeplätze, Gleitschirme, Heißluftballone, Flugzeug-Charter, Busse (Sitzplätze), Transporter (Behindertenumbau), Fahrzeugvermietung.

### Immobilien
- Wohnen › Mieten ohne „Haus“, „Möbliertes Wohnen auf Zeit“, „Seniorenwohnung“ (Doppelungen; Suchabkürzungen führen an die verbliebene Stelle).
- Wohnen › Kaufen ohne „Kapitalanlage (vermietet)“ (→ Merkmal) und „Fertighaus / Neubau“ (→ Neubauprojekte).
- Gewerbe ohne „Hotel / Pension“ (→ Hotels & Tourismus) und ohne „Coworking-Platz“ bei Kaufen / Nachmieter.
- **Immobilien Ausland** jetzt **Kaufen** und **Mieten**, je mit allen Ländern und Merkmal „Objektart“ (Wohnung, Haus, Villa, Grundstück, Gewerbe).
- Immobilien-Gesuche mit Merkmalen (Mieten oder Kaufen, Zimmer, Wohnfläche, Budget).

### Unternehmen
- **Unternehmen & Firmenverkauf** ist eigener Hauptbereich (🏢), nicht mehr unter Maschinen & Industrie. Hinweis zu Konzessionen.
  *Inhaber: „muss man noch mal gucken“ – noch offen.*

### Elektronik (vom Inhaber als wichtigste Abteilung bezeichnet)
- **Handys:** Marken als Ordner (Apple, Samsung, Google, Xiaomi, Huawei, OnePlus, Motorola, Nokia, Sony, Oppo, Honor, Nothing, Fairphone, Andere Marke, Tastenhandys).
  Merkmale + Akkuzustand, ohne SIM-Lock, mit OVP. Modelle ergänzt: iPhone 18 Pro (Max), iPhone Duo, iPhone 17e, Galaxy S26-Reihe, Pixel 11-Reihe.
- **Handy-Zubehör:** Hüllen & Schutzfolien, Ladegeräte & Kabel, Powerbanks, Halterungen & Ständer, Speicherkarten & USB-Sticks, Ersatzteile & Akkus
  (Kopfhörer → Audio & HiFi, Smartwatches → Mode › Uhren).
- **Tablets & E-Reader:** getrennt in Tablets (eigener Katalog, iPads mit allen Generationen bis iPad Air M4 / iPad Pro M5, Galaxy Tab S11 …), E-Reader (eigener Katalog), neu Tablet-Zubehör.
- **Computer:** eigene Merkmale für Laptops, Desktop-/Gaming-PCs, Server, Mini-PCs (Prozessor, Grafikkarte, RAM, Speicher, Betriebssystem …).
- **PC-Zubehör & Komponenten:** Prozessoren und Mainboards getrennt; neu Netzteile, PC-Gehäuse, Kühlung & Lüfter, Webcams & Mikrofone, Dockingstationen & Adapter.
  Grafikchips RTX 50/40/30/20, GTX, Radeon RX 9000/7000/6000, Intel Arc.
- **Foto, TV, Audio, Konsolen, Haushaltsgeräte, Smart Home, Telefone, Bauteile/Messtechnik:** je Unterkategorie eigene Marken und Merkmale
  (z. B. TV: Größe, Auflösung, OLED/QLED/Mini-LED; Konsolen: genaues Modell, Spieltitel, USK; Waschmaschinen: kg, Energieklasse).

### Mode, Familie, Freizeit, Haus
- Kleidung: Größen-Knöpfe (XS–3XL, Konfektionsgröße), Kinder 50–176; Schuhe einzelne Größen (Damen 35–43, Herren 39–48, Kinder 18–38).
- Marke + Feld **„Modell / Bezeichnung“** (z. B. „Air Max Plus TN“, „Submariner“, „Neverfull“).
- Merkmal **„Echtheitsnachweis vorhanden“**; Hinweis „Nur Originalware“ bei Mode & Beauty.
- Möbel: Farbe, Material, Breite. Babyausstattung, Spielzeug, Sport, Musikinstrumente mit Marken und eigenen Merkmalen.
- Tickets: Datum, Anzahl, Ticket-Art (personalisiert) + Hinweis. Mitfahrgelegenheit: „Kostenbeteiligung pro Person“ + Hinweis (PBefG).
- **Freizeitpartner & Gruppen gelöscht.** Reisebegleitung → **Reisepartner** (ohne Preis).
- Weitere Doppelungen entfernt: Modelleisenbahn (Spielzeug), Reitsport, Camping-Rucksäcke, Antike Möbel und Kinder- & Jugendmöbel (Möbel), Brautkleider/Anzüge/Ringe (Hochzeit),
  Kindersitze (Auto-Zubehör), Bootstrailer (Zubehör), Food Trucks (Maschinen), Rollstühle (Maschinen), Seniorenbetreuung und Tierdienstleistungen (Dienstleistungen),
  Wand- & Standuhren → Deko, Wasserpflanzen → Tierbedarf.

### Umzug bestehender Anzeigen (beim Übernehmen nötig)
Anzeigen speichern die Kategorie-ID (Slug-Pfad). Für gelöschte/zusammengelegte Kategorien eine Zuordnung alt → neu (+ gesetztes Merkmal) anlegen, z. B.:

| Alt | Neu |
|---|---|
| Fahrzeuge › Elektroautos › * | Fahrzeuge › Autos (Kraftstoff = Elektro / Hybrid / Plug-in-Hybrid) |
| Fahrzeuge › SUV, Geländewagen & Pick-up › SUV / Geländewagen / Pick-up | Fahrzeuge › Autos › SUV / Geländewagen / Pick-up |
| Fahrzeuge › Oldtimer & Klassiker › Oldtimer Pkw / Youngtimer | Fahrzeuge › Autos (Merkmal H-Kennzeichen) |
| Fahrzeuge › Oldtimer & Klassiker › Oldtimer Motorrad | Fahrzeuge › Motorräder & Motorroller (Merkmal H-Kennzeichen) |
| Fahrzeuge › Unfallfahrzeuge & Bastlerfahrzeuge › Unfallwagen Pkw | Fahrzeuge › Autos (Zustand = Unfallfahrzeug) |
| Fahrzeuge › Kennzeichen & … › Wunschkennzeichen | Fahrzeuge › Wunschkennzeichen |
| Fahrzeuge › Kennzeichen & … › Taxi-/Mietwagenkonzession | **löschen / ablehnen** (nicht zulässig) |
| Elektronik › Handys & Smartphones › iPhone / Google Pixel | › Apple / Google |
| Elektronik › Tablets & E-Reader › iPad / Android-Tablets / Windows-Tablets | › Tablets |
| Elektronik › PC-Zubehör › Prozessoren & Mainboards | › Prozessoren oder › Mainboards |
| Immobilien › Immobilien Ausland › Land | › Immobilien Ausland › Kaufen › Land |
| Maschinen & Industrie › Unternehmen & Firmenverkauf › * | Unternehmen & Firmenverkauf › * |

Restliche Fälle: `data.json` (neu) mit `tree.ts` (alt) vergleichen.

## 5. Marken und abhängige Eigenschaften

- **Markenliste je Unterkategorie** (`brands` am Knoten in `data.json`), nicht je Bereich. Beispiel: Business-Schuhe = Lloyd, Hugo Boss, Bugatti, Clarks …, kein Nike.
  Übergeordnete Ordner zeigen die Vereinigung (häufigste zuerst). Leere Liste = kein Markenfeld (z. B. Edelsteine, Noten, Konsolen-Ordner).
  Händler sind keine Marken (Decathlon, Christ, Thomann entfernt).
- **Abhängigkeiten** (`dep` / `catdep` an Merkmalen in `data.json`): Optionen hängen von einer vorherigen Wahl ab; unpassende Auswahl wird automatisch entfernt. Beispiele:
  - Laptop/PC: Marke Apple → Prozessor nur Apple M1–M5 + Intel Core (ältere Macs), Betriebssystem nur macOS; andere Marken → kein Apple M, kein macOS
  - Prozessor: AMD → Ryzen/Threadripper + AM4/AM5; Intel → Core/Core Ultra/Xeon + LGA
  - Mainboard: Sockel → RAM-Typ (AM5/LGA1851 nur DDR5, AM4 nur DDR4 …)
  - Grafikkarte: Marke → Chip (Sapphire/PowerColor/XFX nur Radeon, Zotac/Palit/PNY … nur GeForce, ASRock Radeon + Arc)
  - Kamera/Objektiv: Marke → Bajonett (Canon RF/EF, Nikon Z/F, Sony E/A, Leica L/M, Hasselblad XCD …)
  - Smart Speaker: Marke → Sprachassistent; TV: TCL/Telefunken/Xiaomi ohne OLED
  - iPhone/iPad: Modell → Speichergrößen (iPhone 17/18 per Websuche geprüft)
  - Zubehör: „Passend für“ → Modellauswahl aus dem Handy-/Tablet-Katalog

## 6. Rechtliche Hinweise im Entwurf (je Kategorie, oben über den Anzeigen und im Formular)

Mode (nur Originalware), Tickets (personalisiert), Mitfahrgelegenheit (PBefG), Unternehmen (Konzessionen), Software und PC-Spiele (nur legale Lizenzen/Originale),
Überwachungskameras (Datenschutz), Funkgeräte (Zulassung), Balkonkraftwerke (Marktstammdatenregister), Split-Klimaanlagen (Fachbetrieb), Gasherde/Kochfelder (Fachkraft).
Alle Hinweise vor dem Livegang anwaltlich prüfen lassen.

---

## 7. Offene Punkte / nächste Schritte

### Vom Inhaber bereits gewünscht, noch nicht erledigt
1. **Abhängige Eigenschaften außerhalb der Elektronik** prüfen und einbauen (z. B. Autos: Tesla/Polestar → nur Elektro).
2. **Elektronik-Abhängigkeiten vervollständigen:** Speicher je Modell für Samsung, Google usw.; Bildtechnik der übrigen TV-Marken; Konsolen (Modell → Art).
3. **Unternehmen & Firmenverkauf** – Platz und Aufbau noch einmal mit dem Inhaber klären.
4. **Übernahme in die echte Seite:** `data.json` → `tree.ts`, `attributes.ts`, `src/lib/catalog`; Oberfläche (Katalog links, Eigenschaften, Chips, Reihenfolge, KI-Suchfeld, Formular) in Next.js nachbauen; Anzeigen-Umzug (Abschnitt 4).

### Daten prüfen
5. Rund 95 Markenlisten stammen aus Wissen, nicht aus Websuche (per Websuche geprüft: Business-Schuhe, Pumps, Umstandsmode, Lastenräder, Babytragen, Saz; Handys/Tablets/GPU-Modelle 2026).
6. Modelllisten Lenovo, Xiaomi, Huawei, OnePlus, Honor, E-Reader reichen nicht bis zu allen älteren Modellen; Samsung Galaxy Z Fold/Flip auf Aktualität prüfen.
7. Speicher älterer iPhones/iPads, Sockel/RAM, Bajonette, GPU-Hersteller aus Wissen – gegen Herstellerangaben prüfen.

### Vorschläge (Punkte 5–12 der Vorschlagsliste; 1–4 sind umgesetzt)
8. Startseite „Alle Kategorien“ mit großen Kacheln der Hauptbereiche + neueste Anzeigen.
9. Sortieren (neueste, Preis auf/ab, Entfernung).
10. Merken und Suche speichern mit Benachrichtigung (laut `STAND.md` Merkliste/gespeicherte Suchen bereits vorhanden – Benachrichtigung offen).
11. Anzeigen-Detailseite (Bilder, alle Eigenschaften, Karte, Kontakt, Melden).
12. Handyansicht: Katalog als Fenster von unten.
13. Verbotene Artikel (`src/lib/prohibited.ts`) beim Einstellen und in der KI-Suche prüfen.
14. Weitere Hinweise je Kategorie: Tiere (Mindestalter Welpen), Lebensmittel, Immobilien (Energieausweis-Pflicht).
15. Umkreissuche mit echter PLZ-Datenbank (Koordinaten); im Entwurf sind km-Angaben ausgedacht.

## 8. Arbeitsregeln des Inhabers (gelten weiter, siehe `docs/UEBERGABE.md`)
Deutsch, kurz, sachlich; klar sagen, was machbar ist; erst nach ausdrücklichem Okay umsetzen; bei Fehlermeldungen erst warten und nachfragen;
kostenlos bleiben (keine neuen Anmeldungen/Kreditkarten, Cloudflare-KI statt Claude-API).
