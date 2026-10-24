import type { Metadata } from "next";
import { SiteFooter } from "@/components/shell/SiteFooter";
import { SiteHeader } from "@/components/shell/SiteHeader";
import { WrongLane } from "@/components/shell/WrongLane";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Wrong lane", robots: { index: false } };

/**
 * Anyone but the admin sees exactly the site's "Wrong lane" page on every
 * /admin route, so nothing gives away that an admin area exists.
 */
export default async function AdminNotFound() {
  const settings = await getSettings();
  return (
    <>
      <SiteHeader features={settings.features} />
      <main id="main" tabIndex={-1} className="outline-none">
        <WrongLane />
      </main>
      <SiteFooter social={settings.social} />
    </>
  );
}
