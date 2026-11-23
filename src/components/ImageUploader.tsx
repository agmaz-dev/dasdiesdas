"use client";

import { useRef, useState } from "react";
import { Icon } from "./Icon";

export type UploadedImage = { id: string; thumbUrl: string };
type Pending = { key: string; name: string; error?: string };

export function ImageUploader({ initial, max }: { initial: UploadedImage[]; max: number }) {
  const [images, setImages] = useState<UploadedImage[]>(initial);
  const [pending, setPending] = useState<Pending[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadOne(file: File, key: string) {
    const body = new FormData();
    body.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json().catch(() => ({ error: "Upload fehlgeschlagen." }));
      if (!res.ok) throw new Error(data.error || "Upload fehlgeschlagen.");
      setImages((prev) => (prev.length < max ? [...prev, { id: data.id, thumbUrl: data.thumbUrl }] : prev));
      setPending((p) => p.filter((x) => x.key !== key));
    } catch (e) {
      setPending((p) => p.map((x) => (x.key === key ? { ...x, error: e instanceof Error ? e.message : "Fehler" } : x)));
    }
  }

  async function onFiles(files: FileList | null) {
    if (!files) return;
    const free = max - images.length - pending.filter((p) => !p.error).length;
    const list = Array.from(files).slice(0, Math.max(0, free));
    const items = list.map((f, i) => ({ file: f, key: `${Date.now()}-${i}-${f.name}` }));
    setPending((p) => [...p, ...items.map((it) => ({ key: it.key, name: it.file.name }))]);
    if (inputRef.current) inputRef.current.value = "";
    // Zwei Uploads parallel
    const queue = [...items];
    await Promise.all(
      [0, 1].map(async () => {
        while (queue.length) {
          const it = queue.shift()!;
          await uploadOne(it.file, it.key);
        }
      }),
    );
  }

  const move = (idx: number, d: number) =>
    setImages((prev) => {
      const next = [...prev];
      const j = idx + d;
      if (j < 0 || j >= next.length) return prev;
      [next[idx], next[j]] = [next[j], next[idx]];
      return next;
    });

  const busy = pending.some((p) => !p.error);
  return (
    <div>
      {images.map((img) => <input key={img.id} type="hidden" name="imageIds" value={img.id} />)}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {images.map((img, idx) => (
          <div key={img.id} className="group relative aspect-[4/3] overflow-hidden rounded border border-line bg-surface-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.thumbUrl} alt={`Bild ${idx + 1}`} className="h-full w-full object-cover" />
            {idx === 0 && <span className="absolute top-1 left-1 rounded bg-brand-700 px-1.5 text-xs text-white">Titelbild</span>}
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/60 p-1 text-white">
              <button type="button" onClick={() => move(idx, -1)} disabled={idx === 0} className="px-1 disabled:opacity-30" aria-label="Nach vorne">◀</button>
              <button type="button" onClick={() => setImages((p) => p.filter((x) => x.id !== img.id))} className="px-1" aria-label="Bild entfernen">🗑</button>
              <button type="button" onClick={() => move(idx, 1)} disabled={idx === images.length - 1} className="px-1 disabled:opacity-30" aria-label="Nach hinten">▶</button>
            </div>
          </div>
        ))}
        {pending.map((p) => (
          <div key={p.key} className={`grid aspect-[4/3] place-items-center rounded border p-1 text-center text-xs ${p.error ? "border-red-500/40 bg-red-500/10 text-red-300" : "border-line bg-surface-2 text-ink-3"}`}>
            {p.error ? (
              <span>
                {p.error}
                <button type="button" className="mt-1 block w-full underline" onClick={() => setPending((x) => x.filter((y) => y.key !== p.key))}>Ausblenden</button>
              </span>
            ) : (
              <span className="animate-pulse">Lädt hoch …</span>
            )}
          </div>
        ))}
        {images.length < max && (
          <button type="button" onClick={() => inputRef.current?.click()} className="grid aspect-[4/3] place-items-center rounded border-2 border-dashed border-line text-sm text-ink-3 hover:border-brand-600 hover:text-brand-500">
            <span className="flex flex-col items-center gap-1"><Icon name="camera" size={26} />Bilder hinzufügen</span>
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
      <p className="mt-2 text-xs text-ink-3">
        {images.length} von {max} Bildern · JPG, PNG, WebP · max. 15 MB je Bild · Standortdaten (GPS) werden automatisch entfernt.
        {busy && <strong className="ml-1 text-ink-2">Bitte warten, bis alle Uploads abgeschlossen sind.</strong>}
      </p>
    </div>
  );
}
