// Kategoriespezifische Merkmale (Formularfelder + Suchfilter).
// Jede Kategorie verweist (direkt oder geerbt) auf genau ein Merkmal-Set.

import { catalogBrands, type CatalogKey } from "@/lib/catalog";

/** "model" = Modellauswahl abhängig von der gewählten Marke (siehe catalog / parent) */
export type AttributeType = "number" | "select" | "multiselect" | "boolean" | "text" | "model";

export interface AttributeDef {
  key: string;
  label: string;
  type: AttributeType;
  options?: readonly string[];
  unit?: string;
  required?: boolean;
  /** Als Suchfilter anbieten (number → von/bis, select → Auswahl, boolean → Checkbox) */
  filter?: boolean;
  min?: number;
  max?: number;
  /** Nachkommastellen erlaubt */
  decimal?: boolean;
  placeholder?: string;
  help?: string;
  /** Marken-/Modellkatalog (bei Marke: Optionen; bei Modell: Modellliste je Marke) */
  catalog?: CatalogKey;
  /** Bei type "model": Schlüssel des Marken-Merkmals */
  parent?: string;
}

const brandModel = (catalog: CatalogKey, brandLabel = "Marke"): AttributeDef[] => [
  { key: "marke", label: brandLabel, type: "select", options: catalogBrands(catalog), catalog, filter: true, required: true },
  { key: "modell", label: "Modell", type: "model", catalog, parent: "marke", filter: true, required: true },
];

const YEAR_NOW = new Date().getFullYear();

// ---------- Wiederverwendbare Optionslisten ----------

export const CONDITION_GOODS = ["Neu", "Neuwertig", "Gut", "Akzeptabel", "Defekt"] as const;
export const SHIPPING = ["Nur Abholung", "Versand möglich", "Abholung oder Versand"] as const;

export const FUEL = ["Benzin", "Diesel", "Elektro", "Hybrid (Benzin/Elektro)", "Hybrid (Diesel/Elektro)", "Plug-in-Hybrid", "Autogas (LPG)", "Erdgas (CNG)", "Wasserstoff", "Ethanol", "Andere"] as const;
export const GEARBOX = ["Schaltgetriebe", "Automatik", "Halbautomatik"] as const;
export const VEHICLE_CONDITION = ["Gebraucht", "Neu", "Jahreswagen", "Vorführfahrzeug", "Unfallfahrzeug", "Nicht fahrtauglich"] as const;
export const COLORS = ["Beige", "Blau", "Braun", "Bronze", "Gelb", "Gold", "Grau", "Grün", "Orange", "Rot", "Schwarz", "Silber", "Violett", "Weiß", "Andere"] as const;
export const EMISSION = ["Euro 1", "Euro 2", "Euro 3", "Euro 4", "Euro 5", "Euro 6", "Euro 6d-TEMP", "Euro 6d", "Euro 7"] as const;

const ENERGY_CLASS = ["A+", "A", "B", "C", "D", "E", "F", "G", "H"] as const;
const HEATING = ["Zentralheizung", "Etagenheizung", "Fernwärme", "Fußbodenheizung", "Gasheizung", "Ölheizung", "Wärmepumpe", "Pelletheizung", "Nachtspeicher", "Ofenheizung", "Blockheizkraftwerk", "Andere"] as const;
const PROPERTY_CONDITION = ["Erstbezug", "Erstbezug nach Sanierung", "Neuwertig", "Saniert", "Modernisiert", "Gepflegt", "Renovierungsbedürftig", "Abrissobjekt"] as const;

// ---------- Bausteine ----------

const energyFields: AttributeDef[] = [
  { key: "energieausweis", label: "Energieausweis", type: "select", options: ["Verbrauchsausweis", "Bedarfsausweis", "Liegt vor (Typ nicht angegeben)", "Nicht erforderlich (z. B. Denkmal)", "Liegt noch nicht vor"], help: "Pflichtangabe nach § 87 GEG bei Verkauf und Vermietung" },
  { key: "energiekennwert", label: "Energiekennwert", type: "number", unit: "kWh/(m²·a)", min: 0, max: 1000, decimal: true },
  { key: "energieklasse", label: "Energieeffizienzklasse", type: "select", options: ENERGY_CLASS, filter: true },
  { key: "energietraeger", label: "Wesentlicher Energieträger", type: "select", options: ["Gas", "Öl", "Fernwärme", "Strom", "Holz/Pellets", "Solar", "Erdwärme", "Andere"] },
];

