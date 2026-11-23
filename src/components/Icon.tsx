// Einheitliche Linien-Symbole (eigene, schlichte Formen)
const PATHS: Record<string, string> = {
  home: "M3 11l9-7 9 7M5 10v10h14V10M10 20v-5h4v5",
  car: "M5 16l1.6-5.2A2 2 0 018.5 9.5h7a2 2 0 011.9 1.3L19 16M3 16h18v3a1 1 0 01-1 1h-1.5M3 16v3a1 1 0 001 1h1.5M7 17.5h.01M17 17.5h.01",
  wrench: "M14.5 6.5a4 4 0 005 5L12 19a2.1 2.1 0 01-3-3l7.5-7.5a4 4 0 01-2-2z",
  phone: "M8 2h8a2 2 0 012 2v16a2 2 0 01-2 2H8a2 2 0 01-2-2V4a2 2 0 012-2zM11 18h2",
  sofa: "M4 11V8a2 2 0 012-2h12a2 2 0 012 2v3M2 13a2 2 0 014 0v2h12v-2a2 2 0 014 0v5H2zM5 18v2M19 18v2",
  shirt: "M8 3l4 2 4-2 5 4-3 3-2-1v12H8V9l-2 1-3-3z",
  baby: "M12 3a4 4 0 014 4v1a4 4 0 01-8 0V7a4 4 0 014-4zM6 21a6 6 0 0112 0M10 7h.01M14 7h.01",
  ball: "M12 3a9 9 0 100 18 9 9 0 000-18zM3.5 9h17M3.5 15h17M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18",
  paw: "M12 13c-3 0-5 3-5 5a2 2 0 002 2h6a2 2 0 002-2c0-2-2-5-5-5zM6.5 10a1.5 2 0 100-4 1.5 2 0 000 4zM17.5 10a1.5 2 0 100-4 1.5 2 0 000 4zM10 7a1.5 2 0 100-4 1.5 2 0 000 4zM14 7a1.5 2 0 100-4 1.5 2 0 000 4z",
  tractor: "M3 17a3 3 0 106 0 3 3 0 00-6 0zM16 18a2 2 0 104 0 2 2 0 00-4 0zM9 17h7M5 14V8h6l2 6M13 11h6l1 5",
  tool: "M14.7 6.3a4 4 0 00-5.6 5.6L3 18l3 3 6.1-6.1a4 4 0 005.6-5.6l-2.5 2.5-3-3z",
  cap: "M2 9l10-5 10 5-10 5zM6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5M22 9v6",
  briefcase: "M4 7h16a1 1 0 011 1v11a1 1 0 01-1 1H4a1 1 0 01-1-1V8a1 1 0 011-1zM9 7V5a1 1 0 011-1h4a1 1 0 011 1v2M3 13h18",
  users: "M9 11a4 4 0 100-8 4 4 0 000 8zM2 21a7 7 0 0114 0M16 3.5a4 4 0 010 7.5M22 21a6 6 0 00-4-5.6",
  calendar: "M4 6h16v15H4zM4 10h16M8 3v4M16 3v4",
  grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  search: "M11 4a7 7 0 100 14 7 7 0 000-14zM20 20l-4-4",
  plus: "M12 5v14M5 12h14",
  heart: "M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z",
  chat: "M4 5h16v11H9l-5 4z",
  user: "M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0",
  pin: "M12 21s-6-5.4-6-11a6 6 0 0112 0c0 5.6-6 11-6 11zM12 12a2 2 0 100-4 2 2 0 000 4z",
  clock: "M12 3a9 9 0 100 18 9 9 0 000-18zM12 7v5l3 2",
  camera: "M4 8h3l2-3h6l2 3h3v11H4zM12 17a3.5 3.5 0 100-7 3.5 3.5 0 000 7z",
  star: "M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z",
  check: "M5 12l5 5L20 7",
  send: "M4 12l16-8-6 16-3-7z",
  shield: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM8.5 12l2.5 2.5 4.5-5",
  chevron: "M9 6l6 6-6 6",
  filter: "M4 6h16M7 12h10M10 18h4",
};

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 20, className = "", strokeWidth = 1.8, label }: { name: string; size?: number; className?: string; strokeWidth?: number; label?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <path d={PATHS[name] ?? PATHS.grid} />
    </svg>
  );
}

/** Symbol je Hauptkategorie */
const CATEGORY_ICONS: Record<string, string> = {
  immobilien: "home",
  fahrzeuge: "car",
  "ersatzteile-und-zubehoer": "wrench",
  elektronik: "phone",
  "haus-und-garten": "sofa",
  "mode-und-beauty": "shirt",
  "familie-kind-und-baby": "baby",
  "freizeit-hobby-und-sport": "ball",
  tiere: "paw",
  "maschinen-und-industrie": "tractor",
  "handwerker-und-dienstleistungen": "tool",
  "unterricht-und-kurse": "cap",
  "jobs-und-stellenangebote": "briefcase",
  "haushaltshilfe-und-betreuung": "users",
  "nachbarschaft-und-veranstaltungen": "calendar",
  sonstiges: "grid",
};

export function CategoryIcon({ categoryId, size = 20, className = "" }: { categoryId: string; size?: number; className?: string }) {
  return <Icon name={CATEGORY_ICONS[categoryId.split("/")[0]] ?? "grid"} size={size} className={className} />;
}
