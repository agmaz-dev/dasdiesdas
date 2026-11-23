"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { registerAction } from "@/app/actions/auth";
import { SubmitButton } from "@/components/SubmitButton";
import { Notice } from "@/components/Notice";
import { initialState } from "@/lib/action-state";

export function RegisterForm() {
  const [state, action] = useActionState(registerAction, initialState);
  const v = (k: string) => (typeof state.values?.[k] === "string" ? (state.values[k] as string) : "");
  const [type, setType] = useState(v("accountType") || "PRIVATE");
  const err = (k: string) => state.errors?.[k];
  const errEl = (k: string) => err(k) && <p id={`${k}-err`} className="field-error">{err(k)}</p>;
  const aria = (k: string) => ({ "aria-invalid": !!err(k), "aria-describedby": err(k) ? `${k}-err` : undefined });

  return (
    <form action={action} className="space-y-4" noValidate>
      {state.message && <Notice kind="error">{state.message}</Notice>}
      <fieldset>
        <legend className="label">Kontoart</legend>
        <div className="grid grid-cols-2 gap-2">
          {[
            ["PRIVATE", "Privat", "Für private Verkäufe & Gesuche"],
            ["COMMERCIAL", "Gewerblich", "Händler, Makler, Firmen"],
          ].map(([val, label, hint]) => (
            <label key={val} className={`cursor-pointer rounded-md border p-3 text-sm ${type === val ? "border-brand-600 bg-brand-50" : "border-line"}`}>
              <input type="radio" name="accountType" value={val} checked={type === val} onChange={() => setType(val)} className="sr-only" />
              <span className="block font-semibold">{label}</span>
              <span className="text-xs text-ink-3">{hint}</span>
            </label>
          ))}
        </div>
      </fieldset>
      {type === "COMMERCIAL" && (
        <div>
          <label htmlFor="companyName" className="label">Firmenname</label>
          <input id="companyName" name="companyName" className="input" defaultValue={v("companyName")} {...aria("companyName")} />
          {errEl("companyName")}
          <p className="mt-1 text-xs text-ink-3">Gewerbliche Anbieter müssen ein Impressum hinterlegen (Einstellungen nach der Registrierung).</p>
        </div>
      )}
      <div>
        <label htmlFor="name" className="label">{type === "COMMERCIAL" ? "Ansprechpartner/in" : "Name (wird öffentlich angezeigt)"}</label>
        <input id="name" name="name" autoComplete="name" className="input" defaultValue={v("name")} {...aria("name")} />
        {errEl("name")}
      </div>
      <div>
        <label htmlFor="email" className="label">E-Mail-Adresse</label>
        <input id="email" name="email" type="email" autoComplete="email" className="input" defaultValue={v("email")} {...aria("email")} />
        {errEl("email")}
      </div>
      <div>
        <label htmlFor="password" className="label">Passwort</label>
        <input id="password" name="password" type="password" autoComplete="new-password" className="input" {...aria("password")} />
        {errEl("password") || <p className="mt-1 text-xs text-ink-3">Mindestens 10 Zeichen mit Buchstaben und Ziffern.</p>}
      </div>
      <div>
        <label htmlFor="password2" className="label">Passwort wiederholen</label>
        <input id="password2" name="password2" type="password" autoComplete="new-password" className="input" {...aria("password2")} />
        {errEl("password2")}
      </div>
      {/* Honeypot – für Menschen unsichtbar */}
      <div className="hidden" aria-hidden>
        <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <div>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" name="terms" className="mt-1" defaultChecked={v("terms") === "on"} />
          <span>
            Ich akzeptiere die <Link href="/agb" target="_blank" className="link">AGB</Link> und habe die{" "}
            <Link href="/datenschutz" target="_blank" className="link">Datenschutzerklärung</Link> zur Kenntnis genommen.
          </span>
        </label>
        {errEl("terms")}
      </div>
      <SubmitButton className="btn-primary w-full" pendingText="Konto wird erstellt …">Kostenlos registrieren</SubmitButton>
    </form>
  );
}