const vehicleBase: AttributeDef[] = [
  { key: "erstzulassung", label: "Erstzulassung (Jahr)", type: "number", min: 1900, max: YEAR_NOW + 1, filter: true, required: true },
  { key: "kilometer", label: "Kilometerstand", type: "number", unit: "km", min: 0, max: 3_000_000, filter: true, required: true },
  { key: "leistung", label: "Leistung", type: "number", unit: "PS", min: 0, max: 3000, filter: true },
  { key: "kraftstoff", label: "Kraftstoff", type: "select", options: FUEL, filter: true },
  { key: "getriebe", label: "Getriebe", type: "select", options: GEARBOX, filter: true },
  { key: "zustand", label: "Fahrzeugzustand", type: "select", options: VEHICLE_CONDITION, filter: true },
  { key: "farbe", label: "Farbe", type: "select", options: COLORS, filter: true },
  { key: "hu", label: "HU gültig bis", type: "text", placeholder: "z. B. 08/2027" },
  { key: "vorbesitzer", label: "Anzahl Vorbesitzer", type: "number", min: 0, max: 50 },
  { key: "unfallfrei", label: "Unfallfrei", type: "boolean", filter: true },
  { key: "scheckheft", label: "Scheckheftgepflegt", type: "boolean" },
];

const consumptionFields: AttributeDef[] = [
  { key: "verbrauch", label: "Verbrauch kombiniert", type: "text", placeholder: "z. B. 5,8 l/100 km oder 16 kWh/100 km", help: "Bei Neuwagen Pflichtangabe nach Pkw-EnVKV" },
  { key: "co2", label: "CO₂-Emissionen kombiniert", type: "number", unit: "g/km", min: 0, max: 1000 },
  { key: "co2klasse", label: "CO₂-Klasse", type: "select", options: ["A", "B", "C", "D", "E", "F", "G"] },
  { key: "schadstoffklasse", label: "Schadstoffklasse", type: "select", options: EMISSION, filter: true },
  { key: "umweltplakette", label: "Umweltplakette", type: "select", options: ["Grün (4)", "Gelb (3)", "Rot (2)", "Keine"], filter: true, help: "In Berlin gilt innerhalb des S-Bahn-Rings die Umweltzone (grüne Plakette)" },
];

const goodsBase: AttributeDef[] = [
  { key: "zustand", label: "Zustand", type: "select", options: CONDITION_GOODS, filter: true, required: true },
  { key: "versand", label: "Übergabe", type: "select", options: SHIPPING, filter: true },
];

const machineBase: AttributeDef[] = [
  { key: "hersteller", label: "Hersteller", type: "text", required: true, filter: true },
  { key: "modell", label: "Modell", type: "text" },
  { key: "baujahr", label: "Baujahr", type: "number", min: 1900, max: YEAR_NOW + 1, filter: true },
  { key: "betriebsstunden", label: "Betriebsstunden", type: "number", unit: "h", min: 0, max: 500_000, filter: true },
  { key: "leistung", label: "Leistung", type: "number", unit: "kW", min: 0, max: 100_000, decimal: true },
  { key: "gewicht", label: "Gewicht", type: "number", unit: "kg", min: 0, max: 1_000_000 },
  { key: "zustand", label: "Zustand", type: "select", options: ["Neu", "Gebraucht", "Überholt", "Defekt / für Teile"], filter: true },
  { key: "versand", label: "Übergabe", type: "select", options: ["Nur Abholung", "Lieferung möglich", "Abholung oder Lieferung"] },
];

// ---------- Merkmal-Sets ----------

