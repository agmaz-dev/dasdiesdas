import { readFile } from "node:fs/promises";
import { isSafeMediaName, mediaPath } from "@/lib/server/images";

export async function GET(_req: Request, ctx: RouteContext<"/media/[...path]">) {
  const { path } = await ctx.params;
  const name = path.join("/");
  if (!isSafeMediaName(name)) return new Response("Nicht gefunden", { status: 404 });
  try {
    const data = await readFile(mediaPath(name));
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Nicht gefunden", { status: 404 });
  }
}
