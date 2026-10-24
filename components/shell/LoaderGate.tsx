"use client";

import { useLayoutEffect } from "react";

declare global {
  interface Window {
    __sjFirstVisit?: boolean;
  }
}

/**
 * Backstop for the inline loader script in the root layout. Pages that are
 * rendered in the browser (such as the 404) skip that script, so check the
 * session flag again once React has mounted.
 */
export function LoaderGate() {
  useLayoutEffect(() => {
    if (window.__sjFirstVisit) return;
    try {
      if (sessionStorage.getItem("sj-seen")) {
        document.documentElement.setAttribute("data-seen", "");
      } else {
        sessionStorage.setItem("sj-seen", "1");
      }
    } catch {
      document.documentElement.setAttribute("data-seen", "");
    }
  }, []);
  return null;
}
