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
    { key: "zustand", label: "Zustand", type: "select", options: ["Neu", "Gebraucht", "Generalüberholt", "Defekt / für Bastler"], filter: true, required: true },
    { key: "hersteller", label: "Hersteller / Marke", type: "text", filter: true },
    { key: "passend_fuer", label: "Passend für", type: "text", placeholder: "z. B. VW Golf 7, BJ 2015" },
    { key: "teilenummer", label: "Teilenummer (OE)", type: "text" },
    { key: "versand", label: "Übergabe", type: "select", options: SHIPPING, filter: true },
  ],
  reifen: [
    { key: "saison", label: "Saison", type: "select", options: ["Sommer", "Winter", "Ganzjahr"], filter: true, required: true },
    { key: "breite", label: "Breite", type: "number", unit: "mm", min: 100, max: 400, filter: true },
    { key: "querschnitt", label: "Querschnitt", type: "number", unit: "%", min: 20, max: 100, filter: true },
    { key: "zoll", label: "Zoll", type: "number", min: 10, max: 26, filter: true },
    { key: "profil", label: "Profiltiefe", type: "number", unit: "mm", min: 0, max: 20, decimal: true },
    { key: "anzahl", label: "Anzahl", type: "number", min: 1, max: 20 },
    { key: "mit_felge", label: "Mit Felgen", type: "boolean", filter: true },
    { key: "zustand", label: "Zustand", type: "select", options: ["Neu", "Gebraucht"], filter: true },
    { key: "versand", label: "Übergabe", type: "select", options: SHIPPING },
  ],

  // Waren
  waren: goodsBase,
  marke_waren: [
    { key: "marke", label: "Marke / Hersteller", type: "text", filter: true },
    { key: "modell", label: "Modell", type: "text" },
    ...goodsBase,
  ],
  handy: [
    ...brandModel("phones", "Hersteller"),
    { key: "speicher", label: "Speicher", type: "select", options: ["bis 32 GB", "64 GB", "128 GB", "256 GB", "512 GB", "1 TB", "2 TB"], filter: true },
    { key: "farbe", label: "Farbe", type: "text" },
    { key: "garantie", label: "Garantie vorhanden", type: "boolean" },
    ...goodsBase,
  ],
  tablet: [
    ...brandModel("tablets", "Hersteller"),
    { key: "speicher", label: "Speicher", type: "select", options: ["bis 32 GB", "64 GB", "128 GB", "256 GB", "512 GB", "1 TB", "2 TB"], filter: true },
    { key: "mobilfunk", label: "Mobilfunk (LTE/5G)", type: "boolean", filter: true },
    ...goodsBase,
  ],
  computer: [
    { key: "marke", label: "Marke", type: "text", filter: true },
    { key: "modell", label: "Modell", type: "text" },
    { key: "prozessor", label: "Prozessor", type: "text" },
    { key: "ram", label: "Arbeitsspeicher", type: "number", unit: "GB", min: 0, max: 4096, filter: true },
    { key: "speicher", label: "Speicher", type: "number", unit: "GB", min: 0, max: 1_000_000 },
    ...goodsBase,
  ],
  kleidung: [
    { key: "groesse", label: "Größe", type: "text", filter: true, placeholder: "z. B. M, 38, 104" },
    { key: "marke", label: "Marke", type: "text", filter: true },
    { key: "farbe", label: "Farbe", type: "select", options: COLORS },
    ...goodsBase,
  ],
  schuhe: [
    { key: "groesse", label: "Schuhgröße (EU)", type: "number", min: 15, max: 55, decimal: true, filter: true },
    { key: "marke", label: "Marke", type: "text", filter: true },
    ...goodsBase,
  ],
  medien: [
    { key: "format", label: "Format", type: "select", options: ["Buch", "E-Book", "Hörbuch", "CD", "Vinyl", "DVD", "Blu-ray", "Zeitschrift", "Comic", "Andere"], filter: true },
    { key: "autor", label: "Autor / Künstler", type: "text", filter: true },
    { key: "sprache", label: "Sprache", type: "select", options: ["Deutsch", "Englisch", "Türkisch", "Arabisch", "Französisch", "Spanisch", "Russisch", "Polnisch", "Andere"] },
    ...goodsBase,
  ],
  lebensmittel: [
    { key: "mhd", label: "Mindesthaltbarkeit", type: "text", placeholder: "z. B. 12/2027" },
    { key: "bio", label: "Bio", type: "boolean", filter: true },
    { key: "versand", label: "Übergabe", type: "select", options: SHIPPING },
  ],
  verschenken: [
    { key: "zustand", label: "Zustand", type: "select", options: CONDITION_GOODS, filter: true },
    { key: "abholung", label: "Abholung bis", type: "text" },
  ],
  tickets: [
    { key: "datum", label: "Datum der Veranstaltung", type: "text", required: true, placeholder: "TT.MM.JJJJ" },
    { key: "veranstaltungsort", label: "Veranstaltungsort", type: "text", filter: true },
    { key: "anzahl", label: "Anzahl Tickets", type: "number", min: 1, max: 100 },
    { key: "versand", label: "Übergabe", type: "select", options: ["Persönlich", "Digital / E-Ticket", "Postversand"] },
  ],

  // Maschinen
  maschine: machineBase,
  traktor: [
    ...machineBase,
    { key: "antrieb", label: "Antrieb", type: "select", options: ["Allrad", "Hinterrad", "Raupe"], filter: true },
    { key: "ps", label: "Leistung (PS)", type: "number", unit: "PS", min: 0, max: 1500, filter: true },
    { key: "zulassung", label: "Straßenzulassung", type: "boolean" },
  ],

  // Dienstleistungen
  service: [
    { key: "preisart", label: "Preisangabe", type: "select", options: ["Festpreis", "Stundensatz", "Pauschal nach Absprache", "Kostenloses Angebot"], filter: true },
    { key: "einsatzgebiet", label: "Einsatzgebiet", type: "text", placeholder: "z. B. ganz Berlin + 30 km", filter: true },
    { key: "erfahrung", label: "Berufserfahrung", type: "number", unit: "Jahre", min: 0, max: 70 },
    { key: "meisterbetrieb", label: "Meisterbetrieb / Fachbetrieb", type: "boolean", filter: true },
    { key: "versichert", label: "Betriebshaftpflicht vorhanden", type: "boolean", filter: true },
    { key: "notdienst", label: "24h-Notdienst", type: "boolean", filter: true },
    { key: "sprachen", label: "Sprachen", type: "multiselect", options: ["Deutsch", "Englisch", "Türkisch", "Arabisch", "Polnisch", "Russisch", "Ukrainisch", "Rumänisch", "Französisch", "Spanisch", "Italienisch", "Kurdisch", "Persisch", "Vietnamesisch"], filter: true },
  ],
  umzug: [
    { key: "preisart", label: "Preisangabe", type: "select", options: ["Festpreis", "Stundensatz", "Pauschal nach Absprache", "Kostenloses Angebot"], filter: true },
    { key: "fahrzeug", label: "Fahrzeuge", type: "multiselect", options: ["Transporter bis 3,5 t", "LKW 7,5 t", "LKW 12 t+", "Möbellift"], filter: true },
    { key: "helfer", label: "Anzahl Helfer", type: "number", min: 0, max: 100 },
    { key: "einsatzgebiet", label: "Einsatzgebiet", type: "select", options: ["Nur Berlin", "Berlin & Brandenburg", "Deutschlandweit", "Europaweit"], filter: true },
    { key: "versichert", label: "Transportversicherung", type: "boolean", filter: true },
  ],
  unterricht: [
    { key: "niveau", label: "Niveau", type: "multiselect", options: ["Kinder / Vorschule", "Grundschule", "Klasse 7–10 (MSA)", "Oberstufe / Abitur", "Ausbildung / Berufsschule", "Studium", "Erwachsene / Beruf", "Anfänger", "Fortgeschrittene", "Profis"], filter: true },
    { key: "unterrichtsort", label: "Unterrichtsort", type: "multiselect", options: ["Beim Lehrer / Studio", "Beim Schüler zu Hause", "Online", "Gruppenkurs"], filter: true, required: true },
    { key: "fach", label: "Fach / Thema", type: "text", filter: true, placeholder: "z. B. Mathematik, Gitarre, Deutsch B2" },
    { key: "erfahrung", label: "Unterrichtserfahrung", type: "number", unit: "Jahre", min: 0, max: 70 },
    { key: "qualifikation", label: "Qualifikation", type: "select", options: ["Lehramt / Lehrkraft", "Studierende/r", "Muttersprachler/in", "Zertifizierte/r Trainer/in", "Meister/in", "Berufserfahrung", "Andere"], filter: true },
    { key: "probestunde", label: "Kostenlose Probestunde", type: "boolean", filter: true },
    { key: "sprachen", label: "Unterrichtssprachen", type: "multiselect", options: ["Deutsch", "Englisch", "Türkisch", "Arabisch", "Polnisch", "Russisch", "Ukrainisch", "Französisch", "Spanisch", "Italienisch"] },
  ],
  fahrschule: [
    { key: "klassen", label: "Führerscheinklassen", type: "multiselect", options: ["AM", "A1", "A2", "A", "B", "B96", "BE", "B197", "C1", "C", "CE", "D", "T/L", "Bootsführerschein", "Flugschein (PPL)"], filter: true, required: true },
    { key: "sprachen", label: "Sprachen", type: "multiselect", options: ["Deutsch", "Englisch", "Türkisch", "Arabisch", "Polnisch", "Russisch", "Ukrainisch", "Persisch"], filter: true },
    { key: "intensivkurs", label: "Intensivkurs / Ferienkurs", type: "boolean", filter: true },
    { key: "automatik", label: "Automatik-Ausbildung", type: "boolean", filter: true },
  ],

  // Jobs
  job: [
    { key: "anstellung", label: "Anstellungsart", type: "select", options: ["Vollzeit", "Teilzeit", "Minijob", "Midijob", "Werkstudent", "Ausbildung", "Duales Studium", "Praktikum", "Freiberuflich / Projekt", "Aushilfe / Saison", "Ehrenamt"], filter: true, required: true },
    { key: "arbeitgeber", label: "Arbeitgeber", type: "text", filter: true },
    { key: "erfahrung", label: "Berufserfahrung", type: "select", options: ["Keine erforderlich", "Berufseinsteiger", "1–3 Jahre", "3–5 Jahre", "Mehr als 5 Jahre", "Führungserfahrung"], filter: true },
    { key: "homeoffice", label: "Homeoffice", type: "select", options: ["Nein", "Teilweise", "Vollständig remote"], filter: true },
    { key: "gehalt_von", label: "Gehalt von (brutto/Jahr)", type: "number", unit: "€", min: 0, max: 10_000_000, filter: true },
    { key: "gehalt_bis", label: "Gehalt bis (brutto/Jahr)", type: "number", unit: "€", min: 0, max: 10_000_000 },
    { key: "stundenlohn", label: "Stundenlohn", type: "number", unit: "€", min: 0, max: 10_000, decimal: true, help: "Gesetzlicher Mindestlohn beachten" },
    { key: "befristet", label: "Befristet", type: "boolean" },
    { key: "deutschkenntnisse", label: "Deutschkenntnisse", type: "select", options: ["Nicht erforderlich", "Grundkenntnisse (A2)", "Gut (B1/B2)", "Sehr gut (C1/C2)", "Muttersprache"], filter: true },
    { key: "beginn", label: "Beginn", type: "text", placeholder: "z. B. ab sofort" },
  ],
  jobsuche: [
    { key: "anstellung", label: "Gesuchte Anstellungsart", type: "multiselect", options: ["Vollzeit", "Teilzeit", "Minijob", "Werkstudent", "Ausbildung", "Praktikum", "Freiberuflich / Projekt", "Aushilfe"], filter: true, required: true },
    { key: "erfahrung", label: "Berufserfahrung", type: "number", unit: "Jahre", min: 0, max: 60, filter: true },
    { key: "qualifikation", label: "Höchster Abschluss", type: "select", options: ["Ohne Abschluss", "Hauptschule / BBR", "MSA / Realschule", "Abitur", "Berufsausbildung", "Meister / Techniker", "Bachelor", "Master / Diplom", "Promotion"] },
    { key: "fuehrerschein", label: "Führerschein", type: "multiselect", options: ["B", "BE", "C1", "C", "CE", "D", "Gabelstapler"] },
    { key: "sprachen", label: "Sprachen", type: "multiselect", options: ["Deutsch", "Englisch", "Türkisch", "Arabisch", "Polnisch", "Russisch", "Ukrainisch", "Französisch", "Spanisch"] },
    { key: "verfuegbar_ab", label: "Verfügbar ab", type: "text" },
  ],
  haushaltshilfe: [
    { key: "anstellung", label: "Anstellungsart", type: "select", options: ["Vollzeit", "Teilzeit", "Minijob", "Stundenweise", "Live-in / Rund um die Uhr", "Einmalig"], filter: true, required: true },
    { key: "stunden", label: "Stunden pro Woche", type: "number", min: 1, max: 168, filter: true },
    { key: "erfahrung", label: "Erfahrung", type: "number", unit: "Jahre", min: 0, max: 60, filter: true },
    { key: "nichtraucher", label: "Nichtraucher/in", type: "boolean", filter: true },
    { key: "fuehrerschein", label: "Führerschein vorhanden", type: "boolean", filter: true },
    { key: "fuehrungszeugnis", label: "Erweitertes Führungszeugnis", type: "boolean", filter: true },
    { key: "erste_hilfe", label: "Erste-Hilfe-Kurs", type: "boolean" },
    { key: "sprachen", label: "Sprachen", type: "multiselect", options: ["Deutsch", "Englisch", "Türkisch", "Arabisch", "Polnisch", "Russisch", "Ukrainisch", "Rumänisch", "Bulgarisch", "Spanisch"], filter: true },
  ],

  // Tiere
  tier: [
    { key: "rasse", label: "Rasse / Art", type: "text", filter: true, required: true },
    { key: "alter", label: "Alter", type: "text", placeholder: "z. B. 10 Wochen, 3 Jahre" },
    { key: "geschlecht", label: "Geschlecht", type: "select", options: ["Männlich", "Weiblich", "Paar / Gruppe", "Unbekannt"], filter: true },
    { key: "geimpft", label: "Geimpft", type: "boolean", filter: true },
    { key: "gechippt", label: "Gechippt", type: "boolean", filter: true },
    { key: "entwurmt", label: "Entwurmt", type: "boolean" },
    { key: "kastriert", label: "Kastriert", type: "boolean", filter: true },
    { key: "papiere", label: "Papiere / Stammbaum", type: "boolean", filter: true },
    { key: "eu_heimtierausweis", label: "EU-Heimtierausweis", type: "boolean" },
  ],
  nutztier: [
    { key: "rasse", label: "Rasse / Art", type: "text", filter: true, required: true },
    { key: "anzahl", label: "Anzahl Tiere", type: "number", min: 1, max: 100_000, filter: true },
    { key: "alter", label: "Alter", type: "text" },
    { key: "geschlecht", label: "Geschlecht", type: "select", options: ["Männlich", "Weiblich", "Gemischt"], filter: true },
    { key: "nutzung", label: "Nutzung", type: "select", options: ["Zucht", "Milch", "Fleisch", "Eier", "Wolle", "Hobby / Freizeit", "Andere"], filter: true },
    { key: "papiere", label: "Papiere / Herdbuch", type: "boolean", filter: true },
  ],
  pferd: [
    { key: "rasse", label: "Rasse", type: "text", filter: true, required: true },
    { key: "alter", label: "Alter", type: "number", unit: "Jahre", min: 0, max: 50, filter: true },
    { key: "stockmass", label: "Stockmaß", type: "number", unit: "cm", min: 50, max: 220, filter: true },
    { key: "geschlecht", label: "Geschlecht", type: "select", options: ["Stute", "Wallach", "Hengst", "Fohlen"], filter: true },
    { key: "ausbildung", label: "Ausbildungsstand", type: "select", options: ["Roh / Jungpferd", "Angeritten", "Freizeitpferd", "Dressur", "Springen", "Vielseitigkeit", "Western", "Fahren", "Zucht"], filter: true },
    { key: "papiere", label: "Equidenpass / Papiere", type: "boolean", filter: true },
    { key: "aku", label: "Ankaufsuntersuchung vorhanden", type: "boolean" },
  ],
  vermisst: [
    { key: "tierart", label: "Tierart", type: "select", options: ["Hund", "Katze", "Vogel", "Kleintier", "Pferd", "Andere"], filter: true, required: true },
    { key: "datum", label: "Seit / am", type: "text", required: true, placeholder: "TT.MM.JJJJ" },
    { key: "merkmale", label: "Besondere Merkmale", type: "text" },
    { key: "gechippt", label: "Gechippt", type: "boolean" },
  ],

  // Veranstaltungen, Nachbarschaft
  veranstaltung: [
    { key: "datum", label: "Datum", type: "text", required: true, placeholder: "TT.MM.JJJJ" },
    { key: "uhrzeit", label: "Uhrzeit", type: "text", placeholder: "z. B. 19:00 Uhr" },
    { key: "ort", label: "Veranstaltungsort", type: "text", filter: true },
    { key: "eintritt_frei", label: "Eintritt frei", type: "boolean", filter: true },
  ],
  allgemein: [],
} as const satisfies Record<string, readonly AttributeDef[]>;

export type AttributeSetKey = keyof typeof ATTRIBUTE_SETS;

export function getAttributeSet(key: AttributeSetKey | undefined): readonly AttributeDef[] {
  if (!key) return [];
  return ATTRIBUTE_SETS[key] as readonly AttributeDef[];
}
