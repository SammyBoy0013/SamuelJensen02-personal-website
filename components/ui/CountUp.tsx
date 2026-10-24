"use client";

import { useLayoutEffect, useRef } from "react";

type Props = {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
};

const DURATION = 1200;

function format(n: number, decimals: number) {
  return n.toLocaleString("en-GB", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

/**
 * Counts up to `value` when it first scrolls into view. Only for summary
 * statistics on the sport pages (specification 5.2). The server renders the
 * final value; with reduced motion it stays there.
 */
export function CountUp({ value, decimals = 0, prefix = "", suffix = "" }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const text = (n: number) => `${prefix}${format(n, decimals)}${suffix}`;

  // Runs before the first paint, so the number never flashes at its final value.
  // The count writes straight to the DOM to avoid a re-render per frame.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const show = (n: number) => {
      el.textContent = `${prefix}${format(n, decimals)}${suffix}`;
    };
    show(0);

    let frame = 0;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      observer.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - start) / DURATION, 1);
        show(value * (1 - Math.pow(1 - p, 3)));
        if (p < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      show(value);
    };
  }, [value, decimals, prefix, suffix]);

  return (
    <span>
      {/* Screen readers get the final value straight away. */}
      <span className="sr-only">{text(value)}</span>
      <span ref={ref} aria-hidden className="tabular-nums">
        {text(value)}
      </span>
    </span>
  );
}
