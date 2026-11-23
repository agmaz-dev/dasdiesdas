// Standortdaten für Deutschland mit Schwerpunkt Berlin.

export const BERLIN = "Berlin";

export const BERLIN_DISTRICTS: Record<string, readonly string[]> = {
  Mitte: ["Mitte", "Moabit", "Hansaviertel", "Tiergarten", "Wedding", "Gesundbrunnen"],
  "Friedrichshain-Kreuzberg": ["Friedrichshain", "Kreuzberg"],
  Pankow: ["Prenzlauer Berg", "Weißensee", "Blankenburg", "Heinersdorf", "Karow", "Stadtrandsiedlung Malchow", "Pankow", "Blankenfelde", "Buch", "Französisch Buchholz", "Niederschönhausen", "Rosenthal", "Wilhelmsruh"],
  "Charlottenburg-Wilmersdorf": ["Charlottenburg", "Wilmersdorf", "Schmargendorf", "Grunewald", "Westend", "Charlottenburg-Nord", "Halensee"],
  Spandau: ["Spandau", "Haselhorst", "Siemensstadt", "Staaken", "Gatow", "Kladow", "Hakenfelde", "Falkenhagener Feld", "Wilhelmstadt"],
  "Steglitz-Zehlendorf": ["Steglitz", "Lichterfelde", "Lankwitz", "Zehlendorf", "Dahlem", "Nikolassee", "Wannsee"],
  "Tempelhof-Schöneberg": ["Schöneberg", "Friedenau", "Tempelhof", "Mariendorf", "Marienfelde", "Lichtenrade"],
  Neukölln: ["Neukölln", "Britz", "Buckow", "Rudow", "Gropiusstadt"],
  "Treptow-Köpenick": ["Alt-Treptow", "Plänterwald", "Baumschulenweg", "Johannisthal", "Niederschöneweide", "Altglienicke", "Adlershof", "Bohnsdorf", "Oberschöneweide", "Köpenick", "Friedrichshagen", "Rahnsdorf", "Grünau", "Müggelheim", "Schmöckwitz"],
  "Marzahn-Hellersdorf": ["Marzahn", "Biesdorf", "Kaulsdorf", "Mahlsdorf", "Hellersdorf"],
  Lichtenberg: ["Friedrichsfelde", "Karlshorst", "Lichtenberg", "Falkenberg", "Malchow", "Wartenberg", "Neu-Hohenschönhausen", "Alt-Hohenschönhausen", "Fennpfuhl", "Rummelsburg"],
  Reinickendorf: ["Reinickendorf", "Tegel", "Konradshöhe", "Heiligensee", "Frohnau", "Hermsdorf", "Waidmannslust", "Lübars", "Wittenau", "Märkisches Viertel", "Borsigwalde"],
};

