import { getCurrentUser } from "@/lib/server/auth";
import { processUpload, cleanupOrphanImages } from "@/lib/server/images";
import { rateLimit } from "@/lib/server/rate-limit";
import { MAX_IMAGE_BYTES } from "@/lib/config";
import { mediaUrl } from "@/lib/media";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Bitte melden Sie sich an." }, { status: 401 });
  if (!user.emailVerified) return Response.json({ error: "Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse." }, { status: 403 });
  if (!rateLimit(`upload:${user.id}`, 120, 60 * 60_000)) {
    return Response.json({ error: "Zu viele Uploads. Bitte später erneut versuchen." }, { status: 429 });
  }

  const len = Number(req.headers.get("content-length") || 0);
  if (len > MAX_IMAGE_BYTES + 100_000) return Response.json({ error: "Das Bild ist zu groß (max. 15 MB)." }, { status: 413 });

  let file: FormDataEntryValue | null;
  try {
    file = (await req.formData()).get("file");
  } catch {
    return Response.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }
  if (!(file instanceof File)) return Response.json({ error: "Keine Datei erhalten." }, { status: 400 });
  if (file.size > MAX_IMAGE_BYTES) return Response.json({ error: "Das Bild ist zu groß (max. 15 MB)." }, { status: 413 });

  try {
    const img = await processUpload(Buffer.from(await file.arrayBuffer()), user.id);
    if (Math.random() < 0.05) cleanupOrphanImages().catch(() => {});
    return Response.json({ id: img.id, thumbUrl: mediaUrl(img.thumb) });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "Upload fehlgeschlagen." }, { status: 400 });
  }
}
