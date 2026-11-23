"use client";

import { useActionState, useEffect, useRef } from "react";
import { replyAction } from "@/app/actions/messages";
import { Notice } from "@/components/Notice";
import { Icon } from "@/components/Icon";
import { initialState } from "@/lib/action-state";
import { useFormStatus } from "react-dom";

function SendButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-label="Nachricht senden" className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand-800 text-white hover:bg-brand-600 disabled:opacity-60">
      <Icon name="send" size={20} />
    </button>
  );
}

export function ReplyForm({ conversationId }: { conversationId: string }) {
  const [state, action] = useActionState(replyAction, initialState);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);
  return (
    <form ref={ref} action={action} className="space-y-2">
      {state.message && <Notice kind="error">{state.message}</Notice>}
      <input type="hidden" name="conversationId" value={conversationId} />
      <div className="flex items-end gap-2">
        <label htmlFor="reply" className="sr-only">Nachricht</label>
        <textarea
          id="reply"
          name="body"
          rows={1}
          maxLength={4000}
          required
          placeholder="Nachricht schreiben …"
          defaultValue={typeof state.values?.body === "string" ? state.values.body : ""}
          className="max-h-40 min-h-12 flex-1 resize-y rounded-3xl border border-line bg-surface-2 px-5 py-3 text-[15px] text-ink placeholder:text-ink-3 focus:border-brand-600 focus:outline-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
        />
        <SendButton />
      </div>
      <p className="text-xs text-ink-3">Enter sendet, Umschalt + Enter für eine neue Zeile.</p>
    </form>
  );
}
