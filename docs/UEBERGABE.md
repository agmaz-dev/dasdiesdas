# Übergabe – dasdiesdas

Zuerst lesen, dann `docs/STAND.md`.

## Arbeitsregeln (Nutzerwunsch, verbindlich)
- Antworten auf Deutsch, kurz, sachlich, klar.
- Token-effizient arbeiten. Keine langen Texte.
- Klar sagen, was machbar ist und was nicht.
- Aufgaben sorgfältig, vollständig, ohne Mängel erledigen.
- Aufgabe erst beginnen, wenn der Nutzer sie ausdrücklich erteilt.
- Niemals fragen „Soll ich loslegen/anfangen/mit Schritt X weitermachen?“. Keine nächsten Schritte anbieten. Antworten ohne Rückfrage beenden.
- Nur fragen, wenn eine Angabe fehlt, ohne die die Aufgabe nicht machbar ist.
- Nutzer kann nichts selbst technisch umsetzen: alles selbst erledigen, Links/Schritte vorher klar nennen.

## Projekt
- Kleinanzeigen-Portal für Berlin und ganz Deutschland (alles verkaufbar: Immobilien, Fahrzeuge, Boote, Flugzeuge, Jobs, Unterricht usw.).
- Next.js 16 (App Router, Server Actions), React 19, TypeScript, Tailwind 4, Prisma 7 + PostgreSQL 16, sharp, nodemailer.
- 1.384 Kategorien (`src/lib/categories/tree.ts`), Merkmale je Kategorie (`attributes.ts`), Marke→Modell-Kataloge (`src/lib/catalog`).
- `package-lock.json` ist nicht im Repo (Versionen in `package.json` exakt fixiert) → `npm install`.

## Design (vom Nutzer vorgegeben, eigene Entwürfe)
- Dunkles Design, Markenfarbe Orange (#f97316, Buttons #ea580c), Türkis (#2dd4bf) für Kategorien.
- Logo: „das“ weiß, „dies“ komplett orange inkl. i-Punkt, „das“ weiß, Funkel-Stern.
- Handy: untere Navigationsleiste mit großem orangem Plus.

## Stand Hosting / Domain
- Cloudflare: kostenloses Konto, eine Vorschau als Worker wurde veröffentlicht. API-Token liegt als Netzwerk-Secret in der Umgebung (nie im Chat anzeigen).
- Domain: dasdiesdas.com bei Cloudflare möglich; für .de wurde INWX empfohlen. Kaufstatus beim Nutzer erfragen. DV-SSL-Zusatz nicht nötig.

## Nächste Schritte (vereinbart)
1. Anzeige aufgeben in 4 Schritten mit Preisvorschlag.
2. Umzug auf Cloudflare (D1 + R2) für den Echtbetrieb.
3. Domain verbinden.
4. Später: KI-Vorschläge.
