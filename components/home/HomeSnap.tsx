"use client";

import { useEffect } from "react";

/** Turns on scroll snap for the Home slides while the Home page is shown. */
export function HomeSnap() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("home-snap");
    return () => root.classList.remove("home-snap");
  }, []);
  return null;
}
