import "server-only";
import path from "node:path";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import sharp, { type Metadata } from "sharp";
import { db } from "./db";

export const UPLOAD_DIR = path.resolve(/*turbopackIgnore: true*/ process.env.UPLOAD_DIR || "./storage/uploads");

const ALLOWED = new Set(["jpeg", "png", "webp", "gif", "avif", "heif", "tiff"]);

/** Ordnerstruktur ab/cd/… verhindert zu viele Dateien in einem Verzeichnis */
function newName(suffix: string) {
  const id = randomBytes(16).toString("hex");
  return `${id.slice(0, 2)}/${id.slice(2, 4)}/${id}${suffix}.webp`;
}

export function isSafeMediaName(name: string) {
  return /^[a-f0-9]{2}\/[a-f0-9]{2}\/[a-f0-9]{32}(_t)?\.webp$/.test(name);
}

export function mediaPath(name: string) {
  return path.join(/*turbopackIgnore: true*/ UPLOAD_DIR, name);
}

/**
 * Verarbeitet ein hochgeladenes Bild: prüft das Format anhand des Inhalts,
 * dreht nach EXIF, entfernt Metadaten (inkl. GPS) und erzeugt Groß- und Vorschaubild.
 */
export async function processUpload(buffer: Buffer, ownerId: string) {
  let meta: Metadata;
  try {
    meta = await sharp(buffer, { limitInputPixels: 80_000_000 }).metadata();
  } catch {
    throw new Error("Die Datei ist kein gültiges Bild.");
  }
  if (!meta.format || !ALLOWED.has(meta.format)) throw new Error("Nicht unterstütztes Bildformat. Erlaubt: JPG, PNG, WebP, GIF, AVIF.");

  const base = sharp(buffer, { limitInputPixels: 80_000_000, animated: false }).rotate();
  const large = await base.clone().resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toBuffer({ resolveWithObject: true });
  const thumb = await base.clone().resize({ width: 480, height: 360, fit: "cover", position: "attention" }).webp({ quality: 75 }).toBuffer();

  const file = newName("");
  const thumbName = file.replace(/\.webp$/, "_t.webp");
  await mkdir(path.dirname(mediaPath(file)), { recursive: true });
  await writeFile(mediaPath(file), large.data);
  await writeFile(mediaPath(thumbName), thumb);

  return db.listingImage.create({
    data: { ownerId, file, thumb: thumbName, width: large.info.width, height: large.info.height },
    select: { id: true, thumb: true, file: true },
  });
}

export async function deleteImageFiles(images: { file: string; thumb: string }[]) {
  await Promise.all(images.flatMap((i) => [unlink(mediaPath(i.file)).catch(() => {}), unlink(mediaPath(i.thumb)).catch(() => {})]));
}

/** Entfernt hochgeladene, aber nie einer Anzeige zugeordnete Bilder (älter als 24 h) */
export async function cleanupOrphanImages() {
  const old = await db.listingImage.findMany({
    where: { listingId: null, createdAt: { lt: new Date(Date.now() - 86_400_000) } },
    select: { id: true, file: true, thumb: true },
    take: 500,
  });
  if (!old.length) return 0;
  await db.listingImage.deleteMany({ where: { id: { in: old.map((o) => o.id) } } });
  await deleteImageFiles(old);
  return old.length;
}


