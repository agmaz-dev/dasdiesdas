"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleFavoriteAction } from "@/app/actions/user-lists";
import { Icon } from "./Icon";

export function FavoriteButton({ listingId, initial, loginHref }: { listingId: string; initial: boolean; loginHref: string }) {
  const [fav, setFav] = useState(initial);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <div>
      <button
        type="button"
        disabled={pending}
        aria-pressed={fav}
        className={`btn-outline w-full ${fav ? "border-accent-500 text-brand-500" : ""}`}
        onClick={() =>
          start(async () => {
            const r = await toggleFavoriteAction(listingId);
            if (!r.ok && r.error === "login") return router.push(loginHref);
            if (!r.ok) return setError(r.error ?? "Fehler");
            setFav(!!r.favorite);
          })
        }
      >
        <Icon name="heart" size={18} className={fav ? "fill-brand-600 text-brand-600" : ""} /> {fav ? "Gemerkt" : "Merken"}
      </button>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
