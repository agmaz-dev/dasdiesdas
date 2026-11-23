"use client";

import { usePathname } from "next/navigation";

/** Kompakte Suche im Header – auf der Startseite ausgeblendet (dort gibt es die große Suche) */
export function HeaderSearch({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  if (path === "/") return null;
  return <div className="order-3 w-full md:order-none md:max-w-xl md:flex-1">{children}</div>;
}
