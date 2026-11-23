import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SITE } from "@/lib/config";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} – Kleinanzeigen für Berlin & Deutschland`,
    template: `%s | ${SITE.name}`,
  },
  description: "Kostenlose Kleinanzeigen: Immobilien, Autos, Boote, Flugzeuge, Maschinen, Jobs, Nachhilfe, Handwerker, Tiere und vieles mehr – in Berlin und ganz Deutschland.",
  applicationName: SITE.name,
  openGraph: { siteName: SITE.name, locale: "de_DE", type: "website" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0d",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <a href="#inhalt" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-surface focus:p-2">Zum Inhalt springen</a>
        <Header />
        <main id="inhalt" className="mx-auto w-full max-w-7xl flex-1 px-4 pt-6 pb-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
