"use client";

import { useActionState } from "react";
import { resetPasswordAction } from "@/app/actions/auth";
import { SubmitButton } from "@/components/SubmitButton";
import { Notice } from "@/components/Notice";
import { initialState } from "@/lib/action-state";

export function ResetForm({ token }: { token: string }) {
  const [state, action] = useActionState(resetPasswordAction, initialState);
  return (
    <form action={action} className="space-y-4">
      {state.message && <Notice kind="error">{state.message}</Notice>}
      <input type="hidden" name="token" value={token} />
      <div>
        <label htmlFor="password" className="label">Neues Passwort</label>
        <input id="password" name="password" type="password" autoComplete="new-password" required className="input" aria-invalid={!!state.errors?.password} />
        {state.errors?.password ? <p className="field-error">{state.errors.password}</p> : <p className="mt-1 text-xs text-ink-3">Mindestens 10 Zeichen mit Buchstaben und Ziffern.</p>}
      </div>
      <div>
        <label htmlFor="password2" className="label">Passwort wiederholen</label>
        <input id="password2" name="password2" type="password" autoComplete="new-password" required className="input" aria-invalid={!!state.errors?.password2} />
        {state.errors?.password2 && <p className="field-error">{state.errors.password2}</p>}
      </div>
      <SubmitButton className="btn-primary w-full">Passwort speichern</SubmitButton>
    </form>
  );
}
