# Phase 3: Database and admin

Branch: `phase-3-admin`. Before starting, make sure the Neon plugin is installed (`claude plugin install neon@claude-plugins-official`) and use a Neon branch for this work.

1. Add Drizzle with the schema in `docs/03-technical-setup.md`. Generate and run migrations on the Neon branch. Add `db:generate`, `db:migrate` and `db:seed` scripts.
2. Write a seed script that loads all content from phase 2 (page text blocks for `en`, results, calendar, PBs, goals, golf data, the bag, education, positions, work, skills, languages and settings). Settings get the email, handicap +1.0, lowest +2.3, social links and feature flags. Leave the phone number and date of birth empty; Samuel adds them in admin, so neither is ever in the repository.
3. Switch every public page to read from the database, with on-demand revalidation.
4. Add Auth.js with GitHub sign-in. Only `ADMIN_GITHUB_ID` is let in; everyone else gets a 404 on all `/admin` routes and admin actions. Give Samuel numbered steps to create the GitHub OAuth app (local and production callback URLs) and to find his numeric GitHub ID.
5. Build the admin with one section per row of the admin table in specification section 6. Requirements:
   - Clean, simple forms in the site's style, validated with `zod`.
   - Page text: one editor per text block, a tab per language and a Markdown preview.
   - Lists (results, PBs, bag and so on): add, edit, delete and drag to reorder.
   - Settings, including the feature toggles for Sponsors and Reports and publications.
   - Every save revalidates the affected pages in all languages and confirms with a short message.
6. Set up Vercel Blob. Gallery and project photo uploads with alt text in three languages, a credit, a category and an order. Strip EXIF location data, store width, height and dominant colour.
7. Build the CV PDF route (`@react-pdf/renderer`, A4, site fonts). It adds the phone number from settings; it never includes an address. Add the download button to the CV page.

Test login as the admin and as another GitHub account (it must see a 404). Write the phase report, then open a pull request. Merge the Neon branch only after the preview works.
