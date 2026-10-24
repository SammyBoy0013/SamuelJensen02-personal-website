"use client";

import { useLayoutEffect } from "react";

/**
 * Turns on scroll snap for the Home slides while the Home page is shown.
 *
 * The snap must be off before the next page paints. Otherwise the browser
 * keeps snapping on the new page, where the footer is the only snap point,
 * and the visitor lands at the bottom instead of the top.
 */
export function HomeSnap() {
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.add("home-snap");
    return () => {
      root.classList.remove("home-snap");
      // Leaving Home for a page without a #section: start at the top.
      if (!window.location.hash) window.scrollTo({ top: 0, behavior: "instant" });
    };
  }, []);
  return null;
}
