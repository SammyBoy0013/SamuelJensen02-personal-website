# samueljensen.com

Personal website of Samuel Gustav Jensen. Built with Next.js, Neon Postgres and Vercel.

## How to build it with Claude Code

1. Copy everything in this pack into the root of your local clone of the repository and commit it to `main` ("Add hand-over pack").
2. Open a terminal in the repository folder and run `claude`.
3. Paste: *Read CLAUDE.md and the docs folder, then carry out docs/prompts/phase-1.md.*
4. When the phase report arrives, check the Vercel preview, answer its questions and merge the pull request.
5. Repeat with phase 2 to phase 6. Install the Neon plugin before phase 3.

## What's inside

| Path | Contents |
|---|---|
| `CLAUDE.md` | Standing rules for Claude Code |
| `docs/01-specification.md` | Pages, features, privacy rules, decisions |
| `docs/02-design-system.md` | Colours, fonts, components, image use |
| `docs/03-technical-setup.md` | Stack, environment variables, database schema |
| `docs/04-page-text-en.md` | Approved English text |
| `docs/prompts/` | One prompt per build phase |
| `public/brand/` | Seal, monogram and favicon (outlined SVG) |
| `public/media/` | Web-optimised photos and videos |
| `public/og/` | Share image |
| `design-reference/` | First-draft page layouts (open in a browser) |

## Local development

1. Install Node.js 20.9 or newer, then run `npm install`.
2. Copy `.env.example` to `.env.local` (phase 1 needs no values).
3. `npm run dev` and open http://localhost:3000.

| Task | Command |
|---|---|
| Lint and types | `npm run lint` and `npm run typecheck` |
| Production build | `npm run build`, then `npm run start` |
| Rebuild inline seal and monogram after changing `public/brand/*.svg` | `npm run brand` |
| Rebuild favicon PNGs and `favicon.ico` from `public/brand/favicon.svg` | `npm run icons` |
