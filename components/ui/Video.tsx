"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

type Props = {
  src: string;
  poster?: string;
  /** Describes the video for screen readers. */
  label: string;
  caption?: string;
  className?: string;
};

/**
 * Muted, looping, inline autoplay video (specification 5.3). It pauses when it
 * leaves the screen and has an unmute button. A pause button keeps it
 * accessible (WCAG 2.2.2); with reduced motion it starts paused.
 */
export function Video({ src, poster, label, caption, className = "" }: Props) {
  const t = useTranslations("video");
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  // Set when the visitor pauses, so scrolling back does not restart it.
  const userPaused = useRef(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) userPaused.current = true;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !userPaused.current) {
          video.play().catch(() => {});
        } else if (!entry.isIntersecting) {
          video.pause();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  const togglePlay = () => {
    const video = ref.current;
    if (!video) return;
    if (video.paused) {
      userPaused.current = false;
      video.play().catch(() => {});
    } else {
      userPaused.current = true;
      video.pause();
    }
  };

  const toggleMute = () => {
    const video = ref.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  const button =
    "flex size-10 cursor-pointer items-center justify-center rounded-full bg-ink/70 text-white transition-colors hover:bg-ink focus-visible:outline-white";

  return (
    <figure className={`relative overflow-hidden rounded bg-ink ${className}`}>
      <video
        ref={ref}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={label}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        className="block size-full object-cover"
      />
      {caption && (
        <figcaption className="pointer-events-none absolute bottom-4 left-4 text-[12px] tracking-[0.08em] text-white uppercase [text-shadow:0_1px_4px_rgba(22,19,26,0.6)]">
          {caption}
        </figcaption>
      )}
      <div className="absolute right-3 bottom-3 flex gap-2">
        <button type="button" onClick={togglePlay} aria-label={playing ? t("pause") : t("play")} className={button}>
          {playing ? (
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden fill="currentColor">
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden fill="currentColor">
              <path d="M7 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L8.5 4.64A1 1 0 0 0 7 5.5z" />
            </svg>
          )}
        </button>
        <button
          type="button"
          onClick={toggleMute}
          aria-label={muted ? t("unmute") : t("mute")}
          aria-pressed={!muted}
          className={button}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 5 6 9H3v6h3l5 4z" fill="currentColor" />
            {muted ? (
              <path d="m22 9-6 6M16 9l6 6" />
            ) : (
              <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
            )}
          </svg>
        </button>
      </div>
    </figure>
  );
}
