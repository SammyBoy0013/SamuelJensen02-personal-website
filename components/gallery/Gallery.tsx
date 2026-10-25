"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import { useTranslations } from "next-intl";
import type { Category } from "@/content/media";

/**
 * A photo in the grid: either a file in public/media (static import, with a
 * blurred preview) or an upload from Vercel Blob (with its dominant colour).
 */
export type GalleryPhoto = {
  id: string;
  src: StaticImageData | string;
  width?: number;
  height?: number;
  dominantColour?: string;
  alt: string;
  category: Category;
  credit: string | null;
};

type Photo = GalleryPhoto;

/**
 * Image props for either kind of photo. In the grid, a Blob photo shows its
 * dominant colour until it loads (images below the fold load lazily).
 */
function imageProps(photo: Photo, placeholder = true) {
  if (typeof photo.src !== "string") return { src: photo.src, placeholder: placeholder ? ("blur" as const) : undefined };
  return { src: photo.src, style: placeholder ? { backgroundColor: photo.dominantColour } : undefined };
}

const categories: Category[] = ["rowing", "golf", "life"];
type Filter = Category | "all";

function filterFromHash(): Filter {
  const hash = window.location.hash.slice(1);
  return (categories as string[]).includes(hash) ? (hash as Category) : "all";
}

/**
 * Filterable photo grid with a lightbox (specification 5.8). The filters are
 * also the page's sections, so `/gallery#golf` opens with Golf selected.
 */
export function Gallery({ photos }: { photos: Photo[] }) {
  const t = useTranslations("gallery");
  const tSections = useTranslations("pages.gallery.sections");
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    const sync = () => setFilter(filterFromHash());
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const pick = (f: Filter) => {
    setFilter(f);
    history.replaceState(null, "", f === "all" ? window.location.pathname : `#${f}`);
  };

  const shown = filter === "all" ? photos : photos.filter((p) => p.category === filter);

  return (
    <>
      <div role="group" aria-label={t("filter")} className="flex flex-wrap gap-2">
        {(["all", ...categories] as Filter[]).map((f) => (
          <button
            key={f}
            id={f === "all" ? undefined : f}
            type="button"
            aria-pressed={filter === f}
            onClick={() => pick(f)}
            className={`nav-label cursor-pointer rounded-full border px-4 py-2 transition-colors ${
              filter === f
                ? "border-pink-deep bg-pink-deep text-white"
                : "border-line bg-white text-ink hover:border-pink hover:text-pink-text"
            }`}
          >
            {f === "all" ? t("all") : tSections(f)}
          </button>
        ))}
      </div>

      <ul className="columns-1 gap-4 nav:columns-3">
        {shown.map((photo, i) => (
          <li key={photo.id} className="mb-4 break-inside-avoid">
            <button
              type="button"
              onClick={() => setOpen(i)}
              aria-label={t("open", { alt: photo.alt })}
              className="group block w-full cursor-zoom-in overflow-hidden rounded bg-ink"
            >
              <Image
                {...imageProps(photo)}
                width={photo.width}
                height={photo.height}
                alt={photo.alt}
                sizes="(min-width: 1360px) 400px, (min-width: 900px) 30vw, 100vw"
                className="block h-auto w-full transition-[transform,opacity] duration-500 group-hover:scale-[1.03] group-hover:opacity-90"
              />
            </button>
          </li>
        ))}
      </ul>

      {open !== null && shown[open] && (
        <Lightbox photos={shown} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />
      )}
    </>
  );
}

function Lightbox({
  photos,
  index,
  onIndex,
  onClose,
}: {
  photos: Photo[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const t = useTranslations("gallery");
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const photo = photos[index];
  const step = useCallback(
    (delta: number) => onIndex((index + delta + photos.length) % photos.length),
    [index, onIndex, photos.length],
  );

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const root = document.documentElement;
    root.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      root.style.overflow = "";
      previous?.focus();
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "Tab" && dialogRef.current) {
        // Keep focus inside the viewer.
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>("button");
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, step]);

  const round =
    "flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-grey-4 text-paper transition-colors hover:border-pink";

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={t("viewer")}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="fixed inset-0 z-[90] flex flex-col items-center justify-center gap-4 bg-ink/95 p-4 nav:p-8"
    >
      <button ref={closeRef} type="button" onClick={onClose} aria-label={t("close")} className={`${round} absolute top-4 right-4`}>
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="6" y1="6" x2="18" y2="18" />
          <line x1="18" y1="6" x2="6" y2="18" />
        </svg>
      </button>

      <figure className="flex max-h-full min-h-0 w-full flex-col items-center gap-3">
        <div className="relative min-h-0 w-full flex-1" style={{ height: "min(78svh, 1000px)" }}>
          <Image
            key={photo.id}
            {...imageProps(photo, false)}
            alt={photo.alt}
            fill
            sizes="100vw"
            className="object-contain"
          />
        </div>
        <figcaption className="flex max-w-[720px] flex-col items-center gap-1 text-center text-[14px] text-grey-3">
          <span className="text-paper">{photo.alt}</span>
          <span>{photo.credit ? t("credit", { credit: photo.credit }) : t("creditToFollow")}</span>
        </figcaption>
      </figure>

      <div className="flex items-center gap-5">
        <button type="button" onClick={() => step(-1)} aria-label={t("previous")} className={round}>
          <span aria-hidden>←</span>
        </button>
        <span aria-live="polite" className="nav-label text-grey-3">
          {t("count", { index: index + 1, total: photos.length })}
        </span>
        <button type="button" onClick={() => step(1)} aria-label={t("next")} className={round}>
          <span aria-hidden>→</span>
        </button>
      </div>
    </div>
  );
}
