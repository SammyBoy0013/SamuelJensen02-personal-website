"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  /** Delay in seconds, for staggering. */
  delay?: number;
  as?: "div" | "section" | "li";
  /**
   * For content already on screen when the page opens (the Home hero): it
   * fades up straight away with CSS, without waiting for JavaScript, so the
   * first paint is not held back.
   */
  onLoad?: boolean;
} & Omit<React.HTMLAttributes<HTMLElement>, "onLoad">;

/**
 * Fades its content up once, the first time it scrolls into view
 * (specification 5.2). The hidden state only applies once JavaScript has run
 * (`html.js`), so the server HTML is always readable. Reduced motion: no fade.
 */
export function Reveal({ children, className = "", delay, as: Tag = "div", style, onLoad, ...rest }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || onLoad) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          el.classList.add("is-in");
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [onLoad]);

  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      className={`${onLoad ? "rise" : "reveal"} ${className}`}
      style={delay ? { ...style, transitionDelay: `${delay}s` } : style}
      {...rest}
    >
      {children}
    </Tag>
  );
}
