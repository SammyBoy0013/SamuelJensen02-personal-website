"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  /** Delay in seconds, for staggering. */
  delay?: number;
  as?: "div" | "section" | "li";
} & React.HTMLAttributes<HTMLElement>;

/**
 * Fades its content up once, the first time it scrolls into view
 * (specification 5.2). The hidden state only applies once JavaScript has run
 * (`html.js`), so the server HTML is always readable. Reduced motion: no fade.
 */
export function Reveal({ children, className = "", delay, as: Tag = "div", style, ...rest }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
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
  }, []);

  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      className={`reveal ${className}`}
      style={delay ? { ...style, transitionDelay: `${delay}s` } : style}
      {...rest}
    >
      {children}
    </Tag>
  );
}
