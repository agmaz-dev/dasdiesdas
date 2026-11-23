"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import type { AttributeDef } from "@/lib/categories/attributes";
import type { PriceMode } from "@/lib/categories/tree";
import type { ActionState } from "@/lib/action-state";
import { ImageUploader, type UploadedImage } from "./ImageUploader";
import { LocationFields } from "./LocationFields";
import { SubmitButton } from "./SubmitButton";
import { Notice } from "./Notice";
import { BrandModelField } from "./BrandModelField";

export type ListingFormInitial = Record<string, string | string[]>;

type Props = {
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
  category: { id: string; label: string; priceMode: PriceMode; priceLabel: string; priceUnit?: string };
  attributes: readonly AttributeDef[];
  initial: ListingFormInitial;
  images: UploadedImage[];
  maxImages: number;
  listingId?: string;
  changeCategoryHref: string;
  catalogs?: Partial<Record<string, Record<string, readonly string[]>>>;
};

const asStr = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] ?? "" : v ?? "");
const asArr = (v: string | string[] | undefined) => (Array.isArray(v) ? v : v ? [v] : []);

function AttrField({ d, value, error, wanted }: { d: AttributeDef; value: string | string[] | undefined; error?: string; wanted: boolean }) {
  const name = `attr_${d.key}`;
  const id = `f-${d.key}`;
  const req = d.required && !wanted;
  const label = (
    <label htmlFor={id} className="label">
      {d.label}{d.unit ? ` (${d.unit})` : ""}{req ? " *" : ""}
    </label>
  );
  const help = error ? <p className="field-error">{error}</p> : d.help ? <p className="mt-1 text-xs text-ink-3">{d.help}</p> : null;

  if (d.type === "boolean") {
    return (
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name={name} defaultChecked={asStr(value) === "on" || asStr(value) === "true"} /> {d.label}
      </label>
    );
  }
  if (d.type === "multiselect") {
    const sel = asArr(value);
    return (
      <fieldset className="sm:col-span-2">
        <legend className="label">{d.label}{req ? " *" : ""}</legend>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {d.options?.map((o) => (
            <label key={o} className="flex items-center gap-1.5 text-sm">
              <input type="checkbox" name={name} value={o} defaultChecked={sel.includes(o)} /> {o}
            </label>
          ))}
        </div>
        {help}
      </fieldset>
    );
  }
  if (d.type === "select") {
    return (
      <div>
        {label}
        <select id={id} name={name} className="input" defaultValue={asStr(value)} aria-invalid={!!error}>
          <option value="">Bitte wählen</option>
          {d.options?.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        {help}
      </div>
    );
  }
  return (
    <div>
      {label}
      <input
        id={id}
        name={name}
        className="input"
        defaultValue={asStr(value)}
        placeholder={d.placeholder}
        inputMode={d.type === "number" ? (d.decimal ? "decimal" : "numeric") : undefined}
        maxLength={120}
        aria-invalid={!!error}
      />
      {help}
    </div>
  );
}

export function ListingForm({ action, category, attributes, initial, images, maxImages, listingId, changeCategoryHref, catalogs = {} }: Props) {
  const [state, formAction] = useActionState(action, {} as ActionState);
  const v = state.values ?? initial;
  const errors = state.errors ?? {};
  const [offerType, setOfferType] = useState(asStr(v.offerType) || "OFFER");
  const [priceType, setPriceType] = useState(asStr(v.priceType) || "FIXED");
  const [desc, setDesc] = useState(asStr(v.description));
  const [showPhone, setShowPhone] = useState(asStr(v.showPhone) === "on");
  const wanted = offerType === "WANTED";
  const nonBool = attributes.filter((a) => a.type !== "boolean");
  const bools = attributes.filter((a) => a.type === "boolean");
  const err = (k: string) => errors[k] && <p className="field-error">{errors[k]}</p>;
  const showPrice = category.priceMode !== "none" && category.priceMode !== "free";

  return (
    <form action={formAction} className="space-y-6" noValidate>
      <input type="hidden" name="categoryId" value={category.id} />
      {listingId && <input type="hidden" name="listingId" value={listingId} />}
      {state.message && <Notice kind="error">{state.message}</Notice>}

      <section className="card space-y-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs text-ink-3 uppercase">Kategorie</p>
            <p className="font-semibold">{category.label}</p>
          </div>
          <Link href={changeCategoryHref} className="link text-sm">Kategorie ändern</Link>
        </div>
        {err("categoryId")}
        <fieldset>
          <legend className="label">Art der Anzeige</legend>
          <div className="flex gap-2">
            {[["OFFER", "Ich biete an"], ["WANTED", "Ich suche"]].map(([val, lbl]) => (
              <label key={val} className={`cursor-pointer rounded-md border px-4 py-2 text-sm ${offerType === val ? "border-brand-600 bg-brand-50 font-semibold" : "border-line"}`}>
                <input type="radio" name="offerType" value={val} checked={offerType === val} onChange={() => setOfferType(val)} className="sr-only" /> {lbl}
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      <section className="card space-y-4 p-5">
        <h2 className="text-lg font-semibold">Anzeigendetails</h2>
        <div>
          <label htmlFor="title" className="label">Titel *</label>
          <input id="title" name="title" className="input" maxLength={90} defaultValue={asStr(v.title)} aria-invalid={!!errors.title} placeholder="Kurz und aussagekräftig, z. B. „Helle 2-Zimmer-Wohnung mit Balkon in Friedrichshain“" />
          {err("title")}
        </div>
        <div>
          <label htmlFor="description" className="label">Beschreibung *</label>
          <textarea id="description" name="description" rows={10} className="input" maxLength={8000} defaultValue={asStr(v.description)} onChange={(e) => setDesc(e.target.value)} aria-invalid={!!errors.description} placeholder="Beschreiben Sie Zustand, Besonderheiten, Mängel, Übergabe …" />
          <div className="flex justify-between">{err("description") || <span />}<span className="mt-1 text-xs text-ink-3">{desc.length} / 8.000</span></div>
        </div>

        {showPrice && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="price" className="label">
                {wanted ? "Budget" : category.priceLabel} (€){category.priceUnit ? ` ${category.priceUnit}` : ""}{category.priceMode === "required" && !wanted && (priceType === "FIXED" || priceType === "NEGOTIABLE") ? " *" : ""}
              </label>
              <input id="price" name="price" inputMode="decimal" className="input" defaultValue={asStr(v.price)} disabled={priceType === "FREE" || priceType === "ON_REQUEST"} aria-invalid={!!errors.price} placeholder="z. B. 1.250" />
              {err("price")}
            </div>
            <div>
              <label htmlFor="priceType" className="label">Preisart</label>
              <select id="priceType" name="priceType" className="input" value={priceType} onChange={(e) => setPriceType(e.target.value)}>
                <option value="FIXED">Festpreis</option>
                <option value="NEGOTIABLE">Verhandlungsbasis (VB)</option>
                <option value="ON_REQUEST">Preis auf Anfrage</option>
                <option value="FREE">Zu verschenken</option>
              </select>
            </div>
          </div>
        )}
        {category.priceMode === "free" && <Notice>In dieser Kategorie werden Artikel kostenlos abgegeben.</Notice>}
      </section>

      {attributes.length > 0 && (
        <section className="card space-y-4 p-5">
          <h2 className="text-lg font-semibold">Merkmale</h2>
          {nonBool.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {nonBool.map((d) => {
                if (d.type === "model") return null; // wird zusammen mit der Marke dargestellt
                const modelDef = d.catalog ? attributes.find((m) => m.type === "model" && m.parent === d.key) : undefined;
                if (d.catalog && modelDef) {
                  return (
                    <BrandModelField
                      key={d.key}
                      brandDef={d}
                      modelDef={modelDef}
                      models={catalogs[d.catalog] ?? {}}
                      brandValue={asStr(v[`attr_${d.key}`])}
                      modelValue={asStr(v[`attr_${modelDef.key}`])}
                      modelFreeValue={asStr(v[`attr_${modelDef.key}_frei`])}
                      errors={errors}
                      wanted={wanted}
                    />
                  );
                }
                return <AttrField key={d.key} d={d} value={v[`attr_${d.key}`]} error={errors[`attr_${d.key}`]} wanted={wanted} />;
              })}
            </div>
          )}
          {bools.length > 0 && (
            <fieldset>
              <legend className="label">Ausstattung</legend>
              <div className="grid gap-1 sm:grid-cols-3">
                {bools.map((d) => <AttrField key={d.key} d={d} value={v[`attr_${d.key}`]} wanted={wanted} />)}
              </div>
            </fieldset>
          )}
        </section>
      )}

      <section className="card space-y-3 p-5">
        <h2 className="text-lg font-semibold">Bilder</h2>
        <ImageUploader initial={images} max={maxImages} />
        {err("images")}
      </section>

      <section className="card space-y-3 p-5">
        <h2 className="text-lg font-semibold">Standort</h2>
        <LocationFields
          initial={{ state: asStr(v.state), city: asStr(v.city), district: asStr(v.district), subdistrict: asStr(v.subdistrict), postalCode: asStr(v.postalCode) }}
          errors={errors}
        />
      </section>

      <section className="card space-y-3 p-5">
        <h2 className="text-lg font-semibold">Kontakt</h2>
        <p className="text-sm text-ink-2">Interessenten können Ihnen immer über das Nachrichtensystem schreiben. Ihre E-Mail-Adresse bleibt verborgen.</p>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="showPhone" checked={showPhone} onChange={(e) => setShowPhone(e.target.checked)} /> Telefonnummer in der Anzeige anzeigen
        </label>
        {showPhone && (
          <div className="max-w-sm">
            <label htmlFor="phone" className="label">Telefonnummer</label>
            <input id="phone" name="phone" type="tel" className="input" defaultValue={asStr(v.phone)} aria-invalid={!!errors.phone} autoComplete="tel" />
            {err("phone")}
          </div>
        )}
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton className="btn-accent px-6 py-3 text-base" pendingText="Wird gespeichert …">
          {listingId ? "Änderungen speichern" : "Anzeige veröffentlichen"}
        </SubmitButton>
        <p className="text-xs text-ink-3">
          Mit dem Veröffentlichen bestätigen Sie, dass Ihre Anzeige den <Link href="/agb" className="link" target="_blank">AGB</Link> entspricht und keine verbotenen Artikel enthält.
        </p>
      </div>
    </form>
  );
}
