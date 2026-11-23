"use client";

import { useState, useTransition } from "react";
import { resendVerificationAction } from "@/app/actions/auth";

export function ResendVerification() {
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();
  if (msg) return <span className="font-medium">{msg}</span>;
  return (
    <button type="button" disabled={pending} className="link font-medium" onClick={() => start(async () => setMsg((await resendVerificationAction()).message ?? ""))}>
      {pending ? "Wird gesendet …" : "Bestätigungs-E-Mail erneut senden"}
    </button>
  );
}
