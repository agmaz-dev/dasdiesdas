"use client";

import { useState } from "react";
import { STATES, STATE_NAMES, BERLIN, BERLIN_DISTRICTS, DISTRICT_NAMES } from "@/lib/locations";

export function LocationFields({ initial, errors }: { initial: { state?: string; city?: string; district?: string; subdistrict?: string; postalCode?: string }; errors?: Record<string, string> }) {
  const [state, setState] = useState(initial.state || BERLIN);
  const [district, setDistrict] = useState(initial.district || "");
  const err = (k: string) => errors?.[k] && <p className="field-error">{errors[k]}</p>;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div>
        <label htmlFor="state" className="label">Bundesland *</label>
        <select id="state" name="state" className="input" value={state} onChange={(e) => setState(e.target.value)} aria-invalid={!!errors?.state}>
          {STATE_NAMES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        {err("state")}
      </div>
      {state === BERLIN ? (
        <>
          <div>
            <label htmlFor="district" className="label">Bezirk *</label>
            <select id="district" name="district" className="input" value={district} onChange={(e) => setDistrict(e.target.value)} aria-invalid={!!errors?.district}>
              <option value="">Bitte wählen</option>
              {DISTRICT_NAMES.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            {err("district")}
          </div>
          <div>
            <label htmlFor="subdistrict" className="label">Ortsteil</label>
            <select id="subdistrict" name="subdistrict" className="input" defaultValue={initial.subdistrict || ""} key={district} disabled={!district} aria-invalid={!!errors?.subdistrict}>
              <option value="">{district ? "Bitte wählen (optional)" : "Zuerst Bezirk wählen"}</option>
              {(BERLIN_DISTRICTS[district] ?? []).map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            {err("subdistrict")}
          </div>
          <input type="hidden" name="city" value={BERLIN} />
        </>
      ) : (
        <div>
          <label htmlFor="city" className="label">Ort *</label>
          <input id="city" name="city" list="city-list" className="input" defaultValue={initial.city && initial.city !== BERLIN ? initial.city : ""} aria-invalid={!!errors?.city} autoComplete="address-level2" />
          <datalist id="city-list">
            {(STATES[state] ?? []).map((c) => <option key={c} value={c} />)}
          </datalist>
          {err("city")}
        </div>
      )}
      <div>
        <label htmlFor="postalCode" className="label">Postleitzahl *</label>
        <input id="postalCode" name="postalCode" inputMode="numeric" maxLength={5} pattern="\d{5}" className="input" defaultValue={initial.postalCode || ""} aria-invalid={!!errors?.postalCode} autoComplete="postal-code" />
        {err("postalCode")}
        <p className="mt-1 text-xs text-ink-3">Ihre genaue Adresse wird nicht veröffentlicht.</p>
      </div>
    </div>
  );
}
