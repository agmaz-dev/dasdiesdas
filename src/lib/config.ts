// Zentrale Konfiguration. Werte kommen aus Umgebungsvariablen (.env), siehe .env.example.

export const SITE = {
  name: "dasdiesdas",
  claim: "Kaufen, verkaufen, mieten & finden – in Berlin und ganz Deutschland",
  domain: process.env.SITE_DOMAIN || "dasdiesdas.de",
  url: (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, ""),
  supportEmail: process.env.SUPPORT_EMAIL || "support@dasdiesdas.de",
};

/** Angaben des Betreibers für Impressum & Datenschutz (Pflicht nach § 5 DDG, Art. 13 DSGVO). */
export const OPERATOR = {
  name: process.env.OPERATOR_NAME || "",
  legalForm: process.env.OPERATOR_LEGAL_FORM || "",
  representative: process.env.OPERATOR_REPRESENTATIVE || "",
  street: process.env.OPERATOR_STREET || "",
  city: process.env.OPERATOR_CITY || "",
  email: process.env.OPERATOR_EMAIL || "",
  phone: process.env.OPERATOR_PHONE || "",
  register: process.env.OPERATOR_REGISTER || "",
  vatId: process.env.OPERATOR_VAT_ID || "",
  hosting: process.env.OPERATOR_HOSTING || "",
};

export const LISTING_DURATION_DAYS = 60;
export const MAX_IMAGES_PER_LISTING = 20;
export const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
export const PAGE_SIZE = 24;

export function moderationEnabled(): boolean {
  return process.env.LISTING_MODERATION === "true";
}
