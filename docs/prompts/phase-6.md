# Phase 6: Languages and launch

Branch: `phase-6-launch`.

1. Translations: draft the Danish and French text for every content block and UI string, then save it in the database through the seed or the admin, and in `messages/da.json` and `messages/fr.json`. Mark it "needs native review" in admin so Samuel can have it checked. Remove the English fallback notice for completed pages.
2. Final content check: list every remaining placeholder and "check" item for Samuel.
3. Domain: give Samuel numbered steps to buy samueljensen.com (if not already done), add it to the Vercel project, set the DNS records and redirect `www` to the bare domain. Update `NEXT_PUBLIC_SITE_URL` and the GitHub OAuth production callback.
4. Production check: run through every page in all three languages on desktop and phone, test admin login, an import, a gallery upload and the CV PDF.
5. Google: give Samuel steps to verify the domain in Google Search Console and submit the sitemap.
6. Write a short `docs/05-owner-guide.md` for Samuel: how to sign in, update results, upload training files, add photos and change text.

Write the final report, then open a pull request. After Samuel approves it, merge into `main` to go live.
