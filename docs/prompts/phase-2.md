# Phase 2: Pages and content

Branch: `phase-2-pages`. Build every public page with the approved text from `docs/04-page-text-en.md`. For now, read content from typed files in `content/`; phase 3 moves it into the database.

1. **Home:** full-screen slides with scroll snap in the order Hero, Rowing, Golf, About, Engineering, Contact. Each title links to its page. Gentle parallax and fade-ups. Images as in the design system's image table.
2. **Rowing:** introduction, goals table, personal bests table, on-the-water best, vital statistics, and a training log placeholder. Summary statistics use the count-up animation.
3. **Racing** (`/rowing/racing`): results table (latest 10, "All results" expands), race stories, confirmed calendar.
4. **Golf:** introduction, at-a-glance table, results, the bag, the two-holes-in-one story beside the hole-out video, statistics summary (hide empty statistics).
5. **About:** introduction with the Latin motto as the headline, My story, the timeline component, What I stand for, Away from sport with the at-a-glance table, and a Training philosophy sub-page placeholder.
6. **Engineering:** introduction, education, bachelor project (text only plus a placeholder image), skills and tools, what I'd love to work on. Reports and publications is hidden.
7. **Gallery:** grid from the `public/media` images with category filters and a lightbox showing credits ("Credit to follow" until supplied).
8. **CV:** the web CV from the page text. Age calculated from a date of birth read from an environment variable `DATE_OF_BIRTH` for now (moved to admin settings in phase 3; never committed). No phone number and no address on the page.
9. **Contact:** the three buttons from specification 5.10 and the Collaborate text.
10. **Privacy:** the privacy notice.
11. **Dashboards:** `/rowing/dashboard` and `/golf/dashboard` show a styled "Coming soon".
12. Videos follow specification 5.3.
13. Meta titles and descriptions from the page text; `Person` structured data on Home.

Check every page at 1440 px and 390 px. List every "check" item and placeholder in the phase report, then open a pull request.
