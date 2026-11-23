"use client";

import { useActionState } from "react";
import { reportListingAction } from "@/app/actions/reports";
import { SubmitButton } from "@/components/SubmitButton";
import { Notice } from "@/components/Notice";
import { initialState } from "@/lib/action-state";

export function ReportForm({ listingId, needsEmail, reasons }: { listingId: string; needsEmail: boolean; reasons: string[] }) {
  const [state, action] = useActionState(reportListingAction, initialState);
  if (state.ok) return <Notice kind="success">{state.message}</Notice>;
  const v = (k: string) => (typeof state.values?.[k] === "string" ? (state.values[k] as string) : "");
  const e = (k: string) => state.errors?.[k] && <p className="field-error">{state.errors[k]}</p>;
  return (
    <form action={action} className="space-y-4">
      {state.message && <Notice kind="error">{state.message}</Notice>}
      <input type="hidden" name="listingId" value={listingId} />
      <div>
        <label htmlFor="reason" className="label">Grund *</label>
        <select id="reason" name="reason" className="input" defaultValue={v("reason")} aria-invalid={!!state.errors?.reason}>
          <option value="">Bitte wählen</option>
          {reasons.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        {e("reason")}
      </div>
      <div>
        <label htmlFor="details" className="label">Begründung *</label>
        <textarea id="details" name="details" rows={5} maxLength={4000} className="input" defaultValue={v("details")} aria-invalid={!!state.errors?.details} placeholder="Warum ist dieser Inhalt rechtswidrig bzw. unzulässig? Welche Stelle betrifft es?" />
        {e("details")}
      </div>
      {needsEmail && (
        <div>
          <label htmlFor="email" className="label">Ihre E-Mail-Adresse (optional, für Rückmeldung)</label>
          <input id="email" name="email" type="email" className="input" defaultValue={v("email")} aria-invalid={!!state.errors?.email} />
          {e("email")}
        </div>
      )}
      <div>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" name="truth" className="mt-1" />
          <span>Ich bestätige, dass meine Angaben nach bestem Wissen und Gewissen richtig und vollständig sind.</span>
        </label>
        {e("truth")}
      </div>
      <SubmitButton>Meldung absenden</SubmitButton>
    </form>
  );
}
