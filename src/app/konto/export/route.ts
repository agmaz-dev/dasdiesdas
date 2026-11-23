import { getCurrentUser } from "@/lib/server/auth";
import { db } from "@/lib/server/db";

/** Datenauskunft / Datenübertragbarkeit (Art. 15, 20 DSGVO) als JSON-Download */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return new Response("Nicht angemeldet", { status: 401 });
  const data = await db.user.findUnique({
    where: { id: user.id },
    select: {
      id: true, email: true, name: true, phone: true, accountType: true, companyName: true, companyAddress: true,
      vatId: true, imprint: true, emailVerifiedAt: true, createdAt: true, updatedAt: true,
      listings: { select: { number: true, title: true, description: true, categoryId: true, priceCents: true, priceType: true, offerType: true, attributes: true, state: true, city: true, district: true, subdistrict: true, postalCode: true, phone: true, status: true, views: true, createdAt: true, publishedAt: true, expiresAt: true, images: { select: { file: true } } } },
      favorites: { select: { createdAt: true, listing: { select: { number: true, title: true } } } },
      savedSearches: { select: { name: true, query: true, createdAt: true } },
      messages: { select: { body: true, createdAt: true, conversation: { select: { listing: { select: { number: true, title: true } } } } } },
      reports: { select: { reason: true, details: true, createdAt: true, status: true } },
    },
  });
  return new Response(JSON.stringify({ exportiertAm: new Date().toISOString(), daten: data }, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="dasdiesdas-datenexport.json"`,
      "Cache-Control": "no-store",
    },
  });
}
