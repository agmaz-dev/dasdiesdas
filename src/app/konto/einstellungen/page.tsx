import type { Metadata } from "next";
import { requireUser } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { ProfileForm, PasswordForm, DeleteForm } from "./forms";

export const metadata: Metadata = { title: "Einstellungen", robots: { index: false } };

export default async function SettingsPage() {
  const user = await requireUser("/konto/einstellungen");
  const u = await db.user.findUniqueOrThrow({
    where: { id: user.id },
    select: { name: true, email: true, phone: true, accountType: true, companyName: true, companyAddress: true, vatId: true, imprint: true },
  });
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Einstellungen</h1>
      <section className="card p-5">
        <h2 className="mb-1 text-lg font-semibold">Profil & Anbieterangaben</h2>
        <p className="mb-4 text-sm text-ink-3">E-Mail-Adresse: {u.email} (nicht öffentlich)</p>
        <ProfileForm initial={{ name: u.name, phone: u.phone ?? "", accountType: u.accountType, companyName: u.companyName ?? "", companyAddress: u.companyAddress ?? "", vatId: u.vatId ?? "", imprint: u.imprint ?? "" }} />
      </section>
      <section className="card p-5">
        <h2 className="mb-4 text-lg font-semibold">Passwort ändern</h2>
        <PasswordForm />
      </section>
      <section className="card p-5">
        <h2 className="mb-1 text-lg font-semibold">Ihre Daten</h2>
        <p className="mb-3 text-sm text-ink-2">Sie können alle über Sie gespeicherten Daten jederzeit herunterladen (Art. 15 und 20 DSGVO).</p>
        <a href="/konto/export" className="btn-outline">Daten als JSON herunterladen</a>
      </section>
      <section className="card border-red-500/40 p-5">
        <h2 className="mb-1 text-lg font-semibold text-red-300">Konto löschen</h2>
        <p className="mb-4 text-sm text-ink-2">Ihr Konto, alle Anzeigen, Bilder, Nachrichten und Merklisten werden unwiderruflich gelöscht (Art. 17 DSGVO).</p>
        <DeleteForm />
      </section>
    </div>
  );
}
