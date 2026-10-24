import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/en/admin", "/da/admin", "/fr/admin"] },
    host: getSiteUrl().origin,
  };
}
