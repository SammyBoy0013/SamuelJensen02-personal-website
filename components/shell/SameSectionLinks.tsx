"use client";

import { useEffect } from "react";

/**
 * A link to the section you are already on (same page, same #section) does
 * nothing by default, because the address does not change. This sends you
 * back to the top of that section instead. Links to another section or page
 * are left to the normal navigation.
 */
export function SameSectionLinks() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest?.("a[href]");
      if (!(link instanceof HTMLAnchorElement) || (link.target && link.target !== "_self")) return;

      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname !== window.location.pathname) return;
      if (!url.hash || url.hash !== window.location.hash) return;

      const section = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!section) return;

      // Stops the router treating it as a navigation; the link's own onClick
      // (closing the drawer, for example) still runs.
      event.preventDefault();
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      section.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    };

    // Capture phase, so this runs before the router's own click handling.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
  return null;
}
