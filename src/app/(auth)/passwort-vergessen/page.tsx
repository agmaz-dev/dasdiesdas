import type { Metadata } from "next";
import { ForgotForm } from "./ForgotForm";

export const metadata: Metadata = { title: "Passwort vergessen", robots: { index: false } };

export default function ForgotPage() {
  return (
    <div className="card p-6">
      <h1 className="mb-1 text-2xl font-bold">Passwort vergessen</h1>
      <p className="mb-6 text-sm text-ink-2">Geben Sie Ihre E-Mail-Adresse ein. Wir senden Ihnen einen Link zum Zurücksetzen.</p>
      <ForgotForm />
    </div>
  );
}
