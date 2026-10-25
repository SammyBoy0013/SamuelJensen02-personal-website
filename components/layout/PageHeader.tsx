import Image from "next/image";
import type { Photo } from "@/content/media";

type Props = {
  eyebrow?: string;
  title: string;
  /** Language of the title when it is not the page language (the Latin motto). */
  titleLang?: string;
  /** Full-bleed photo header. Without one the header is plain paper. */
  photo?: Photo;
  /** CSS object-position for the photo. */
  focus?: string;
  /** Ink header with the pink grid pattern (Engineering, until photos are approved). */
  grid?: boolean;
  /**
   * Wide screens (1200 px and up): show the whole photo uncropped on the right,
   * below the ribbon, with the title on ink to the left. Narrower screens keep
   * the full-bleed crop.
   */
  whole?: boolean;
};

/** Page header: eyebrow plus the h1, on a photo, the pink grid or plain paper. */
export function PageHeader({ eyebrow, title, titleLang, photo, focus = "50% 40%", grid, whole }: Props) {
  const titleBlock = (dark: boolean) => (
    <div className="flex flex-col gap-3">
      {eyebrow && <p className={`eyebrow ${dark ? "text-pink-soft" : ""}`}>{eyebrow}</p>}
      <h1 lang={titleLang} className={`page-title max-w-[16ch] text-balance ${dark ? "text-white" : ""}`}>{title}</h1>
    </div>
  );

  if (photo || grid) {
    return (
      <header
        className={`relative flex h-[72svh] min-h-[460px] items-end overflow-hidden bg-ink ${grid ? "pink-grid" : ""}`}
      >
        {photo && (
          <>
            <Image
              src={photo.src}
              alt={photo.alt}
              fill={!whole}
              // The header photo is the largest thing on the page: fetch it first.
              loading="eager"
              fetchPriority="high"
              placeholder="blur"
              sizes="100vw"
              className={
                whole
                  ? "absolute inset-0 h-full w-full object-cover min-[1200px]:top-[60px] min-[1200px]:left-auto min-[1200px]:h-[calc(100%-60px)] min-[1200px]:w-auto min-[1200px]:max-w-none"
                  : "object-cover"
              }
              style={{ objectPosition: focus }}
            />
            <div
              aria-hidden
              className={`absolute inset-0 bg-[linear-gradient(0deg,rgba(22,19,26,0.75)_0%,rgba(22,19,26,0.15)_55%,rgba(22,19,26,0.3)_100%)] ${
                whole ? "min-[1200px]:hidden" : ""
              }`}
            />
            {whole && (
              <div
                aria-hidden
                className="absolute inset-y-0 left-0 hidden bg-[linear-gradient(90deg,var(--ink)_calc(100%-120px),rgba(22,19,26,0))] min-[1200px]:block"
                // The photo is 3:2 and sits below the 60 px ribbon, so ink fills the rest, fading over its first 120 px.
                style={{ width: "calc(100% - (max(72svh, 460px) - 60px) * 1.5 + 120px)" }}
              />
            )}
          </>
        )}
        <div className="wrap relative pb-12">{titleBlock(true)}</div>
      </header>
    );
  }

  return (
    <header className="wrap pt-36 pb-12 nav:pt-44">
      {titleBlock(false)}
      <div aria-hidden className="mt-8 h-0.5 w-10 bg-pink" />
    </header>
  );
}
