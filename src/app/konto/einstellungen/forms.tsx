"use client";

import { useActionState, useState } from "react";
import { updateProfileAction, changePasswordAction, deleteAccountAction } from "@/app/actions/account";
import { SubmitButton } from "@/components/SubmitButton";
import { Notice } from "@/components/Notice";
import { initialState, type ActionState } from "@/lib/action-state";

function Field({ name, label, state, initial, type = "text", textarea, hint, autoComplete }: { name: string; label: string; state: ActionState; initial?: string; type?: string; textarea?: boolean; hint?: string; autoComplete?: string }) {
  const err = state.errors?.[name];
  const val = typeof state.values?.[name] === "string" ? (state.values[name] as string) : initial;
  return (
    <div>
      <label htmlFor={name} className="label">{label}</label>
      {textarea ? (
        <textarea id={name} name={name} rows={4} className="input" defaultValue={val} aria-invalid={!!err} />
      ) : (
        <input id={name} name={name} type={type} className="input" defaultValue={val} aria-invalid={!!err} autoComplete={autoComplete} />
      )}
      {err ? <p className="field-error">{err}</p> : hint && <p className="mt-1 text-xs text-ink-3">{hint}</p>}
    </div>
  );
}

export function ProfileForm({ initial }: { initial: Record<string, string> }) {
  const [state, action] = useActionState(updateProfileAction, initialState);
  const [type, setType] = useState(initial.accountType);
  return (
    <form action={action} className="space-y-4">
      {state.message && <Notice kind={state.ok ? "success" : "error"}>{state.message}</Notice>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="name" label="Name (öffentlich)" state={state} initial={initial.name} autoComplete="name" />
        <Field name="phone" label="Telefon (nur sichtbar, wenn in Anzeige aktiviert)" state={state} initial={initial.phone} type="tel" autoComplete="tel" />
      </div>
      <fieldset>
        <legend className="label">Kontoart</legend>
        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-2"><input type="radio" name="accountType" value="PRIVATE" checked={type === "PRIVATE"} onChange={() => setType("PRIVATE")} /> Privat</label>
          <label className="flex items-center gap-2"><input type="radio" name="accountType" value="COMMERCIAL" checked={type === "COMMERCIAL"} onChange={() => setType("COMMERCIAL")} /> Gewerblich</label>
        </div>
      </fieldset>
      {type === "COMMERCIAL" && (
        <div className="space-y-4 rounded-md bg-surface-2 p-4">
          <p className="text-sm text-ink-2">Pflichtangaben nach § 5 Digitale-Dienste-Gesetz (DDG). Diese werden bei Ihren Anzeigen als Impressum angezeigt.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="companyName" label="Firmenname inkl. Rechtsform *" state={state} initial={initial.companyName} autoComplete="organization" />
            <Field name="vatId" label="USt-IdNr. (falls vorhanden)" state={state} initial={initial.vatId} />
          </div>
          <Field name="companyAddress" label="Ladungsfähige Anschrift *" state={state} initial={initial.companyAddress} hint="Straße Hausnr., PLZ Ort" />
          <Field name="imprint" label="Weitere Impressumsangaben" state={state} initial={initial.imprint} textarea hint="z. B. Vertretungsberechtigte, Handelsregister, Aufsichtsbehörde, Kammer" />
        </div>
      )}
      <SubmitButton>Speichern</SubmitButton>
    </form>
  );
}

export function PasswordForm() {
  const [state, action] = useActionState(changePasswordAction, initialState);
  return (
    <form action={action} className="max-w-md space-y-4">
      {state.message && <Notice kind={state.ok ? "success" : "error"}>{state.message}</Notice>}
      <Field name="currentPassword" label="Aktuelles Passwort" state={state} type="password" autoComplete="current-password" />
      <Field name="password" label="Neues Passwort" state={state} type="password" hint="Mindestens 10 Zeichen mit Buchstaben und Ziffern." autoComplete="new-password" />
      <Field name="password2" label="Neues Passwort wiederholen" state={state} type="password" autoComplete="new-password" />
      <SubmitButton>Passwort ändern</SubmitButton>
    </form>
  );
}

export function DeleteForm() {
  const [state, action] = useActionState(deleteAccountAction, initialState);
  return (
    <form action={action} className="max-w-md space-y-4">
      <Field name="password" label="Passwort zur Bestätigung" state={state} type="password" autoComplete="current-password" />
      <div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="confirm" /> Ja, ich möchte mein Konto endgültig löschen.</label>
        {state.errors?.confirm && <p className="field-error">{state.errors.confirm}</p>}
      </div>
      <SubmitButton className="btn-danger" pendingText="Wird gelöscht …">Konto endgültig löschen</SubmitButton>
    </form>
  );
}
