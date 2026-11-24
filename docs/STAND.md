# Projektstand dasdiesdas (Übergabe)

Stand: 23.11.2026

## Fertig
- Kleinanzeigen-Portal (Next.js 16, PostgreSQL, Prisma 7), siehe README.md
- 16 Hauptbereiche, 1.384 Kategorien, Merkmale und Filter je Kategorie
- Marke → Modell für Autos (76 Marken), Motorräder (30), Smartphones (13), Tablets (10)
- Berlin mit 12 Bezirken und 96 Ortsteilen, alle Bundesländer
- Registrierung, Anmeldung, E-Mail-Bestätigung, Anzeigen mit Bild-Upload, Suche, Merkliste,
  gespeicherte Suchen, Nachrichten, Meldungen (DSA), Admin-Moderation, Premium-Markierung, DSGVO-Export/Löschung
- Design nach Entwürfen des Inhabers: dunkel, Orange (#f97316) als Markenfarbe, Türkis (#2dd4bf) für Kategorien,
  Logo „das**dies**das“ (dies komplett orange inkl. i-Punkt, Funkel-Stern)
- Docker-Setup (Dockerfile, docker-compose.yml), Seed- und Demo-Daten (npm run seed:demo)

## Online (nur Vorschau, statischer Schnappschuss)
- Cloudflare-Worker „dasdiesdas“: https://dasdiesdas.taxi-monitor-ber.workers.dev
- Cloudflare-Konto-ID: d6efd028ea386766519a2721a3782ce9

## Katalog-Entwurf (24.11.2026)
- Neuer Katalog-/Filteraufbau abgestimmt, noch nicht in die Seite übernommen: `docs/katalog-entwurf/KONZEPT.md`
- Offene Punkte dort in Abschnitt 7

## Nächste Schritte (vereinbart)
1. Inserieren in 4 Schritten (Foto zuerst) mit Preisvorschlag aus ähnlichen Anzeigen
2. Umbau für Cloudflare: Datenbank D1 (statt PostgreSQL), Bilder in R2 (EU), Bildverarbeitung ohne sharp,
   tägliche Sicherung, Zwei-Faktor-Anmeldung für Admin
3. Domain dasdiesdas.de (Kauf bei INWX empfohlen) mit Cloudflare verbinden
4. Später: KI-Vorschläge beim Inserieren (Claude-API), Entfernung in km (PLZ-Geodaten), Mehrsprachigkeit,
   Teilen-Buttons, Benachrichtigung zu gespeicherten Suchen
5. Weitere Marken-/Modelllisten: Nutzfahrzeuge, Wohnmobile, Boote, Flugzeuge, Laptops, Konsolen

## Vor dem Livegang
- OPERATOR_*-Werte (Impressum), SMTP, Hoster in .env eintragen
- AGB/Datenschutz/Impressum anwaltlich prüfen lassen
- AVV mit Cloudflare abschließen

## Wünsche des Inhabers
- Kurze, sachliche Antworten auf Deutsch; klar sagen, was machbar ist und was nicht
