import type { Metadata } from "next";
import Link from "next/link";
import { ResetForm } from "./ResetForm";
import { Notice } from "@/components/Notice";

export const metadata: Metadata = { title: "Neues Passwort", robots: { index: false } };

export default async function ResetPage(props: PageProps<"/passwort-zuruecksetzen">) {
  const sp = await props.searchParams;
  const token = typeof sp.token === "string" ? sp.token : "";
  return (
    <div className="card p-6">
      <h1 className="mb-6 text-2xl font-bold">Neues Passwort festlegen</h1>
      {token ? <ResetForm token={token} /> : <Notice kind="error">Ungültiger Link. <Link href="/passwort-vergessen" className="link">Neuen Link anfordern</Link></Notice>}
    </div>
  );
}
