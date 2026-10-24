# Technical setup

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js, latest stable, App Router, TypeScript (strict) |
| Styling | Tailwind CSS with the design tokens from `02-design-system.md` as CSS variables |
| Motion | Motion (formerly Framer Motion) for transitions; CSS for the rest |
| Languages | `next-intl`, locales `en` (default), `da`, `fr`, prefix routing |
| Database | Neon Postgres via `@neondatabase/serverless` and Drizzle ORM (migrations with drizzle-kit) |
| Login | Auth.js (NextAuth v5), GitHub provider, single allowed user |
| Files | Vercel Blob |
| CV PDF | `@react-pdf/renderer` with Archivo and Bodoni Moda embedded |
| Imports | `papaparse` (CSV), `fit-file-parser` (FIT), `fast-xml-parser` (GPX, TCX) |
| Validation | `zod` on every admin form and import |
| Hosting | Vercel Hobby, GitHub repo `SammyBoy0013/SamuelJensen02-personal-website` |
| Package manager | npm. Node.js 26 is installed locally |

## Accounts already set up

| Service | Status |
|---|---|
| GitHub | Repository exists and is connected to Vercel |
| Vercel | Hobby plan; GitHub account SammyBoy0013 linked |
| Neon | Project "Website", aws-eu-central-1 (Frankfurt), free plan. Neon Claude Code plugin: `claude plugin install neon@claude-plugins-official` before phase 3 |
| Domain | samueljensen.com was available on 24 October 2026; not yet bought |

## Environment variables

Store them in `.env.local` locally and in Vercel project settings. Commit only `.env.example` with empty values.

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Neon pooled connection string |
| `DATABASE_URL_UNPOOLED` | Neon direct connection string (migrations) |
| `AUTH_SECRET` | Auth.js secret (`npx auth secret`) |
| `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET` | GitHub OAuth app |
| `ADMIN_GITHUB_ID` | Samuel's numeric GitHub user ID; the only account allowed into `/admin` |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob store token |
| `NEXT_PUBLIC_SITE_URL` | `https://samueljensen.com` (or the Vercel URL before launch) |

## Folder structure

```
app/[locale]/(site)/...        public pages
app/[locale]/admin/...         admin (login required)
app/api/cv-pdf/route.ts        CV PDF
components/                    UI components
content/                       seed text (from docs/04-page-text-en.md)
db/schema.ts, db/migrations/   Drizzle
lib/                           auth, imports, formatting
messages/en.json da.json fr.json  short UI strings (buttons, labels)
public/brand, public/media, public/og
```

## Database schema (starting point)

| Table | Key columns |
|---|---|
| `content_blocks` | `page`, `key`, `locale`, `body` (Markdown), `updated_at`; unique on (page, key, locale) |
| `settings` | `key`, `value` (JSON): email, phone, date_of_birth, handicap, lowest_handicap, social links, feature flags |
| `races` | `date`, `regatta`, `place`, `event`, `boat_class`, `crew` (text[]), `round`, `placing`, `time_ms`, `story_key`, `confirmed` |
| `calendar_events` | `date`, `name`, `place`, `confirmed` |
| `personal_bests` | `metric` (e.g. `2000m`, `1min`), `value_ms` or `value_m`, `watts`, `date`, `note` |
| `goals` | `when_label`, `text`, `order` |
| `training_sessions` | `source`, `external_id`, `start_time`, `sport`, `title`, `duration_s`, `distance_m`, `avg_split_s_per_500`, `avg_rate`, `avg_hr`, `max_hr`, `avg_watts`, `visible`, `auto_hidden_reason`; unique on (source, external_id). **No coordinate columns** |
| `golf_results` | `date`, `event`, `course`, `format`, `score`, `to_par`, `placing` |
| `golf_rounds` | `date`, `course`, `score`, `to_par`, `fairways_hit`, `fairways_total`, `gir`, `putts`, `sg_putting`, `notes` |
| `golf_bag` | `club`, `make_model`, `order` |
| `education`, `positions`, `work`, `skills`, `languages` | Row tables for the Engineering page and CV, each with `order` and per-language text where needed |
| `gallery_items` | `blob_url`, `width`, `height`, `dominant_colour`, `alt_en`, `alt_da`, `alt_fr`, `credit`, `category`, `order`, `visible` |
| `project_photos` | Approved bachelor project photos: same shape as gallery items, plus `approved` |

Seed the database from `docs/04-page-text-en.md` and the tables in it (results, PBs, goals, education, bag and so on).

## Rendering and caching

- Public pages are static, revalidated on demand: every admin save calls `revalidatePath` for the affected routes in all three languages.
- Images go through `next/image`; media in `public/media` is already web-optimised.

## Security

- `/admin` and every admin server action check the session **and** that the GitHub ID equals `ADMIN_GITHUB_ID`. Anyone else gets a 404, not a 403.
- Uploads: check type and size (images under 15 MB, imports under 50 MB); strip EXIF location data from images.
- Set security headers: Content-Security-Policy, `X-Content-Type-Options`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`.
- No secrets in the repo. The phone number lives only in the database.

## Working rules for Claude Code

- Work phase by phase from `docs/prompts/`. Finish each phase with a report: what was built, what was tested, open questions and "check" items.
- Use a Git branch per phase and open a pull request into `main`; Vercel creates a preview for each.
- Use a Neon branch for schema changes; merge the migration only when the preview works.
- Before marking a phase done, run `npm run lint`, `npm run typecheck`, `npm run build`, and check the pages in a browser at 1440 px and 390 px wide.
