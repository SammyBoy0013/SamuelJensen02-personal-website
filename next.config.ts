import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const isDev = process.env.NODE_ENV !== "production";
// The Vercel toolbar on preview deployments loads from vercel.live.
const isPreview = process.env.VERCEL_ENV === "preview";
const vercelLive = isPreview ? " https://vercel.live" : "";
const blob = " https://*.public.blob.vercel-storage.com";

// Static pages cannot carry a per-request nonce, so inline scripts are allowed;
// everything else is limited to this site (plus Vercel Blob for media).
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}${vercelLive}`,
  `style-src 'self' 'unsafe-inline'${vercelLive}`,
  `img-src 'self' data: blob:${blob}${vercelLive}`,
  `media-src 'self' blob:${blob}`,
  `font-src 'self'${vercelLive}`,
  `connect-src 'self'${isDev ? " ws:" : ""}${vercelLive}`,
  `frame-src 'self'${vercelLive}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://github.com",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  // Cache Components is off: next-intl reads the locale per request, which it
  // cannot prerender. Pages are still static via generateStaticParams and are
  // revalidated on demand with revalidatePath (phase 3).
  cacheComponents: false,
  experimental: {
    // Photo uploads: the browser re-encodes them first (stripping EXIF), so
    // they arrive well under Vercel's 4.5 MB request limit.
    serverActions: { bodySizeLimit: "4mb" },
  },
  // The CV PDF reads its fonts from disk at run time.
  serverExternalPackages: ["@react-pdf/renderer"],
  outputFileTracingIncludes: { "/api/cv-pdf": ["./lib/pdf/fonts/**"] },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default createNextIntlPlugin("./i18n/request.ts")(nextConfig);
