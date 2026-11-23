"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { saveSearchAction } from "@/app/actions/user-lists";
import { Icon } from "./Icon";

export function SaveSearchButton({ loggedIn }: { loggedIn: boolean }) {
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const url = params.toString() ? `${pathname}?${params.toString()}` : pathname;

  return (
    <span className="flex items-center gap-2">
      <button
        type="button"
        disabled={pending}
        className="btn-outline py-1.5"
        onClick={() => {
          if (!loggedIn) return router.push(`/anmelden?weiter=${encodeURIComponent(url)}`);
          const name = window.prompt("Name für diese Suche:", document.title.split("|")[0].trim());
          if (name === null) return;
          start(async () => {
            const r = await saveSearchAction(name, url);
            setMsg(r.ok ? "Gespeichert ✓" : r.error ?? "Fehler");
          });
        }}
      >
        <Icon name="star" size={16} /> Suche speichern
      </button>
      {msg && <span className="text-xs text-ink-3" role="status">{msg}</span>}
    </span>
  );
}
