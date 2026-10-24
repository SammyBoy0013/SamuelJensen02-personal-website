# Project specification: samueljensen.com

Personal website for **Samuel Gustav Jensen**: engineering student (MSc, SDU), competitive rower (Odense Roklub) and golfer. Owner and only editor: Samuel. Every visitor-facing page is public; only `/admin` needs a login.

Last updated: 24 October 2026.

## 1. Goals

| Priority | Audience | What they need |
|---|---|---|
| 1 | Samuel himself | A polished home for his story, results and training |
| 2 | Sponsors | Who he is, results, goals and an easy way to get in touch |
| 3 | Employers and thesis partners | Education, the bachelor project, skills and the CV |
| 4 | Rowing and golf community | Results, personal bests and the training log |

## 2. Site map

Navigation order: **Home, Rowing, Golf, About, Engineering, Gallery, CV, Contact**. Sport comes first; Engineering is second to last among the main sections.

| Page | Route | Sections (these appear in the hover dropdown and the drawer) |
|---|---|---|
| Home | `/` | Full-screen slides: Hero, Rowing, Golf, About, Engineering, Contact |
| Rowing | `/rowing` | Introduction, Goals, Personal bests, Training log (summary) |
| Racing | `/rowing/racing` | Results (latest 10, plus "All results"), Race stories, Calendar |
| Training dashboard | `/rowing/dashboard` | Placeholder "Coming soon"; designed separately later |
| Golf | `/golf` | Introduction, At a glance, Results, Statistics (summary), In the bag, Two holes in one |
| Golf dashboard | `/golf/dashboard` | Placeholder "Coming soon"; designed separately later |
| About | `/about` | Introduction, My story, Timeline, What I stand for, Away from sport, Training philosophy (sub-page, text to follow) |
| Engineering | `/engineering` | Introduction, Education, Bachelor project, Skills and tools, What I'd love to work on. *Reports and publications* exists but is **hidden** (feature flag) |
| Gallery | `/gallery` | Filterable grid: Rowing, Golf, Life |
| CV | `/cv` | Web CV plus PDF download |
| Contact | `/contact` | Email me, Collaborate, Copy address |
| Privacy | `/privacy` | Privacy notice |
| 404 | any unknown route | "Wrong lane" |
| Admin | `/admin` | Login-protected editor (section 6) |

**Built but hidden behind admin toggles:** Sponsors section (shown once a sponsor exists), Reports and publications (Engineering). **Not in version 1:** blog (private for now), equipment page, dark mode, analytics.

Every route exists in three languages: `/en/...`, `/da/...` and `/fr/...`, in the order English, Danish, French. English is the default; `/` redirects to `/en`.

## 3. Content

- The approved English text for every page is in `docs/04-page-text-en.md`. Use it word for word. Do not invent copy. If text is missing, show a clearly marked placeholder and list it in the phase report.
- Lines marked "check" are unconfirmed facts. Keep them editable in admin and flag them in the phase report.
- Tone: polished UK English, first person, short sentences. Never American spelling.
- Danish and French text is added in phase 6. Until then, the `da` and `fr` routes fall back to English and show a small notice.

## 4. Privacy rules (non-negotiable)

| Rule | Detail |
|---|---|
| No tracking | No analytics, no third-party trackers, no advertising cookies, no contact forms |
| Cookies | Only two, both strictly necessary: language choice and the admin session. No cookie banner is needed |
| Never published | Home address, exact birthday (show age only), grades, family details, relationships, health information, names of rowing coaches |
| Phone number | Appears **only** in the generated CV PDF, never in HTML. Stored in admin settings, never committed to the repo |
| Age | Calculated from the date of birth stored in settings; shown on the CV page and PDF |
| Training data | No GPS maps or coordinates are stored or shown. Keep summary figures only (date, type, duration, distance, split, rate, heart rate, power) |
| Bachelor project (NDA) | Only text and photos Samuel has approved in admin |
| Email | Shown as `samuel.jensen@tarric.com` (editable in settings) |
| Hosting logs | Mentioned in the privacy notice (Vercel) |

## 5. Features

### 5.1 Navigation (exact behaviour)

| State | Behaviour |
|---|---|
| Home hero, page just loaded | No bar shown. Name and photo only |
| Any page, scrolling **up** | Off-white ribbon slides in at the top: monogram left, page names centre, language switch (EN DA FR) right |
| Hovering a page name | Name gets a pink background with white text; a pink dropdown lists that page's sections |
| Scrolling **down** | Ribbon slides away; the pink circle menu button (white three-line icon) appears top right |
| Phones (< 900 px) | No ribbon links; the pink circle button is always shown |
| Circle button pressed | Drawer opens from the right: ink background, 3 px pink left edge, page names in Bodoni Moda with section links beneath, language switch at the bottom. Esc and scrim click close it |
| Monogram clicked | Goes to the home hero with the menu closed |

### 5.2 Motion

- Page-to-page transition: 0.5 s, `cubic-bezier(.2,.7,.2,1)`, a quick slide and fade.
- Home: full-screen slides with scroll snap; gentle parallax on photos; text fades up.
- Inner pages: normal scrolling; long sections scroll within the page. Sections fade up once.
- Count-up animation **only** on summary statistics (sport pages), not on dashboards or tables.
- Respect `prefers-reduced-motion`: no parallax, no count-up, instant transitions.

### 5.3 Video

Muted, looping, `playsinline`, autoplay. Each video has an unmute button and pauses when it leaves the screen (IntersectionObserver).

### 5.4 Loading and 404

