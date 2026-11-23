"use client";

import { useCallback, useEffect, useState } from "react";

export function Gallery({ images, title }: { images: { file: string; thumb: string }[]; title: string }) {
  const [i, setI] = useState(0);
  const [zoom, setZoom] = useState(false);
  const n = images.length;
  const go = useCallback((d: number) => setI((x) => (x + d + n) % n), [n]);

  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoom(false);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [zoom, go]);

  if (!n) {
    return <div className="grid aspect-[4/3] place-items-center rounded-lg bg-surface-2 text-ink-3">Keine Bilder vorhanden</div>;
  }
  const arrow = "absolute top-1/2 -translate-y-1/2 rounded-full bg-black/50 px-3 py-2 text-xl text-white hover:bg-black/70";
  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-page">
        {/* eslint-disable-next-line @next/next/no-img-element -- serverseitig optimiert */}
        <img src={`/media/${images[i].file}`} alt={`${title} – Bild ${i + 1} von ${n}`} className="h-full w-full cursor-zoom-in object-contain" onClick={() => setZoom(true)} />
        {n > 1 && (
          <>
            <button type="button" className={`${arrow} left-2`} onClick={() => go(-1)} aria-label="Vorheriges Bild">‹</button>
            <button type="button" className={`${arrow} right-2`} onClick={() => go(1)} aria-label="Nächstes Bild">›</button>
          </>
        )}
        <span className="absolute right-2 bottom-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white">{i + 1} / {n}</span>
      </div>
      {n > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {images.map((img, idx) => (
            <button key={img.thumb} type="button" onClick={() => setI(idx)} aria-label={`Bild ${idx + 1} anzeigen`} className={`h-16 w-20 shrink-0 overflow-hidden rounded border-2 ${idx === i ? "border-brand-600" : "border-transparent opacity-70 hover:opacity-100"}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/media/${img.thumb}`} alt="" className="h-full w-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}
      {zoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95" role="dialog" aria-modal="true" aria-label="Bildansicht" onClick={() => setZoom(false)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/media/${images[i].file}`} alt={`${title} – Bild ${i + 1}`} className="max-h-full max-w-full object-contain" onClick={(e) => e.stopPropagation()} />
          <button type="button" className="absolute top-4 right-4 text-3xl text-white" onClick={() => setZoom(false)} aria-label="Schließen">×</button>
          {n > 1 && (
            <>
              <button type="button" className={`${arrow} left-4`} onClick={(e) => { e.stopPropagation(); go(-1); }} aria-label="Vorheriges Bild">‹</button>
              <button type="button" className={`${arrow} right-4`} onClick={(e) => { e.stopPropagation(); go(1); }} aria-label="Nächstes Bild">›</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
