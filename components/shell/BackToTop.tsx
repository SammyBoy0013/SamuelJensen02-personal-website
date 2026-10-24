"use client";

import { useReducedMotion } from "motion/react";

export function BackToTop({ label }: { label: string }) {
  const reduce = useReducedMotion();
  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" })}
      className="flex size-[52px] shrink-0 cursor-pointer items-center justify-center rounded-full bg-pink text-white transition-transform duration-200 hover:-translate-y-0.5"
    >
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" />
      </svg>
    </button>
  );
}