- **Loading:** on the first visit of a session only, the seal ring draws itself (stroke animation, at most 1.2 s), then fades to the page. Images show a dominant-colour block until loaded.
- **404 "Wrong lane":** three lane boards showing 4, 0, 4, the 0 in pink. Text from the page text file. Button "Back to lane one" goes to the home page.

### 5.5 Racing and results

- Results come from the database, newest first. The Racing page shows the latest 10; "All results" expands to the full list.
- Each result shows date, regatta, place, event or boat class, crew names, round, placing and time.
- The calendar shows only races marked **confirmed**.
- Personal bests table: distance, time or result, date, with an optional watts value.

### 5.6 Training log

- Data is uploaded manually by Samuel in admin. **No Strava API** (it now requires a paid subscription for developers) and **no Concept2 API** in version 1.
- Accepted uploads:

| Source | File |
|---|---|
| Strava bulk export | `activities.csv` from the account data export (zip or the CSV alone) |
| Strava single activity | `.fit`, `.gpx` or `.tcx` |
| Concept2 Logbook | Season CSV export |
| NK SpeedCoach | NK LiNK session CSV |

- Deduplicate on start time (within 2 minutes) and duration.
- Automatically hide likely warm-ups and cool-downs: sessions under 12 minutes, or titled "warm up", "warm-up", "cool down", "cool-down", "WU" or "CD" (any case). Samuel can override visibility per session.
- Strip all GPS data on import; never store coordinates.
- Public view: training summary on the Rowing page (this week, this month, this season: sessions, hours, kilometres), plus a session list. The full dashboard comes later.

### 5.7 Golf

- Golf results and rounds are entered in admin.
- Summary statistics on the Golf page: handicap, lowest handicap, lowest round, plus whatever round statistics exist (strokes gained putting and shot dispersion are the priorities). Hide any statistic that has no data.

### 5.8 Gallery

- Images live in Vercel Blob, uploaded in admin with alt text (EN, DA, FR), a photographer credit, a category and display order.
- Filter by Rowing, Golf and Life. Click opens a lightbox with the credit shown.

### 5.9 CV

- The web CV is rendered from admin data (profile, education, positions, work, sport, skills, languages, interests).
- The PDF is generated on demand from the same data, A4 and in the site's fonts. It **adds the phone number** from settings; the address is never included.

### 5.10 Contact

- "Email me": `mailto:` with no subject. "Collaborate": `mailto:` with the subject "Collaboration enquiry". "Copy address": copies the address to the clipboard and confirms it with "Copied".
- No forms.

### 5.11 Footer

Full seal in white on ink, social icons in this order: **LinkedIn, Strava, Instagram, Facebook**, privacy link, language links, and a pink circular back-to-top button with a white arrow.

| Network | URL |
|---|---|
| LinkedIn | https://www.linkedin.com/in/samuel-gustav-jensen-824288295/ |
| Strava | https://www.strava.com/athletes/51417053 |
| Instagram | https://www.instagram.com/samuel_jensen02/ |
| Facebook | https://www.facebook.com/smmyboy.jensen |

### 5.12 SEO and sharing

- Page titles: "Page — Samuel Jensen". Meta descriptions are in the page text file.
- Share image (Open Graph and Twitter): `public/og/share-image.jpg` (1200 × 630) on every page.
- Favicon: `public/brand/favicon.svg`, plus PNG fallbacks generated from it (32 px, 180 px Apple touch, 192 px and 512 px).
- `sitemap.xml` with all three languages and `hreflang` alternates; `robots.txt` that disallows `/admin`.
- Structured data: `Person` schema on the home page.

## 6. Admin

Login: **Sign in with GitHub**, allowed for one GitHub account only (Samuel's, by numeric user ID in an environment variable). Everyone else gets a 404. No passwords are stored.

The admin has one section per part of the site:

| Section | What Samuel can edit |
|---|---|
| Pages | Every text block on every page, per language (EN, DA, FR), with a Markdown editor and preview. Seeded from `docs/04-page-text-en.md` |
| Rowing: results | Add, edit and delete races; mark as confirmed; crew names; time |
| Rowing: calendar | Upcoming races; confirmed toggle |
| Rowing: personal bests | Distance or test, result, watts, date |
| Rowing: goals | Goals table rows |
| Training log | Upload files, review the import preview, toggle session visibility |
| Golf | Results, rounds, at-a-glance values, the bag |
| Engineering | Education rows, project text, approved project photos, skills table |
| Gallery | Upload, alt text, credit, category, order, visibility |
| CV | All CV sections |
| Settings | Email, phone (PDF only), date of birth, handicap values, social links, feature toggles (Sponsors, Reports and publications) |

Every save revalidates the affected public pages.

## 7. Decisions log

| Topic | Decision |
|---|---|
| Hosting | Vercel Hobby plan (personal, non-commercial) |
| Database | Neon Postgres, project "Website", region aws-eu-central-1 (Frankfurt) |
| Admin login | GitHub sign-in, single allowed account |
| Content editing | Built-in admin with a section per page; page text in the database |
| Media | Vercel Blob |
| Strava | Manual uploads until the API is free to use |
| Concept2 | Manual CSV upload; API later |
| Languages | Separate routes per language (`/en`, `/da`, `/fr`) |
| Dashboards | Designed separately; placeholder routes in version 1 |
| Domain | samueljensen.com (to buy) |
| Analytics | None |
| Contact form | None; mailto only |
| Accessibility | Built in from the start (alt text, contrast, keyboard, reduced motion); full review after launch |
