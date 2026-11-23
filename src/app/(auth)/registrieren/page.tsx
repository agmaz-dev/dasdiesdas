import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { RegisterForm } from "./RegisterForm";
import { getCurrentUser } from "@/lib/server/auth";

export const metadata: Metadata = { title: "Registrieren", robots: { index: false } };

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect("/konto");
  return (
    <div className="card p-6">
      <h1 className="mb-1 text-2xl font-bold">Kostenlos registrieren</h1>
      <p className="mb-6 text-sm text-ink-2">
        Bereits registriert? <Link href="/anmelden" className="link">Zur Anmeldung</Link>
      </p>
      <RegisterForm />
    </div>
  );
}
