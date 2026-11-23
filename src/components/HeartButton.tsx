"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleFavoriteAction } from "@/app/actions/user-lists";

/** Herz-Knopf auf Anzeigenkarten (liegt über dem Karten-Link) */
export function HeartButton({ listingId, initial = false, className = "" }: { listingId: string; initial?: boolean; className?: string }) {
  const [fav, setFav] = useState(initial);
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <button
      type="button"
      aria-label={fav ? "Von der Merkliste entfernen" : "Merken"}
      aria-pressed={fav}
      disabled={pending}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        start(async () => {
          const r = await toggleFavoriteAction(listingId);
          if (!r.ok && r.error === "login") return router.push("/anmelden");
          if (r.ok) setFav(!!r.favorite);
        });
      }}
      className={`grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-black/55 backdrop-blur transition hover:scale-105 ${fav ? "text-brand-600" : "text-white"} ${className}`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill={fav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z" />
      </svg>
    </button>
  );
}
