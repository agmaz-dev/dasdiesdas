"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction } from "@/app/actions/auth";
import { SubmitButton } from "@/components/SubmitButton";
import { Notice } from "@/components/Notice";
import { initialState } from "@/lib/action-state";

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState(loginAction, initialState);
  const v = (k: string) => (typeof state.values?.[k] === "string" ? (state.values[k] as string) : "");
  return (
    <form action={action} className="space-y-4">
      {state.message && <Notice kind="error">{state.message}</Notice>}
      <input type="hidden" name="weiter" value={next ?? ""} />
      <div>
        <label htmlFor="email" className="label">E-Mail-Adresse</label>
        <input id="email" name="email" type="email" autoComplete="email" required className="input" defaultValue={v("email")} />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="label">Passwort</label>
          <Link href="/passwort-vergessen" className="link mb-1 text-xs">Passwort vergessen?</Link>
        </div>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="input" />
      </div>
      <SubmitButton className="btn-primary w-full" pendingText="Anmeldung läuft …">Anmelden</SubmitButton>
    </form>
  );
}
