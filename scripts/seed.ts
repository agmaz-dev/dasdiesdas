/**
 * Seed-Skript
 *   npm run seed        → legt das Admin-Konto an (ADMIN_EMAIL / ADMIN_PASSWORD aus .env)
 *   npm run seed:demo   → zusätzlich Demo-Nutzer und Demo-Anzeigen (nur für Entwicklung/Test!)
 */
import "dotenv/config";
import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import sharp from "sharp";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { getCategory } from "../src/lib/categories";
import { DEMO_LISTINGS } from "./demo-data";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || "./storage/uploads");

async function ensureAdmin() {
  const email = process.env.ADMIN_EMAIL?.toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error("ADMIN_EMAIL und ADMIN_PASSWORD müssen in .env gesetzt sein.");
  if (password.length < 10) throw new Error("ADMIN_PASSWORD muss mindestens 10 Zeichen haben.");
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    await db.user.update({ where: { id: existing.id }, data: { role: "ADMIN" } });
    console.log(`Admin existiert bereits: ${email}`);
    return existing;
  }
  const admin = await db.user.create({
    data: { email, name: "Administrator", passwordHash: await bcrypt.hash(password, 12), role: "ADMIN", emailVerifiedAt: new Date() },
  });
  console.log(`Admin angelegt: ${email}`);
  return admin;
}

async function placeholderImage(ownerId: string, label: string, hue: number) {
  const esc = label.replace(/[&<>]/g, "");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hue},55%,55%)"/><stop offset="1" stop-color="hsl(${(hue + 40) % 360},60%,35%)"/></linearGradient></defs>
    <rect width="1200" height="900" fill="url(#g)"/>
    <text x="600" y="430" font-family="Arial, sans-serif" font-size="64" font-weight="bold" fill="#fff" text-anchor="middle">${esc}</text>
    <text x="600" y="520" font-family="Arial, sans-serif" font-size="34" fill="#ffffffcc" text-anchor="middle">Demo-Bild · dasdiesdas</text></svg>`;
  const buf = Buffer.from(svg);
  const id = randomBytes(16).toString("hex");
  const file = `${id.slice(0, 2)}/${id.slice(2, 4)}/${id}.webp`;
  const thumb = file.replace(/\.webp$/, "_t.webp");
  await mkdir(path.join(UPLOAD_DIR, path.dirname(file)), { recursive: true });
  const large = await sharp(buf).webp({ quality: 80 }).toBuffer({ resolveWithObject: true });
  await writeFile(path.join(UPLOAD_DIR, file), large.data);
  await writeFile(path.join(UPLOAD_DIR, thumb), await sharp(buf).resize(480, 360, { fit: "cover" }).webp({ quality: 75 }).toBuffer());
  return db.listingImage.create({ data: { ownerId, file, thumb, width: large.info.width, height: large.info.height } });
}

async function seedDemo() {
  const pw = await bcrypt.hash("Demo!Passwort2026", 12);
  const users = await Promise.all(
    [
      { email: "anna.demo@example.com", name: "Anna K.", accountType: "PRIVATE" as const },
      { email: "mehmet.demo@example.com", name: "Mehmet Y.", accountType: "PRIVATE" as const, phone: "030 1234567" },
      { email: "autohaus.demo@example.com", name: "Thomas B.", accountType: "COMMERCIAL" as const, companyName: "Demo Autohaus Spree GmbH", companyAddress: "Musterstraße 1, 10115 Berlin", imprint: "Geschäftsführer: Thomas B.\nHRB 000000 B, Amtsgericht Charlottenburg\n(Demo-Daten)" },
      { email: "immobilien.demo@example.com", name: "Sabine L.", accountType: "COMMERCIAL" as const, companyName: "Demo Immobilien Berlin e.K.", companyAddress: "Beispielweg 5, 10245 Berlin", imprint: "Inhaberin: Sabine L.\nErlaubnis nach § 34c GewO (Demo-Daten)" },
    ].map((u) =>
      db.user.upsert({ where: { email: u.email }, update: {}, create: { ...u, passwordHash: pw, emailVerifiedAt: new Date() } }),
    ),
  );

  const existing = await db.listing.count({ where: { userId: { in: users.map((u) => u.id) } } });
  if (existing > 0) {
    console.log(`Demo-Anzeigen existieren bereits (${existing}) – übersprungen.`);
    return;
  }

  let n = 0;
  for (const [i, d] of DEMO_LISTINGS.entries()) {
    const cat = getCategory(d.categoryId);
    if (!cat || !cat.isLeaf) throw new Error(`Ungültige Demo-Kategorie: ${d.categoryId}`);
    const owner = users[d.owner];
    const attributes = d.attributes ?? {};
    const attrIndex = Object.fromEntries(Object.entries(attributes).filter(([, v]) => typeof v === "string").map(([k, v]) => [k, String(v).toLowerCase()]));
    const loc = [d.postalCode, d.city, d.district, d.subdistrict].filter(Boolean).join(" ");
    const searchText = [d.title, d.description, Object.values(attributes).filter((v) => typeof v === "string" || Array.isArray(v)).flat().join(" "), cat.name, loc].join(" ").toLowerCase();
    const publishedAt = new Date(Date.now() - i * 3_600_000 * 5);
    const listing = await db.listing.create({
      data: {
        userId: owner.id,
        categoryId: cat.id,
        categoryPath: cat.pathIds,
        title: d.title,
        description: d.description,
        priceCents: d.price != null ? Math.round(d.price * 100) : null,
        priceType: d.priceType ?? (d.price != null ? "FIXED" : "ON_REQUEST"),
        offerType: d.offerType ?? "OFFER",
        attributes,
        attrIndex,
        searchText,
        state: d.state,
        city: d.city,
        district: d.district ?? null,
        subdistrict: d.subdistrict ?? null,
        postalCode: d.postalCode,
        showPhone: !!owner.phone,
        phone: owner.phone,
        status: "ACTIVE",
        publishedAt,
        expiresAt: new Date(publishedAt.getTime() + 60 * 86_400_000),
        views: Math.floor(Math.random() * 400),
        featured: !!d.featured,
      },
    });
    const imgCount = d.images ?? 2;
    for (let k = 0; k < imgCount; k++) {
      const img = await placeholderImage(owner.id, k === 0 ? cat.name : `${cat.name} ${k + 1}`, (i * 37 + k * 20) % 360);
      await db.listingImage.update({ where: { id: img.id }, data: { listingId: listing.id, position: k } });
    }
    n++;
  }
  console.log(`${n} Demo-Anzeigen angelegt. Demo-Login: anna.demo@example.com / Demo!Passwort2026`);
}

async function main() {
  await ensureAdmin();
  if (process.argv.includes("--demo")) await seedDemo();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
