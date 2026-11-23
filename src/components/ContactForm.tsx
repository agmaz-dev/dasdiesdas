"use client";

import { useActionState } from "react";
import { startConversationAction } from "@/app/actions/messages";
import { SubmitButton } from "./SubmitButton";
import { Notice } from "./Notice";
import { initialState } from "@/lib/action-state";
import { Icon } from "./Icon";

export function ContactForm({ listingId, title }: { listingId: string; title: string }) {
  const [state, action] = useActionState(startConversationAction, initialState);
  return (
    <form action={action} className="space-y-2">
      {state.message && <Notice kind="error">{state.message}</Notice>}
      <input type="hidden" name="listingId" value={listingId} />
      <label htmlFor="contact-body" className="label">Nachricht an den Anbieter</label>
      <textarea
        id="contact-body"
        name="body"
        rows={4}
        maxLength={4000}
        required
        className="input"
        defaultValue={typeof state.values?.body === "string" ? state.values.body : `Hallo, ist „${title}“ noch verfügbar?`}
      />
      <SubmitButton className="btn-primary w-full" pendingText="Wird gesendet …"><Icon name="chat" size={18} /> Nachricht senden</SubmitButton>
      <p className="text-xs text-ink-3">Ihre E-Mail-Adresse bleibt verborgen. Antworten erhalten Sie in Ihrem Postfach auf dasdiesdas.</p>
    </form>
  );
}
