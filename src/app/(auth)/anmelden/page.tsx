import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";
import { getCurrentUser, safeRedirectPath } from "@/lib/server/auth";

export const metadata: Metadata = { title: "Anmelden", robots: { index: false } };

export default async function LoginPage(props: PageProps<"/anmelden">) {
  const sp = await props.searchParams;
  const next = typeof sp.weiter === "string" ? safeRedirectPath(sp.weiter, "") : "";
  if (await getCurrentUser()) redirect(next || "/konto");
  return (
    <div className="card p-6">
      <h1 className="mb-1 text-2xl font-bold">Anmelden</h1>
      <p className="mb-6 text-sm text-ink-2">
        Noch kein Konto? <Link href={`/registrieren${next ? `?weiter=${encodeURIComponent(next)}` : ""}`} className="link">Jetzt kostenlos registrieren</Link>
      </p>
      <LoginForm next={next} />
    </div>
  );
}