export const ATTRIBUTE_SETS = {
  // Immobilien
  wohnen_miete: [
    { key: "zimmer", label: "Zimmer", type: "number", min: 1, max: 50, decimal: true, filter: true, required: true },
    { key: "wohnflaeche", label: "Wohnfläche", type: "number", unit: "m²", min: 1, max: 10_000, decimal: true, filter: true, required: true },
    { key: "warmmiete", label: "Warmmiete", type: "number", unit: "€", min: 0, max: 1_000_000, decimal: true, help: "Der Preis oben ist die Kaltmiete" },
    { key: "nebenkosten", label: "Nebenkosten", type: "number", unit: "€", min: 0, max: 100_000, decimal: true },
    { key: "kaution", label: "Kaution", type: "number", unit: "€", min: 0, max: 1_000_000, decimal: true },
    { key: "verfuegbar_ab", label: "Verfügbar ab", type: "text", placeholder: "z. B. 01.02.2027 oder sofort" },
    { key: "etage", label: "Etage", type: "number", min: -5, max: 200, filter: true, help: "0 = Erdgeschoss" },
    { key: "baujahr", label: "Baujahr", type: "number", min: 1000, max: YEAR_NOW + 5, filter: true },
    { key: "objektzustand", label: "Objektzustand", type: "select", options: PROPERTY_CONDITION },
    { key: "heizung", label: "Heizungsart", type: "select", options: HEATING },
    { key: "moebliert", label: "Möbliert", type: "boolean", filter: true },
    { key: "einbaukueche", label: "Einbauküche", type: "boolean", filter: true },
    { key: "balkon", label: "Balkon / Terrasse", type: "boolean", filter: true },
    { key: "garten", label: "Garten / Gartennutzung", type: "boolean", filter: true },
    { key: "aufzug", label: "Aufzug", type: "boolean", filter: true },
    { key: "keller", label: "Keller", type: "boolean" },
    { key: "stellplatz", label: "Stellplatz / Garage", type: "boolean", filter: true },
    { key: "barrierefrei", label: "Stufenlos / barrierefrei", type: "boolean", filter: true },
    { key: "haustiere", label: "Haustiere erlaubt", type: "boolean", filter: true },
    { key: "wbs", label: "WBS erforderlich", type: "boolean", filter: true, help: "Wohnberechtigungsschein" },
    { key: "befristet", label: "Befristet", type: "boolean" },
    { key: "provisionsfrei", label: "Provisionsfrei", type: "boolean", filter: true },
    ...energyFields,
  ],
  wohnen_kauf: [
    { key: "zimmer", label: "Zimmer", type: "number", min: 1, max: 50, decimal: true, filter: true, required: true },
    { key: "wohnflaeche", label: "Wohnfläche", type: "number", unit: "m²", min: 1, max: 10_000, decimal: true, filter: true, required: true },
    { key: "grundstuecksflaeche", label: "Grundstücksfläche", type: "number", unit: "m²", min: 0, max: 10_000_000, decimal: true, filter: true },
    { key: "hausgeld", label: "Hausgeld", type: "number", unit: "€", min: 0, max: 100_000, decimal: true },
    { key: "etage", label: "Etage", type: "number", min: -5, max: 200 },
    { key: "baujahr", label: "Baujahr", type: "number", min: 1000, max: YEAR_NOW + 5, filter: true },
    { key: "objektzustand", label: "Objektzustand", type: "select", options: PROPERTY_CONDITION, filter: true },
    { key: "heizung", label: "Heizungsart", type: "select", options: HEATING },
    { key: "vermietet", label: "Vermietet (Kapitalanlage)", type: "boolean", filter: true },
    { key: "einbaukueche", label: "Einbauküche", type: "boolean" },
    { key: "balkon", label: "Balkon / Terrasse", type: "boolean", filter: true },
    { key: "garten", label: "Garten", type: "boolean", filter: true },
    { key: "aufzug", label: "Aufzug", type: "boolean" },
    { key: "keller", label: "Keller", type: "boolean" },
    { key: "stellplatz", label: "Stellplatz / Garage", type: "boolean", filter: true },
    { key: "denkmalschutz", label: "Denkmalschutz", type: "boolean" },
    { key: "provision", label: "Käuferprovision", type: "text", placeholder: "z. B. 3,57 % inkl. MwSt. oder provisionsfrei" },
    ...energyFields,
  ],
  wohnen_wg: [
    { key: "zimmergroesse", label: "Zimmergröße", type: "number", unit: "m²", min: 1, max: 500, decimal: true, filter: true, required: true },
    { key: "mitbewohner", label: "Anzahl Mitbewohner", type: "number", min: 0, max: 30, filter: true },
    { key: "warmmiete", label: "Warmmiete", type: "number", unit: "€", min: 0, max: 100_000, decimal: true },
    { key: "kaution", label: "Kaution", type: "number", unit: "€", min: 0, max: 100_000, decimal: true },
    { key: "verfuegbar_ab", label: "Verfügbar ab", type: "text" },
    { key: "verfuegbar_bis", label: "Verfügbar bis", type: "text", placeholder: "leer = unbefristet" },
    { key: "moebliert", label: "Möbliert", type: "boolean", filter: true },
    { key: "wg_art", label: "WG-Art", type: "select", options: ["Studenten-WG", "Berufstätigen-WG", "Gemischte WG", "Frauen-WG", "Männer-WG", "Zweck-WG", "Wohnheim", "Andere"], filter: true },
  ],
  ferien: [
    { key: "schlafplaetze", label: "Schlafplätze", type: "number", min: 1, max: 100, filter: true, required: true },
    { key: "zimmer", label: "Zimmer", type: "number", min: 1, max: 50, decimal: true, filter: true },
    { key: "wohnflaeche", label: "Wohnfläche", type: "number", unit: "m²", min: 1, max: 10_000, decimal: true },
    { key: "mindestaufenthalt", label: "Mindestaufenthalt", type: "number", unit: "Nächte", min: 1, max: 365 },
    { key: "haustiere", label: "Haustiere erlaubt", type: "boolean", filter: true },
    { key: "wlan", label: "WLAN", type: "boolean", filter: true },
    { key: "parkplatz", label: "Parkplatz", type: "boolean", filter: true },
    { key: "pool", label: "Pool", type: "boolean", filter: true },
    { key: "meerblick", label: "See- / Meerblick", type: "boolean", filter: true },
    { key: "registriernummer", label: "Registriernummer (Zweckentfremdung)", type: "text", help: "In Berlin für Ferienwohnungen gesetzlich vorgeschrieben" },
  ],
  gewerbe: [
    { key: "flaeche", label: "Fläche", type: "number", unit: "m²", min: 1, max: 10_000_000, decimal: true, filter: true, required: true },
    { key: "raeume", label: "Räume", type: "number", min: 0, max: 1000, filter: true },
    { key: "teilbar_ab", label: "Teilbar ab", type: "number", unit: "m²", min: 0, max: 10_000_000 },
    { key: "nebenkosten", label: "Nebenkosten", type: "number", unit: "€", min: 0, max: 10_000_000, decimal: true },
    { key: "baujahr", label: "Baujahr", type: "number", min: 1000, max: YEAR_NOW + 5, filter: true },
    { key: "etage", label: "Etage", type: "number", min: -5, max: 200 },
    { key: "objektzustand", label: "Objektzustand", type: "select", options: PROPERTY_CONDITION },
    { key: "verfuegbar_ab", label: "Verfügbar ab", type: "text" },
    { key: "provision", label: "Provision", type: "text" },
    { key: "stellplaetze", label: "Stellplätze", type: "number", min: 0, max: 10_000 },
    { key: "barrierefrei", label: "Barrierefrei", type: "boolean", filter: true },
    ...energyFields,
  ],
  grundstueck: [
    { key: "grundstuecksflaeche", label: "Grundstücksfläche", type: "number", unit: "m²", min: 1, max: 100_000_000, decimal: true, filter: true, required: true },
    { key: "nutzung", label: "Nutzung / Bebaubarkeit", type: "select", options: ["Wohnbebauung", "Gewerbe", "Mischgebiet", "Industrie", "Landwirtschaft", "Forst / Wald", "Freizeit / Garten", "Bauerwartungsland", "Unbekannt"], filter: true, required: true },
    { key: "erschlossen", label: "Erschlossen", type: "boolean", filter: true },
    { key: "bebauungsplan", label: "Bebauungsplan vorhanden", type: "boolean" },
    { key: "grz", label: "GRZ", type: "number", min: 0, max: 1, decimal: true, help: "Grundflächenzahl" },
    { key: "gfz", label: "GFZ", type: "number", min: 0, max: 20, decimal: true, help: "Geschossflächenzahl" },
    { key: "provision", label: "Provision", type: "text" },
  ],
  stellplatz: [
    { key: "art", label: "Art", type: "select", options: ["Garage", "Tiefgaragenstellplatz", "Außenstellplatz", "Carport", "Duplex-Stellplatz", "Bootsliegeplatz", "Wohnmobil-Stellplatz"], filter: true, required: true },
    { key: "flaeche", label: "Fläche", type: "number", unit: "m²", min: 1, max: 10_000, decimal: true },
    { key: "stromanschluss", label: "Stromanschluss / Wallbox", type: "boolean", filter: true },
    { key: "verfuegbar_ab", label: "Verfügbar ab", type: "text" },
  ],
  hotel: [
    { key: "zimmeranzahl", label: "Anzahl Zimmer", type: "number", min: 1, max: 10_000, filter: true, required: true },
    { key: "betten", label: "Betten", type: "number", min: 1, max: 50_000, filter: true },
    { key: "flaeche", label: "Nutzfläche", type: "number", unit: "m²", min: 1, max: 10_000_000, decimal: true },
    { key: "grundstuecksflaeche", label: "Grundstücksfläche", type: "number", unit: "m²", min: 0, max: 100_000_000, decimal: true },
    { key: "sterne", label: "Klassifizierung", type: "select", options: ["Ohne", "1 Stern", "2 Sterne", "3 Sterne", "4 Sterne", "5 Sterne"] },
    { key: "baujahr", label: "Baujahr", type: "number", min: 1000, max: YEAR_NOW + 5 },
    { key: "in_betrieb", label: "In Betrieb", type: "boolean", filter: true },
  ],

  // Fahrzeuge
  pkw: [
    ...brandModel("cars"),
    { key: "variante", label: "Variante / Ausstattung", type: "text", placeholder: "z. B. 1.5 TSI Life, 320d Touring M Sport" },
    { key: "karosserie", label: "Fahrzeugtyp", type: "select", options: ["Limousine", "Kombi", "Kleinwagen", "Cabrio / Roadster", "Coupé", "SUV / Geländewagen", "Van / Kleinbus", "Pick-up", "Andere"], filter: true },
    ...vehicleBase,
    { key: "tueren", label: "Türen", type: "select", options: ["2/3", "4/5", "6/7"] },
    { key: "sitze", label: "Sitzplätze", type: "number", min: 1, max: 60 },
    { key: "antrieb", label: "Antrieb", type: "select", options: ["Front", "Heck", "Allrad"], filter: true },
    { key: "anhaengerkupplung", label: "Anhängerkupplung", type: "boolean", filter: true },
    { key: "navi", label: "Navigationssystem", type: "boolean" },
    { key: "klima", label: "Klimaanlage", type: "select", options: ["Keine", "Klimaanlage", "Klimaautomatik", "2-Zonen-Klimaautomatik", "3-Zonen oder mehr"] },
    { key: "reichweite", label: "Reichweite (Elektro)", type: "number", unit: "km", min: 0, max: 2000 },
    { key: "batterie", label: "Batteriekapazität", type: "number", unit: "kWh", min: 0, max: 300, decimal: true },
    ...consumptionFields,
  ],
  motorrad: [
    ...brandModel("motorbikes"),
    { key: "variante", label: "Variante", type: "text" },
    ...vehicleBase.filter((a) => a.key !== "getriebe"),
    { key: "hubraum", label: "Hubraum", type: "number", unit: "cm³", min: 0, max: 10_000, filter: true },
    { key: "fuehrerschein", label: "Führerscheinklasse", type: "select", options: ["AM", "A1", "A2", "A", "B (B196)", "Mofa"], filter: true },
  ],
  nutzfahrzeug: [
    { key: "marke", label: "Hersteller", type: "text", required: true, filter: true },
    { key: "modell", label: "Modell", type: "text" },
    ...vehicleBase,
    { key: "gesamtgewicht", label: "Zul. Gesamtgewicht", type: "number", unit: "kg", min: 0, max: 100_000, filter: true },
    { key: "nutzlast", label: "Nutzlast", type: "number", unit: "kg", min: 0, max: 100_000 },
    { key: "achsen", label: "Achsen", type: "number", min: 1, max: 10 },
    { key: "sitze", label: "Sitzplätze", type: "number", min: 1, max: 100 },
    { key: "schadstoffklasse", label: "Schadstoffklasse", type: "select", options: EMISSION, filter: true },
  ],
  anhaenger: [
    { key: "marke", label: "Hersteller", type: "text", required: true, filter: true },
    { key: "baujahr", label: "Baujahr", type: "number", min: 1900, max: YEAR_NOW + 1, filter: true },
    { key: "gesamtgewicht", label: "Zul. Gesamtgewicht", type: "number", unit: "kg", min: 0, max: 100_000, filter: true },
    { key: "nutzlast", label: "Nutzlast", type: "number", unit: "kg", min: 0, max: 100_000 },
    { key: "achsen", label: "Achsen", type: "number", min: 1, max: 10 },
    { key: "gebremst", label: "Gebremst", type: "boolean", filter: true },
    { key: "hu", label: "HU gültig bis", type: "text" },
  ],
  wohnmobil: [
    { key: "marke", label: "Hersteller", type: "text", required: true, filter: true, placeholder: "z. B. Hymer, Knaus, Dethleffs" },
    { key: "modell", label: "Modell", type: "text" },
    ...vehicleBase,
    { key: "schlafplaetze", label: "Schlafplätze", type: "number", min: 1, max: 20, filter: true },
    { key: "laenge", label: "Länge", type: "number", unit: "m", min: 0, max: 30, decimal: true, filter: true },
    { key: "gesamtgewicht", label: "Zul. Gesamtgewicht", type: "number", unit: "kg", min: 0, max: 20_000, filter: true },
  ],
  wohnwagen: [
    { key: "marke", label: "Hersteller", type: "text", required: true, filter: true },
    { key: "modell", label: "Modell", type: "text" },
    { key: "baujahr", label: "Baujahr", type: "number", min: 1900, max: YEAR_NOW + 1, filter: true },
    { key: "schlafplaetze", label: "Schlafplätze", type: "number", min: 1, max: 20, filter: true },
    { key: "laenge", label: "Aufbaulänge", type: "number", unit: "m", min: 0, max: 20, decimal: true, filter: true },
    { key: "gesamtgewicht", label: "Zul. Gesamtgewicht", type: "number", unit: "kg", min: 0, max: 10_000, filter: true },
    { key: "mover", label: "Mover", type: "boolean", filter: true },
    { key: "hu", label: "HU gültig bis", type: "text" },
  ],
  boot: [
    { key: "hersteller", label: "Werft / Hersteller", type: "text", required: true, filter: true },
    { key: "modell", label: "Modell", type: "text" },
    { key: "baujahr", label: "Baujahr", type: "number", min: 1850, max: YEAR_NOW + 1, filter: true, required: true },
    { key: "laenge", label: "Länge", type: "number", unit: "m", min: 0, max: 200, decimal: true, filter: true, required: true },
    { key: "breite", label: "Breite", type: "number", unit: "m", min: 0, max: 50, decimal: true },
    { key: "tiefgang", label: "Tiefgang", type: "number", unit: "m", min: 0, max: 20, decimal: true },
    { key: "material", label: "Rumpfmaterial", type: "select", options: ["GFK", "Holz", "Stahl", "Aluminium", "Carbon", "Ferrozement", "PVC / Hypalon", "Andere"], filter: true },
    { key: "antrieb", label: "Antrieb", type: "select", options: ["Innenborder", "Außenborder", "Z-Antrieb", "Jetantrieb", "Elektro", "Segel (ohne Motor)", "Ohne Antrieb"], filter: true },
    { key: "leistung", label: "Motorleistung", type: "number", unit: "PS", min: 0, max: 20_000, filter: true },
    { key: "betriebsstunden", label: "Motorstunden", type: "number", unit: "h", min: 0, max: 200_000 },
    { key: "kabinen", label: "Kabinen", type: "number", min: 0, max: 50 },
    { key: "kojen", label: "Kojen / Schlafplätze", type: "number", min: 0, max: 200, filter: true },
    { key: "zulassung", label: "Liegeplatz / Revier", type: "text", placeholder: "z. B. Müggelsee, Ostsee, Mittelmeer" },
    { key: "fuehrerscheinfrei", label: "Führerscheinfrei", type: "boolean", filter: true },
    { key: "trailer", label: "Inkl. Trailer", type: "boolean", filter: true },
    { key: "ce_kategorie", label: "CE-Kategorie", type: "select", options: ["A (Hochsee)", "B (Außerhalb Küste)", "C (Küstennah)", "D (Geschützte Gewässer)"] },
  ],
  luftfahrzeug: [
    { key: "hersteller", label: "Hersteller", type: "text", required: true, filter: true, placeholder: "z. B. Cessna, Piper, Robinson" },
    { key: "modell", label: "Modell / Typ", type: "text", required: true },
    { key: "baujahr", label: "Baujahr", type: "number", min: 1900, max: YEAR_NOW + 1, filter: true, required: true },
    { key: "gesamtstunden", label: "Gesamtbetriebsstunden (Zelle)", type: "number", unit: "h", min: 0, max: 200_000, filter: true },
    { key: "motorstunden", label: "Motorstunden seit Überholung", type: "number", unit: "h", min: 0, max: 100_000 },
    { key: "sitze", label: "Sitzplätze", type: "number", min: 1, max: 900, filter: true },
    { key: "triebwerk", label: "Antrieb", type: "select", options: ["Kolbenmotor", "Turboprop", "Strahltriebwerk", "Elektro", "Ohne Motor"], filter: true },
    { key: "triebwerke", label: "Anzahl Triebwerke", type: "number", min: 0, max: 8 },
    { key: "lufttuechtig", label: "Lufttüchtigkeitszeugnis (ARC) gültig", type: "boolean", filter: true },
    { key: "ifr", label: "IFR-zugelassen", type: "boolean", filter: true },
    { key: "standort_flugplatz", label: "Heimatflugplatz", type: "text", placeholder: "z. B. EDAZ Schönhagen" },
  ],
  drohne: [
    { key: "hersteller", label: "Hersteller", type: "text", required: true, filter: true },
    { key: "modell", label: "Modell", type: "text" },
    { key: "klasse", label: "EU-Klasse", type: "select", options: ["C0", "C1", "C2", "C3", "C4", "Ohne Klasse (Bestand)"], filter: true },
    { key: "gewicht", label: "Startgewicht", type: "number", unit: "g", min: 0, max: 25_000 },
    ...goodsBase,
  ],
  fahrrad: [
    { key: "art", label: "Art", type: "select", options: ["City / Trekking", "Mountainbike", "Rennrad / Gravel", "E-Bike / Pedelec", "Lastenrad", "Kinderrad", "BMX", "Klapprad", "Andere"], filter: true, required: true },
    { key: "marke", label: "Marke", type: "text", filter: true },
    { key: "rahmengroesse", label: "Rahmengröße", type: "text", placeholder: "z. B. 54 cm oder M" },
    { key: "laufradgroesse", label: "Laufradgröße", type: "select", options: ['12"', '16"', '20"', '24"', '26"', '27,5"', '28"', '29"'], filter: true },
    ...goodsBase,
  ],

  // Teile & Zubehör
  teile: [
    { key: "zustand", label: "Zustand", type: "select", options: ["Neu", "Gebraucht", "Generálüberholt".replace("á", "a"), "Defekt / für Bastler"], filter: true, required: true },
  ],
} as const;
