"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

export function SortSelect({ value, options }: { value: string; options: { value: string; label: string }[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-ink-3">Sortieren:</span>
      <select
        className="rounded-md border border-line bg-surface px-2 py-1.5 text-sm"
        value={value}
        onChange={(e) => {
          const p = new URLSearchParams(params.toString());
          p.set("sort", e.target.value);
          p.delete("seite");
          router.push(`${pathname}?${p.toString()}`);
        }}
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}
