import type { Metadata } from "next";
import Link from "next/link";
import { CategoryPicker } from "@/components/CategoryPicker";
import { ListingForm } from "@/components/ListingForm";
import { Notice } from "@/components/Notice";
import { ResendVerification } from "@/components/ResendVerification";
import { requireUser } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { getCategory } from "@/lib/categories";
import { categoryFormProps } from "@/lib/server/listing-form-data";
import { createListingAction } from "@/app/actions/listings";
import { MAX_IMAGES_PER_LISTING } from "@/lib/config";

export const metadata: Metadata = { title: "Anzeige aufgeben", robots: { index: false } };

export default async function NewListingPage(props: PageProps<"/anzeige-aufgeben">) {
  const sp = await props.searchParams;
  const katParam = typeof sp.kategorie === "string" ? sp.kategorie : "";
  const user = await requireUser(`/anzeige-aufgeben${katParam ? `?kategorie=${encodeURIComponent(katParam)}` : ""}`);
  const cat = getCategory(katParam);
  const dbUser = await db.user.findUnique({ where: { id: user.id }, select: { companyAddress: true, phone: true } });

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <h1 className="text-2xl font-bold">Anzeige aufgeben</h1>
      {!user.emailVerified && (
        <Notice kind="warning">
          Bitte bestätigen Sie Ihre E-Mail-Adresse, bevor Sie eine Anzeige veröffentlichen. <ResendVerification />
        </Notice>
      )}
      {user.accountType === "COMMERCIAL" && !dbUser?.companyAddress && (
        <Notice kind="warning">
          Als gewerblicher Anbieter benötigen Sie ein Impressum. <Link href="/konto/einstellungen" className="link">Jetzt in den Einstellungen hinterlegen</Link>
        </Notice>
      )}
      {cat?.isLeaf ? (
        <ListingForm
          action={createListingAction}
          {...categoryFormProps(cat.id)}
          initial={{ state: "Berlin", phone: dbUser?.phone ?? "" }}
          images={[]}
          maxImages={MAX_IMAGES_PER_LISTING}
          changeCategoryHref={`/anzeige-aufgeben?kategorie=${encodeURIComponent(cat.parentId ?? "")}`}
        />
      ) : (
        <>
          <p className="text-ink-2">Schritt 1: Wählen Sie die passende Kategorie für Ihre Anzeige.</p>
          <CategoryPicker selected={cat} hrefBase="/anzeige-aufgeben?kategorie=" />
        </>
      )}
    </div>
  );
}
