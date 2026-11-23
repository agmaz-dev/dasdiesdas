import type { MetadataRoute } from "next";
import { SITE } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/konto", "/admin", "/api", "/anzeige-aufgeben", "/melden", "/suche"] }],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
