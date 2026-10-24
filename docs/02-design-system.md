# Design system

House style: **clean and elegant, with bold sporty moments.** Pink is Samuel's Culford house colour: use it as an accent, never as a large background fill except for the menu button, hover states and the back-to-top button.

`design-reference/*.html` are exported first-draft layouts. Use them for proportions, spacing and component shapes. Where they disagree with this file or the specification (for example the navigation, slide order or copy), **this file and the specification win**.

## Colours

| Token | Hex | Use |
|---|---|---|
| `--pink` | `#E8196F` | Accent: rules, underlines, menu button, hover backgrounds, the G in the monogram |
| `--pink-text` | `#C2105A` | Pink for small text on paper (passes contrast) |
| `--pink-soft` | `#FFD3E4` | Eyebrow text on dark photos |
| `--ink` | `#16131A` | Main text; dark backgrounds |
| `--paper` | `#F7F5F2` | Main background; the ribbon (at 96 % opacity) |
| `--white` | `#FFFFFF` | Cards; text on photos |
| `--line` | `#E4DFE3` | Borders and dividers |
| `--grey-1` | `#3A3540` | Body text on paper |
| `--grey-2` | `#5A5560` | Secondary text |
| `--grey-3` | `#B9B3BF` | Text on ink |
| `--grey-4` | `#4A4550` | Borders on ink |

## Typography

Load both fonts with `next/font/google`, self-hosted, so no requests go to Google from the visitor's browser.

| Role | Font | Weight | Size |
|---|---|---|---|
| Hero name | Bodoni Moda | 600 | `clamp(64px, 11vw, 176px)`, line height 0.88, tracking −0.02em |
| Page title (h1) | Bodoni Moda | 600 | `clamp(52px, 6vw, 96px)`, line height 0.92 |
| Section title (h2) | Bodoni Moda | 600 | `clamp(36px, 4vw, 56px)`, line height 1.02 |
| Large numbers (statistics) | Bodoni Moda | 600 | 40–48 px |
| Quotes and the motto | Bodoni Moda italic | 500 | 24 px |
| Eyebrow (section label) | Archivo | 500 | 13 px, uppercase, tracking 0.22em, `--pink-text` (or `--pink-soft` on photos) |
| Navigation | Archivo | 500 | 13 px, uppercase, tracking 0.08em |
| Body | Archivo | 400 | 17–18 px, line height 1.65–1.7 |
| Table text | Archivo | 400 | 15 px; header 12 px uppercase, tracking 0.1em |

## Layout

- Side padding: `clamp(20px, 5vw, 80px)`. Content max width: 1200 px.
- Section spacing: 96 px top and bottom on desktop, 64 px on phones.
- Breakpoint: 900 px. Below it, two-column layouts stack.
- Corners: 4 px on cards and images. Buttons are text links with a 2 px pink underline ("Enter rowing →"), except the round buttons.
- Sticky section tabs under each page header (as in the design reference), linking to the page's sections.

## Brand assets (already outlined, no font needed)

| File | Use |
|---|---|
| `public/brand/seal.svg` | Official logo. Uses `currentColor` for the ring, text and S/J; G, dots and underline are pink. White on ink in the footer and loading screen |
| `public/brand/monogram.svg` | Header logo: SGJ with a pink G |
| `public/brand/favicon.svg` | Tab icon: ink tile, pink S, white J, pink edge |
| `public/og/share-image.jpg` | Share image for all platforms |

## Components

| Component | Specification |
|---|---|
| Ribbon (header) | Height about 60 px, `--paper` at 96 % opacity, 1 px `--line` bottom border, monogram 78 × 32 px |
| Nav hover | Pink background, white text, 0.2 s; dropdown panel in pink, white links, 12 px padding |
| Menu button | 52 px circle, `--pink`, white 22 px three-line icon, fixed top right (16 px from the top) |
| Drawer | Width `min(420px, 100%)`, `--ink`, 3 px pink left border, slides in over 0.45 s `cubic-bezier(.7,0,.2,1)`, scrim at 45 % ink |
| Back-to-top | 52 px pink circle, white arrow, bottom right of the footer |
| Statistic tile | White card, 1 px `--line` gaps, label (eyebrow style, grey) above a Bodoni number |
| Results table | Full width, 1 px `--line` row borders, placing right-aligned in `--pink-text` and bold |
| Timeline | Vertical line in `--line`, pink dots, year in Bodoni, text in Archivo |
| Lane boards (404) | Three tall white boards with black numerals; the middle 0 in pink |
| Photo overlay | Ink gradient so white text passes contrast |
| Video | Rounded 4 px, unmute button bottom right (40 px circle, ink at 70 %, white icon) |

## Image use

| Place | Image |
|---|---|
| Home hero | `hero-single-sculling.jpg` |
| Home, Rowing slide and Rowing header | `rowing-crew-lift.jpg` |
| Racing header | `racing-start-line.jpg`; `racing-side-by-side.jpg` in the results section |
| Golf | `golf-portrait.jpg`; `golf-hole-out.mp4` beside the hole-in-one story |
| About and CV | `culford-dinner.jpg`; `zagreb-team-dock.jpg` on the Home About slide |
| Rowing story | `carrying-the-single.mp4` (poster `carrying-the-single.jpg`) |
| Engineering | No photo yet: use the pink grid pattern placeholder from the design reference until Samuel uploads approved photos |
| Gallery | All `gallery-*.jpg` plus the images above |
