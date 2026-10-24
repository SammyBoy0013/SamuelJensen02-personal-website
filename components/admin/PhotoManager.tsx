"use client";

/* eslint-disable @next/next/no-img-element -- admin thumbnails of Blob photos and local previews */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ActionResult } from "@/lib/admin/actions";
import { deletePhoto, reorderPhotos, updatePhoto, uploadPhoto, type PhotoKind } from "@/lib/admin/photo-actions";
import { photoSchema, type PhotoForm } from "@/lib/admin/validation";
import { attempt, FieldShell, Status, Toggle } from "./fields";

export type AdminPhoto = PhotoForm & { id: number; blobUrl: string; width: number; height: number; dominantColour: string };

const MAX_ORIGINAL = 15 * 1024 * 1024;
const LONG_EDGE = 2400;

/**
 * Re-encodes a photo in the browser before upload. Drawing it onto a canvas
 * keeps only the pixels, so EXIF data (including any GPS position) never
 * leaves the device. It also keeps uploads small.
 */
async function reencode(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, LONG_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not read the photo."))), "image/jpeg", 0.88),
  );
}

const categoryLabels: Record<string, string> = { rowing: "Rowing", golf: "Golf", life: "Life", project: "Project" };

function toFormData(values: PhotoForm, file?: Blob) {
  const form = new FormData();
  for (const [key, value] of Object.entries(values)) form.set(key, String(value));
  if (file) form.set("file", file, "photo.jpg");
  return form;
}

function zodErrors(values: PhotoForm) {
  const parsed = photoSchema.safeParse(values);
  if (parsed.success) return null;
  const errors: Record<string, string> = {};
  for (const issue of parsed.error.issues) errors[String(issue.path[0])] ??= issue.message;
  return errors;
}

