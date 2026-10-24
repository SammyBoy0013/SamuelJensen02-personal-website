# Phase 1: Foundation

Read `CLAUDE.md` and all of `docs/` first. Then build the foundation of the site on a branch called `phase-1-foundation`.

1. Create the Next.js app (latest stable, App Router, TypeScript strict, Tailwind, ESLint) in the repository root. Keep `docs/`, `design-reference/` and `public/` as they are.
2. Add `npm` scripts: `dev`, `build`, `lint`, `typecheck`.
3. Set up the design tokens from `docs/02-design-system.md` as CSS variables, and load Bodoni Moda and Archivo with `next/font/google`.
4. Set up `next-intl` with `en`, `da` and `fr`, prefix routing and `/` redirecting to `/en`. Until phase 6, `da` and `fr` fall back to English with a small notice.
5. Build the site shell:
   - The ribbon, hover dropdowns, pink circle menu button and drawer, behaving **exactly** as in specification section 5.1, including the home-hero state and phone behaviour.
   - The footer from specification 5.11: seal, social icons in order, privacy link, language links, back-to-top button.
   - The 0.5 s page transition and reduced-motion handling.
   - The first-visit loading animation (the seal ring drawing itself) and the "Wrong lane" 404 page.
6. Add the favicon set (SVG plus PNG fallbacks generated from `public/brand/favicon.svg`), the share image as the default Open Graph image, `robots.txt` (disallow `/admin`) and security headers.
7. Create empty routes for every page in the site map, each with its title and a placeholder, so navigation works end to end.
8. Connect the project to Vercel (if not already) and confirm that a preview deployment builds.

Finish with the phase report, and open a pull request into `main`.
