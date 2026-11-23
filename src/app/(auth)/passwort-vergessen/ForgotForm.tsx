"use client";

import { useActionState } from "react";
import { requestPasswordResetAction } from "@/app/actions/auth";
import { SubmitButton } from "@/components/SubmitButton";
import { Notice } from "@/components/Notice";
import { initialState } from "@/lib/action-state";

export function ForgotForm() {
  const [state, action] = useActionState(requestPasswordResetAction, initialState);
  if (state.ok) return <Notice kind="success">{state.message}</Notice>;
  return (
    <form action={action} className="space-y-4">
      {state.message && <Notice kind="error">{state.message}</Notice>}
      <div>
        <label htmlFor="email" className="label">E-Mail-Adresse</label>
        <input id="email" name="email" type="email" autoComplete="email" required className="input" />
      </div>
      <SubmitButton className="btn-primary w-full">Link anfordern</SubmitButton>
    </form>
  );
}