/** Bundesländer mit größeren Städten (Vorschlagsliste; andere Orte können frei eingegeben werden). */
export const STATES: Record<string, readonly string[]> = {
  Berlin: ["Berlin"],
  Brandenburg: ["Potsdam", "Cottbus", "Brandenburg an der Havel", "Frankfurt (Oder)", "Oranienburg", "Falkensee", "Bernau bei Berlin", "Eberswalde", "Königs Wusterhausen", "Fürstenwalde/Spree", "Teltow", "Blankenfelde-Mahlow", "Ludwigsfelde", "Hennigsdorf", "Kleinmachnow", "Strausberg", "Neuruppin", "Schwedt/Oder", "Senftenberg", "Eisenhüttenstadt", "Hoppegarten", "Wildau", "Schönefeld", "Werder (Havel)", "Rathenow", "Luckenwalde", "Prenzlau", "Zossen"],
  "Baden-Württemberg": ["Stuttgart", "Mannheim", "Karlsruhe", "Freiburg im Breisgau", "Heidelberg", "Ulm", "Heilbronn", "Pforzheim", "Reutlingen", "Esslingen am Neckar", "Ludwigsburg", "Tübingen", "Villingen-Schwenningen", "Konstanz", "Aalen", "Sindelfingen", "Friedrichshafen", "Offenburg", "Göppingen", "Baden-Baden"],
  Bayern: ["München", "Nürnberg", "Augsburg", "Regensburg", "Ingolstadt", "Würzburg", "Fürth", "Erlangen", "Bamberg", "Bayreuth", "Landshut", "Aschaffenburg", "Kempten (Allgäu)", "Rosenheim", "Neu-Ulm", "Schweinfurt", "Passau", "Freising", "Straubing", "Dachau"],
  Bremen: ["Bremen", "Bremerhaven"],
  Hamburg: ["Hamburg"],
  Hessen: ["Frankfurt am Main", "Wiesbaden", "Kassel", "Darmstadt", "Offenbach am Main", "Hanau", "Gießen", "Marburg", "Fulda", "Rüsselsheim am Main", "Bad Homburg vor der Höhe", "Wetzlar", "Oberursel (Taunus)", "Rodgau"],
  "Mecklenburg-Vorpommern": ["Rostock", "Schwerin", "Neubrandenburg", "Stralsund", "Greifswald", "Wismar", "Güstrow", "Waren (Müritz)", "Neustrelitz", "Parchim"],
  Niedersachsen: ["Hannover", "Braunschweig", "Oldenburg", "Osnabrück", "Wolfsburg", "Göttingen", "Salzgitter", "Hildesheim", "Delmenhorst", "Wilhelmshaven", "Lüneburg", "Celle", "Garbsen", "Hameln", "Lingen (Ems)", "Langenhagen", "Nordhorn", "Wolfenbüttel", "Goslar", "Emden"],
  "Nordrhein-Westfalen": ["Köln", "Düsseldorf", "Dortmund", "Essen", "Duisburg", "Bochum", "Wuppertal", "Bielefeld", "Bonn", "Münster", "Mönchengladbach", "Gelsenkirchen", "Aachen", "Krefeld", "Oberhausen", "Hagen", "Hamm", "Mülheim an der Ruhr", "Leverkusen", "Solingen", "Herne", "Neuss", "Paderborn", "Bottrop", "Recklinghausen", "Remscheid", "Bergisch Gladbach", "Moers", "Siegen", "Gütersloh"],
  "Rheinland-Pfalz": ["Mainz", "Ludwigshafen am Rhein", "Koblenz", "Trier", "Kaiserslautern", "Worms", "Neuwied", "Neustadt an der Weinstraße", "Speyer", "Frankenthal (Pfalz)", "Bad Kreuznach", "Landau in der Pfalz", "Pirmasens", "Zweibrücken"],
  Saarland: ["Saarbrücken", "Neunkirchen", "Homburg", "Völklingen", "Sankt Ingbert", "Saarlouis", "Merzig", "St. Wendel"],
  Sachsen: ["Leipzig", "Dresden", "Chemnitz", "Zwickau", "Plauen", "Görlitz", "Freiberg", "Bautzen", "Pirna", "Freital", "Radebeul", "Riesa", "Hoyerswerda", "Meißen"],
  "Sachsen-Anhalt": ["Halle (Saale)", "Magdeburg", "Dessau-Roßlau", "Lutherstadt Wittenberg", "Bitterfeld-Wolfen", "Halberstadt", "Stendal", "Weißenfels", "Merseburg", "Naumburg (Saale)", "Bernburg (Saale)", "Wernigerode"],
  "Schleswig-Holstein": ["Kiel", "Lübeck", "Flensburg", "Neumünster", "Norderstedt", "Elmshorn", "Pinneberg", "Wedel", "Ahrensburg", "Itzehoe", "Geesthacht", "Henstedt-Ulzburg", "Rendsburg", "Husum"],
  Thüringen: ["Erfurt", "Jena", "Gera", "Weimar", "Gotha", "Nordhausen", "Eisenach", "Suhl", "Mühlhausen/Thüringen", "Altenburg", "Ilmenau", "Saalfeld/Saale"],
};

export const STATE_NAMES = Object.keys(STATES);
export const DISTRICT_NAMES = Object.keys(BERLIN_DISTRICTS);

export function isValidState(s: string): boolean {
  return Object.prototype.hasOwnProperty.call(STATES, s);
}

export function isValidDistrict(d: string): boolean {
  return Object.prototype.hasOwnProperty.call(BERLIN_DISTRICTS, d);
}

export function isValidSubdistrict(district: string, sub: string): boolean {
  return isValidDistrict(district) && BERLIN_DISTRICTS[district].includes(sub);
}

export function isValidPostalCode(plz: string): boolean {
  return /^\d{5}$/.test(plz) && plz !== "00000";
}

/** Berliner Postleitzahlen liegen im Bereich 10115–14199. */
export function isBerlinPostalCode(plz: string): boolean {
  const n = Number(plz);
  return n >= 10115 && n <= 14199;
}

export function formatLocation(l: { postalCode?: string | null; city: string; district?: string | null; subdistrict?: string | null }): string {
  if (l.district) {
    return `${l.city} – ${l.subdistrict && l.subdistrict !== l.district ? `${l.subdistrict} (${l.district})` : l.district}`;
  }
  return `${l.postalCode ? l.postalCode + " " : ""}${l.city}`;
}