export function PhotoManager({ kind, photos }: { kind: PhotoKind; photos: AdminPhoto[] }) {
  const router = useRouter();
  const [items, setItems] = useState(photos);
  const [prev, setPrev] = useState(photos);
  const [editing, setEditing] = useState<number | null>(null);
  const [status, setStatus] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  if (photos !== prev) {
    setPrev(photos);
    setItems(photos);
  }

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [photo] = next.splice(from, 1);
    next.splice(to, 0, photo);
    setItems(next);
    startTransition(async () => {
      setStatus(await attempt(() => reorderPhotos(kind, next.map((p) => p.id))));
      router.refresh();
    });
  };

  const remove = (photo: AdminPhoto) => {
    if (!window.confirm(`Delete "${photo.altEn}"? The file is removed from Blob too.`)) return;
    startTransition(async () => {
      setStatus(await attempt(() => deletePhoto(kind, photo.id)));
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-10">
      <Uploader kind={kind} onDone={() => router.refresh()} />

      <section aria-labelledby="photos-title" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="photos-title" className="font-serif text-[28px] font-semibold text-ink">
            Uploaded photos ({items.length})
          </h2>
          <Status result={status} />
        </div>
        {items.length === 0 && <p className="text-grey-2">No photos uploaded yet.</p>}
        <ul className="flex flex-col gap-3">
          {items.map((photo, index) => (
            <li key={photo.id} className="rounded border border-line bg-white p-4">
              <div className="flex flex-wrap items-center gap-4">
                <img
                  src={photo.blobUrl}
                  alt=""
                  width={96}
                  height={Math.round((96 * photo.height) / photo.width)}
                  className="h-auto w-24 rounded-sm object-cover"
                  style={{ backgroundColor: photo.dominantColour }}
                />
                <div className="flex min-w-[200px] flex-1 flex-col gap-1 text-[14px]">
                  <p className="text-ink">{photo.altEn}</p>
                  <p className="text-grey-2">
                    {categoryLabels[photo.category]} · {photo.credit ? `Photo: ${photo.credit}` : "No credit"} ·{" "}
                    {photo.visible ? "Visible" : "Hidden"}
                    {kind === "project" && (photo.approved ? " · Approved" : " · Not approved (hidden)")}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="button-quiet"
                    onClick={() => move(index, index - 1)}
                    disabled={pending || index === 0}
                    aria-label={`Move "${photo.altEn}" earlier`}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="button-quiet"
                    onClick={() => move(index, index + 1)}
                    disabled={pending || index === items.length - 1}
                    aria-label={`Move "${photo.altEn}" later`}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="button-quiet"
                    onClick={() => setEditing(editing === photo.id ? null : photo.id)}
                    aria-expanded={editing === photo.id}
                  >
                    {editing === photo.id ? "Close" : "Edit"}
                  </button>
                  <button type="button" className="button-quiet" onClick={() => remove(photo)} disabled={pending}>
                    Delete
                  </button>
                </div>
              </div>
              {editing === photo.id && (
                <PhotoFields
                  kind={kind}
                  idPrefix={`photo-${photo.id}`}
                  initial={photo}
                  submitLabel="Save"
                  onSubmit={async (values) => {
                    const result = await attempt(() => updatePhoto(kind, photo.id, toFormData(values)));
                    if (result.ok) {
                      setEditing(null);
                      setStatus(result);
                      router.refresh();
                    }
                    return result;
                  }}
                />
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Uploader({ kind, onDone }: { kind: PhotoKind; onDone: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);

  const pick = (picked: File | null) => {
    setFileError(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setFile(null);
    if (!picked) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(picked.type)) {
      setFileError("Use a JPEG, PNG or WebP photo.");
      return;
    }
    if (picked.size > MAX_ORIGINAL) {
      setFileError("The photo is over 15 MB.");
      return;
    }
    setFile(picked);
    setPreview(URL.createObjectURL(picked));
  };

  return (
    <section aria-labelledby="upload-title" className="flex flex-col gap-4 rounded border border-line bg-white p-5 nav:p-6">
      <h2 id="upload-title" className="font-serif text-[28px] font-semibold text-ink">
        Upload a photo
      </h2>
      <p className="text-[14px] text-grey-2">
        JPEG, PNG or WebP, up to 15 MB. Your browser resizes it to at most {LONG_EDGE} px and removes all metadata,
        including the location, before it is uploaded.
      </p>
      <FieldShell id="upload-file" label="Photo *" error={fileError ?? undefined}>
        <input
          key={resetKey}
          id="upload-file"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => pick(e.target.files?.[0] ?? null)}
          className="text-[14px]"
        />
      </FieldShell>
      {preview && <img src={preview} alt="" className="max-h-56 w-auto self-start rounded" />}
      <PhotoFields
        key={resetKey}
        kind={kind}
        idPrefix="upload"
        initial={{
          altEn: "",
          altDa: "",
          altFr: "",
          credit: "",
          category: kind === "project" ? "project" : "rowing",
          visible: true,
          approved: false,
        }}
        submitLabel="Upload"
        onSubmit={async (values) => {
          if (!file) {
            setFileError("Choose a photo first.");
            return { ok: false, message: "Choose a photo first." };
          }
          let processed: Blob;
          try {
            processed = await reencode(file);
          } catch {
            return { ok: false, message: "This photo could not be read. Try exporting it as a JPEG." };
          }
          const result = await attempt(() => uploadPhoto(kind, toFormData(values, processed)));
          if (result.ok) {
            pick(null);
            setResetKey((k) => k + 1);
            onDone();
          }
          return result;
        }}
      />
    </section>
  );
}

function PhotoFields({
  kind,
  idPrefix,
  initial,
  submitLabel,
  onSubmit,
}: {
  kind: PhotoKind;
  idPrefix: string;
  initial: PhotoForm;
  submitLabel: string;
  onSubmit: (values: PhotoForm) => Promise<ActionResult>;
}) {
  const [values, setValues] = useState<PhotoForm>({
    altEn: initial.altEn,
    altDa: initial.altDa ?? "",
    altFr: initial.altFr ?? "",
    credit: initial.credit ?? "",
    category: initial.category,
    visible: initial.visible,
    approved: initial.approved ?? false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();
  const set = <K extends keyof PhotoForm>(key: K, value: PhotoForm[K]) => setValues((v) => ({ ...v, [key]: value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const invalid = zodErrors(values);
    if (invalid) {
      setErrors(invalid);
      setStatus({ ok: false, message: "Please fix the highlighted fields." });
      return;
    }
    setErrors({});
    setStatus(null);
    startTransition(async () => {
      const result = await onSubmit(values);
      setStatus(result);
      if (!result.ok) setErrors(result.errors ?? {});
    });
  };

  const input = (key: "altEn" | "altDa" | "altFr" | "credit", label: string, help?: string) => (
    <FieldShell id={`${idPrefix}-${key}`} label={label} help={help} error={errors[key]}>
      <input
        id={`${idPrefix}-${key}`}
        value={values[key] as string}
        onChange={(e) => set(key, e.target.value)}
        aria-invalid={Boolean(errors[key])}
        lang={key === "altDa" ? "da" : key === "altFr" ? "fr" : undefined}
        className="field"
      />
    </FieldShell>
  );

  return (
    <form onSubmit={submit} noValidate className="mt-2 flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 nav:grid-cols-3">
        {input("altEn", "Alt text (EN) *", "Describe the photo for someone who cannot see it.")}
        {input("altDa", "Alt text (DA)", "Empty: the English is used.")}
        {input("altFr", "Alt text (FR)", "Empty: the English is used.")}
        {input("credit", "Photographer credit", "Empty shows “Credit to follow”.")}
        {kind === "gallery" && (
          <FieldShell id={`${idPrefix}-category`} label="Category *" error={errors.category}>
            <select
              id={`${idPrefix}-category`}
              value={values.category}
              onChange={(e) => set("category", e.target.value as PhotoForm["category"])}
              className="field"
            >
              {["rowing", "golf", "life"].map((c) => (
                <option key={c} value={c}>
                  {categoryLabels[c]}
                </option>
              ))}
            </select>
          </FieldShell>
        )}
      </div>
      <div className="flex flex-wrap gap-x-8 gap-y-3">
        <Toggle label="Visible on the site" checked={values.visible} onChange={(v) => set("visible", v)} />
        {kind === "project" && (
          <Toggle
            label="Approved under the NDA"
            checked={Boolean(values.approved)}
            onChange={(v) => set("approved", v)}
            help="Only approved photos appear on the Engineering page."
          />
        )}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className="button" disabled={pending}>
          {pending ? "Working…" : submitLabel}
        </button>
        <Status result={status} />
      </div>
    </form>
  );
}
