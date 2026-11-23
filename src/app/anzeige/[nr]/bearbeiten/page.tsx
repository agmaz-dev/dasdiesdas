import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListingForm } from "@/components/ListingForm";
import { CategoryPicker } from "@/components/CategoryPicker";
import { Notice } from "@/components/Notice";
import { requireUser } from "@/lib/server/auth";
import { getListingByNumber } from "@/lib/server/listings";
import { getCategory } from "@/lib/categories";
import { categoryFormProps, listingToFormValues, listingImages } from "@/lib/server/listing-form-data";
import { updateListingAction } from "@/app/actions/listings";
import { MAX_IMAGES_PER_LISTING } from "@/lib/config";

export const metadata: Metadata = { title: "Anzeige bearbeiten", robots: { index: false } };

export default async function EditListingPage(props: PageProps<"/anzeige/[nr]/bearbeiten">) {
  const { nr } = await props.params;
  const sp = await props.searchParams;
  const user = await requireUser(`/anzeige/${nr}/bearbeiten`);
  const l = await getListingByNumber(nr);
  if (!l || l.userId !== user.id || l.status === "DELETED") notFound();

  const katParam = typeof sp.kategorie === "string" ? sp.kategorie : "";
  const picking = sp.kategorie !== undefined && !getCategory(katParam)?.isLeaf;
  const categoryId = getCategory(katParam)?.isLeaf ? katParam : l.categoryId;
  const base = `/anzeige/${l.number}/bearbeiten?kategorie=`;

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <h1 className="text-2xl font-bold">Anzeige bearbeiten <span className="text-base font-normal text-ink-3">Nr. {l.number}</span></h1>
      {l.status === "BLOCKED" && <Notice kind="error">Diese Anzeige wurde gesperrt und kann nicht bearbeitet werden.</Notice>}
      {picking ? (
        <CategoryPicker selected={getCategory(katParam)} hrefBase={base} />
      ) : (
        <ListingForm
          action={updateListingAction}
          {...categoryFormProps(categoryId)}
          initial={listingToFormValues(l, categoryId)}
          images={listingImages(l)}
          maxImages={MAX_IMAGES_PER_LISTING}
          listingId={l.id}
          changeCategoryHref={`${base}${encodeURIComponent(getCategory(categoryId)?.parentId ?? "")}`}
        />
      )}
    </div>
  );
}
