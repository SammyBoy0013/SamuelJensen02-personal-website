import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { asc } from "drizzle-orm";
import { AdminTitle } from "@/components/admin/AdminTitle";
import { PhotoManager, type AdminPhoto } from "@/components/admin/PhotoManager";
import { db, schema } from "@/db";

const kinds = {
  gallery: {
    table: schema.galleryItems,
    eyebrow: "Gallery",
    title: "Gallery photos",
    intro: "Uploaded photos appear at the top of the gallery, in this order, with their credit in the viewer.",
  },
  project: {
    table: schema.projectPhotos,
    eyebrow: "Engineering",
    title: "Bachelor project photos",
    intro:
      "The project is under an NDA: a photo appears on the Engineering page only once it is marked approved. Until then the pink grid stands in.",
  },
} as const;

export async function generateMetadata({ params }: PageProps<"/[locale]/admin/photos/[kind]">): Promise<Metadata> {
  const { kind } = await params;
  return { title: kind in kinds ? kinds[kind as keyof typeof kinds].title : "Photos" };
}

export default async function Photos({ params }: PageProps<"/[locale]/admin/photos/[kind]">) {
  const { kind } = await params;
  if (!(kind in kinds)) notFound();
  const def = kinds[kind as keyof typeof kinds];
  const rows = await db.select().from(def.table).orderBy(asc(def.table.sortOrder), asc(def.table.id));
  const photos: AdminPhoto[] = rows.map((r) => ({
    id: r.id,
    blobUrl: r.blobUrl,
    width: r.width,
    height: r.height,
    dominantColour: r.dominantColour,
    altEn: r.altEn,
    altDa: r.altDa ?? "",
    altFr: r.altFr ?? "",
    credit: r.credit ?? "",
    category: r.category as AdminPhoto["category"],
    visible: r.visible,
    approved: "approved" in r ? (r.approved as boolean) : false,
  }));

  return (
    <>
      <AdminTitle eyebrow={def.eyebrow} title={def.title}>
        <p>{def.intro}</p>
      </AdminTitle>
      {!process.env.BLOB_READ_WRITE_TOKEN && (
        <p className="rounded border-[1.5px] border-dashed border-grey-3 px-5 py-4 text-[15px] text-grey-1">
          Vercel Blob is not connected yet, so uploads are switched off. See the phase 3 report for the steps.
        </p>
      )}
      <PhotoManager kind={kind as keyof typeof kinds} photos={photos} />
    </>
  );
}
