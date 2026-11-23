# dasdiesdas

Kleinanzeigen-Portal für Berlin und ganz Deutschland. Hier kann alles angeboten und gesucht werden: Immobilien, Autos, Motorräder, Boote und Schiffe, Flugzeuge und Hubschrauber, Maschinen, Ersatzteile, Elektronik, Mode, Tiere, Jobs, Nachhilfe und Lehrkräfte, Handwerker, Haushaltshilfen, Veranstaltungen und vieles mehr.

## Funktionsumfang

| Bereich | Inhalt |
|---|---|
| **Kategorien** | 16 Hauptbereiche, 1.384 Kategorien, aufgebaut nach dem Vorbild großer Marktplätze wie sahibinden.com und an Deutschland angepasst (`src/lib/categories/tree.ts`) |
| **Merkmale** | Eigene Formularfelder und Suchfilter je Kategorie, z. B. Zimmer, m², Energieausweis, WBS (Wohnen), Erstzulassung, km, PS, Umweltplakette (Autos), Länge, Rumpfmaterial, CE-Kategorie (Boote), Flugstunden, IFR, ARC (Flugzeuge), Niveau, Unterrichtsort (Nachhilfe), Anstellungsart, Gehalt (Jobs) usw. |
| **Standorte** | 16 Bundesländer mit Städtevorschlägen; Berlin mit allen 12 Bezirken und 96 Ortsteilen; Postleitzahlprüfung |
| **Suche** | Volltext (Trigramm-Index), Kategorie, Ort/Bezirk/Ortsteil/PLZ, Preis, alle Merkmalsfilter, privat/gewerblich, Angebot/Gesuch, mit Bildern, Sortierung, Seitennavigation, Trefferzahlen je Unterkategorie |
| **Anzeigen** | Aufgeben mit Kategoriesuche, bis zu 20 Bilder (automatisch verkleinert, WebP, EXIF/GPS entfernt), Bearbeiten, Deaktivieren, Verlängern (60 Tage Laufzeit), Löschen |
| **Nutzer** | Registrierung (privat/gewerblich), E-Mail-Bestätigung, Login, Passwort vergessen, Profil, Impressum für gewerbliche Anbieter, öffentliches Anbieterprofil |
| **Kommunikation** | Nachrichtensystem mit E-Mail-Benachrichtigung (E-Mail-Adressen bleiben verborgen), Telefonnummer optional, Merkliste, gespeicherte Suchen |
| **Moderation** | Admin-Bereich: Statistiken, Freigabe/Ablehnung/Sperrung von Anzeigen, Meldungen (DSA-Meldeverfahren mit Begründung an Beteiligte), Nutzer sperren, Admin-Rechte vergeben; optionale Vorab-Prüfung |
| **Recht & Datenschutz** | Impressum, Datenschutzerklärung, AGB, Liste verbotener Artikel, Meldefunktion (Art. 16 DSA), Datenexport (Art. 15/20 DSGVO), Kontolöschung (Art. 17 DSGVO); keine Tracking-Cookies, daher kein Cookie-Banner nötig |
| **Sicherheit** | Passwort-Hashing (bcrypt), sichere Sitzungs-Cookies, Rate-Limits (Login, Registrierung, Nachrichten, Uploads, Meldungen), Honeypot gegen Bots, Prüfung von Bildinhalten, Security-Header |
| **SEO** | Sitemap, robots.txt, Metadaten und Open-Graph-Daten je Seite |

## Technik

Next.js 16 (App Router, Server Actions) · React 19 · TypeScript · Tailwind CSS 4 · PostgreSQL 16 · Prisma 7 · sharp · nodemailer

## Lokal starten

Voraussetzungen: Node.js ab 20.9 und PostgreSQL ab 13.

```bash
npm install
cp .env.example .env          # DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD anpassen
npx prisma migrate deploy     # Datenbanktabellen anlegen
npm run seed                  # Admin-Konto anlegen
npm run seed:demo             # optional: 35 Demo-Anzeigen mit Platzhalterbildern
npm run dev                   # http://localhost:3000
```

Ohne SMTP-Konfiguration werden E-Mails (Bestätigungslinks usw.) nur im Terminal ausgegeben.

Demo-Login nach `seed:demo`: `anna.demo@example.com` / `Demo!Passwort2026`

## Produktion mit Docker

```bash
cp .env.example .env    # alle Werte ausfüllen, insbesondere SMTP und OPERATOR_*
echo "POSTGRES_PASSWORD=$(openssl rand -hex 24)" >> .env
docker compose up -d --build
```

Dabei starten PostgreSQL, die Migration samt Admin-Seed und die App auf Port 3000. Bilder liegen im Volume `uploads`, die Datenbank im Volume `pgdata`. Beide Volumes müssen regelmäßig gesichert werden. Davor gehört ein Reverse Proxy mit HTTPS, z. B. Caddy oder nginx.

## Vor dem Livegang (Checkliste)

1. **Impressum und Datenschutz:** Alle `OPERATOR_*`-Werte, `MAIL_PROVIDER_INFO` und den Hoster in `.env` eintragen. Fehlende Angaben erscheinen auf der Seite gelb markiert.
2. **Rechtliche Prüfung:** AGB, Datenschutzerklärung und Impressum sind sorgfältige Vorlagen, ersetzen aber keine anwaltliche Prüfung.
3. **SMTP** einrichten, z. B. bei einem EU-Anbieter mit Auftragsverarbeitungsvertrag.
4. **Domain:** `APP_URL` und `SITE_DOMAIN` auf `https://dasdiesdas.de` bzw. `.com` setzen.
5. **Moderation:** Bei Bedarf `LISTING_MODERATION="true"` setzen; dann prüfen Admins neue Anzeigen vor der Veröffentlichung.
6. **Backups** für Datenbank und Upload-Verzeichnis einrichten.

## Projektstruktur

```
prisma/schema.prisma          Datenbankschema
src/lib/categories/           Kategorienbaum, Merkmale je Kategorie
src/lib/locations.ts          Bundesländer, Städte, Berliner Bezirke/Ortsteile
src/lib/server/               Datenbank, Auth, Suche, Bilder, E-Mail, Rate-Limit
src/app/actions/              Server Actions (Anzeigen, Nachrichten, Konto, Admin …)
src/app/                      Seiten (Startseite, Suche, Anzeige, Konto, Admin, Recht)
scripts/seed.ts               Admin- und Demo-Daten
```

**Kategorien ergänzen:** Neue Einträge in `src/lib/categories/tree.ts` hinzufügen. Bestehende Kategorien nicht umbenennen, denn der Name ergibt die URL bzw. ID, die in den Anzeigen gespeichert ist.

## Bekannte Grenzen

- Kein Umkreissuche-Radius (km), weil dafür eine Geodatenbank mit allen Postleitzahlen und Koordinaten nötig ist. Suche nach Bundesland, Ort, Bezirk, Ortsteil und PLZ-Anfang funktioniert.
- Keine Bezahlfunktionen (Premium-Anzeigen, Hervorhebungen); sie lassen sich später ergänzen.
- Rate-Limits liegen im Arbeitsspeicher. Das passt für einen Server; bei mehreren Instanzen wird Redis o. Ä. nötig.
- HEIC-Bilder werden nicht verarbeitet. iPhones wandeln beim Upload im Browser aber normalerweise automatisch in JPEG um.
