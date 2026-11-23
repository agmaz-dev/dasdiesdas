import type { Metadata } from "next";
import Link from "next/link";
import { verifyEmail } from "@/app/actions/auth";
import { Notice } from "@/components/Notice";

export const metadata: Metadata = { title: "E-Mail bestätigen", robots: { index: false } };

export default async function VerifyPage(props: PageProps<"/email-bestaetigen">) {
  const sp = await props.searchParams;
  const token = typeof sp.token === "string" ? sp.token : "";
  const ok = token ? await verifyEmail(token) : false;
  return (
    <div className="card space-y-4 p-6">
      <h1 className="text-2xl font-bold">E-Mail-Bestätigung</h1>
      {ok ? (
        <>
          <Notice kind="success">Vielen Dank! Ihre E-Mail-Adresse wurde bestätigt.</Notice>
          <Link href="/anzeige-aufgeben" className="btn-accent">Jetzt Anzeige aufgeben</Link>
        </>
      ) : (
        <Notice kind="error">
          Der Bestätigungslink ist ungültig oder abgelaufen. Melden Sie sich an und fordern Sie unter{" "}
          <Link href="/konto" className="link">Mein Konto</Link> einen neuen Link an.
        </Notice>
      )}
    </div>
  );
}
