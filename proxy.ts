import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intl = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  // `/` always goes to English unless the visitor has picked a language before.
  if (
    request.nextUrl.pathname === "/" &&
    !request.cookies.has("NEXT_LOCALE")
  ) {
    return NextResponse.redirect(new URL(`/${routing.defaultLocale}`, request.url));
  }
  return intl(request);
}

export const config = {
  // Everything except API routes, Next.js internals and files with an extension.
  matcher: "/((?!api|_next|_vercel|.*\..*).*)",
};
