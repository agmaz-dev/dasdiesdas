import Link from "next/link";
import { getCategoryAttributes, type AttributeDef } from "@/lib/categories";
import { STATE_NAMES, BERLIN, BERLIN_DISTRICTS, DISTRICT_NAMES } from "@/lib/locations";
import { AutoSubmitSelect } from "./AutoSubmit";
import { first, all, type SP } from "@/lib/url";
import { catalogModels, OTHER_BRAND } from "@/lib/catalog";

function AttrFilter({ d, sp }: { d: AttributeDef; sp: SP }) {
  const name = `a_${d.key}`;
  if (d.type === "number") {
    return (
      <fieldset>
        <legend className="label">{d.label}{d.unit ? ` (${d.unit})` : ""}</legend>
        <div className="flex gap-2">
          <input name={`${name}_von`} defaultValue={first(sp[`${name}_von`])} placeholder="von" inputMode="decimal" className="input" aria-label={`${d.label} von`} />
          <input name={`${name}_bis`} defaultValue={first(sp[`${name}_bis`])} placeholder="bis" inputMode="decimal" className="input" aria-label={`${d.label} bis`} />
        </div>
      </fieldset>
    );
  }
  if (d.type === "select" && d.catalog) {
    return (
      <div>
        <label className="label" htmlFor={name}>{d.label}</label>
        <AutoSubmitSelect id={name} name={name} defaultValue={first(sp[name])} className="input" resetFields={["a_modell"]}>
          <option value="">Alle</option>
          {d.options?.map((o) => <option key={o} value={o}>{o}</option>)}
        </AutoSubmitSelect>
      </div>
    );
  }
  if (d.type === "model") {
    const brand = d.parent ? first(sp[`a_${d.parent}`]) : "";
    const models = d.catalog && brand ? catalogModels(d.catalog, brand) : [];
    const current = first(sp[name]);
    return (
      <div>
        <label className="label" htmlFor={name}>{d.label}</label>
        {brand === OTHER_BRAND ? (
          <input id={name} name={name} defaultValue={current} className="input" />
        ) : (
          <select id={name} name={name} defaultValue={current} className="input" disabled={!brand}>
            <option value="">{brand ? "Alle Modelle" : "Zuerst Marke wählen"}</option>
            {models.map((m) => <option key={m} value={m}>{m}</option>)}
            {current && !models.includes(current) && <option value={current}>{current}</option>}
          </select>
        )}
      </div>
    );
  }
  if (d.type === "select") {
    return (
      <div>
        <label className="label" htmlFor={name}>{d.label}</label>
        <select id={name} name={name} defaultValue={first(sp[name])} className="input">
          <option value="">Alle</option>
          {d.options?.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    );
  }
  if (d.type === "multiselect") {
    const sel = all(sp[name]);
    return (
      <details open={sel.length > 0}>
        <summary className="label cursor-pointer">{d.label}{sel.length ? ` (${sel.length})` : ""}</summary>
        <div className="mt-1 max-h-48 space-y-1 overflow-y-auto">
          {d.options?.map((o) => (
            <label key={o} className="flex items-center gap-2 text-sm">
              <input type="checkbox" name={name} value={o} defaultChecked={sel.includes(o)} /> {o}
            </label>
          ))}
        </div>
      </details>
    );
  }
  if (d.type === "text") {
    return (
      <div>
        <label className="label" htmlFor={name}>{d.label}</label>
        <input id={name} name={name} defaultValue={first(sp[name])} className="input" />
      </div>
    );
  }
  return null;
}

export function FilterPanel({ categoryId, action, sp }: { categoryId?: string; action: string; sp: SP }) {
  const defs = categoryId ? getCategoryAttributes(categoryId).filter((d) => d.filter) : [];
  const bools = defs.filter((d) => d.type === "boolean");
  const others = defs.filter((d) => d.type !== "boolean");
  const state = first(sp.bundesland);
  const district = first(sp.bezirk);

  return (
    <form action={action} method="get" className="card space-y-4 p-4">
      <input type="hidden" name="sort" value={first(sp.sort)} />
      <div>
        <label className="label" htmlFor="f-q">Suchbegriff</label>
        <input id="f-q" name="q" defaultValue={first(sp.q)} className="input" placeholder="z. B. Balkon, Automatik" />
      </div>

      <fieldset className="space-y-2">
        <legend className="label">Standort</legend>
        <AutoSubmitSelect name="bundesland" defaultValue={state} className="input" aria-label="Bundesland" resetFields={["bezirk", "ortsteil", "ort"]}>
          <option value="">Ganz Deutschland</option>
          {STATE_NAMES.map((s) => <option key={s} value={s}>{s}</option>)}
        </AutoSubmitSelect>
        {state === BERLIN ? (
          <>
            <AutoSubmitSelect name="bezirk" defaultValue={district} className="input" aria-label="Bezirk" resetFields={["ortsteil"]}>
              <option value="">Alle Bezirke</option>
              {DISTRICT_NAMES.map((d) => <option key={d} value={d}>{d}</option>)}
            </AutoSubmitSelect>
            {district && BERLIN_DISTRICTS[district] && (
              <select name="ortsteil" defaultValue={first(sp.ortsteil)} className="input" aria-label="Ortsteil">
                <option value="">Alle Ortsteile</option>
                {BERLIN_DISTRICTS[district].map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            )}
          </>
        ) : (
          <input name="ort" defaultValue={first(sp.ort)} className="input" placeholder="Ort / Stadt" aria-label="Ort" />
        )}
        <input name="plz" defaultValue={first(sp.plz)} className="input" placeholder="PLZ (auch Anfang, z. B. 10)" inputMode="numeric" maxLength={5} aria-label="Postleitzahl" />
      </fieldset>

      <fieldset>
        <legend className="label">Preis (€)</legend>
        <div className="flex gap-2">
          <input name="preis_von" defaultValue={first(sp.preis_von)} placeholder="von" inputMode="decimal" className="input" aria-label="Preis von" />
          <input name="preis_bis" defaultValue={first(sp.preis_bis)} placeholder="bis" inputMode="decimal" className="input" aria-label="Preis bis" />
        </div>
      </fieldset>

      {others.map((d) => <AttrFilter key={d.key} d={d} sp={sp} />)}

      {bools.length > 0 && (
        <fieldset>
          <legend className="label">Ausstattung & Merkmale</legend>
          <div className="space-y-1">
            {bools.map((d) => (
              <label key={d.key} className="flex items-center gap-2 text-sm">
                <input type="checkbox" name={`a_${d.key}`} value="1" defaultChecked={first(sp[`a_${d.key}`]) === "1"} /> {d.label}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="label" htmlFor="f-anbieter">Anbieter</label>
          <select id="f-anbieter" name="anbieter" defaultValue={first(sp.anbieter)} className="input">
            <option value="">Alle</option>
            <option value="privat">Privat</option>
            <option value="gewerblich">Gewerblich</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="f-art">Art</label>
          <select id="f-art" name="art" defaultValue={first(sp.art)} className="input">
            <option value="">Alle</option>
            <option value="angebot">Angebote</option>
            <option value="gesuch">Gesuche</option>
          </select>
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="bilder" value="1" defaultChecked={first(sp.bilder) === "1"} /> Nur Anzeigen mit Bildern
      </label>

      <div className="flex gap-2">
        <button type="submit" className="btn-primary flex-1">Ergebnisse anzeigen</button>
        <Link href={action} className="btn-outline">Zurücksetzen</Link>
      </div>
    </form>
  );
}
