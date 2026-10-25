"use client";

import { useEffect, useState, type ReactNode } from "react";

// The first page of a visit renders without animation (no hidden server HTML);
// every page reached by navigation slides and fades in (specification 5.2).
// The animation is CSS (.page-enter in globals.css), which reduced motion turns off.
let hasMounted = false;

export function PageTransition({ children }: { children: ReactNode }) {
  const [animate] = useState(() => hasMounted);

  useEffect(() => {
    hasMounted = true;
  }, []);

  return <div className={animate ? "page-enter" : undefined}>{children}</div>;
}
