"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Gentle parallax for a slide photo: the photo drifts a little slower than the
 * page (from -7 % to 7 % of its height as the slide passes). It fills its
 * positioned parent; reduced motion keeps it still.
 */
export function Parallax({ children }: { children: ReactNode }) {
  const frame = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = frame.current;
    const photo = layer.current;
    if (!box || !photo || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let queued = 0;
    const update = () => {
      queued = 0;
      const rect = box.getBoundingClientRect();
      // 0 as the slide enters at the bottom, 1 as it leaves at the top.
      const progress = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / (window.innerHeight + rect.height)));
      photo.style.transform = `translate3d(0, ${(progress * 14 - 7).toFixed(2)}%, 0)`;
    };
    const onScroll = () => {
      if (!queued) queued = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(queued);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div ref={frame} className="absolute inset-0 overflow-hidden">
      <div ref={layer} className="absolute -inset-y-[8%] inset-x-0 will-change-transform">
        {children}
      </div>
    </div>
  );
}
