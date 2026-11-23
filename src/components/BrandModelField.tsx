"use client";

import { useState } from "react";
import type { AttributeDef } from "@/lib/categories/attributes";

const OTHER_BRAND = "Andere Marke";
const OTHER_MODEL = "__anderes";

/** Marke → Modell: Die Modellliste hängt von der gewählten Marke ab. */
export function BrandModelField({
  brandDef, modelDef, models, brandValue, modelValue, modelFreeValue, errors, wanted,
}: {
  brandDef: AttributeDef;
  modelDef: AttributeDef;
  models: Record<string, readonly string[]>;
  brandValue: string;
  modelValue: string;
  modelFreeValue: string;
  errors: Record<string, string>;
  wanted: boolean;
}) {
  const [brand, setBrand] = useState(brandValue);
  const [model, setModel] = useState(modelValue);
  const list = models[brand] ?? [];
  const brandName = `attr_${brandDef.key}`;
  const modelName = `attr_${modelDef.key}`;
  const req = (d: AttributeDef) => (d.required && !wanted ? " *" : "");

  return (
    <>
      <div>
        <label htmlFor="f-marke" className="label">{brandDef.label}{req(brandDef)}</label>
        <select
          id="f-marke"
          name={brandName}
          className="input"
          value={brand}
          onChange={(e) => { setBrand(e.target.value); setModel(""); }}
          aria-invalid={!!errors[brandName]}
        >
          <option value="">Bitte wählen</option>
          {brandDef.options?.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        {errors[brandName] && <p className="field-error">{errors[brandName]}</p>}
      </div>
      <div>
        <label htmlFor="f-modell" className="label">{modelDef.label}{req(modelDef)}</label>
        {brand === OTHER_BRAND ? (
          <input id="f-modell" name={modelName} className="input" maxLength={60} defaultValue={modelValue === OTHER_MODEL ? modelFreeValue : modelValue} placeholder="Marke und Modell" aria-invalid={!!errors[modelName]} />
        ) : (
          <>
            <select id="f-modell" name={modelName} className="input" value={model} onChange={(e) => setModel(e.target.value)} disabled={!brand} aria-invalid={!!errors[modelName]}>
              <option value="">{brand ? "Bitte wählen" : `Zuerst ${brandDef.label} wählen`}</option>
              {list.map((m) => <option key={m} value={m}>{m}</option>)}
              {brand && <option value={OTHER_MODEL}>Anderes Modell (nicht in der Liste)</option>}
            </select>
            {model === OTHER_MODEL && (
              <input name={`${modelName}_frei`} className="input mt-2" maxLength={60} defaultValue={modelFreeValue} placeholder="Modell eingeben" aria-label="Modell (Freitext)" />
            )}
          </>
        )}
        {errors[modelName] && <p className="field-error">{errors[modelName]}</p>}
      </div>
    </>
  );
}
