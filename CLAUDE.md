# CLAUDE.md: samueljensen.com

Personal website for Samuel Gustav Jensen: engineer (MSc, SDU), rower (Odense Roklub) and golfer. Next.js on Vercel, Neon Postgres, Vercel Blob.

## Read first

1. `docs/01-specification.md`: what to build, privacy rules, the decisions log
2. `docs/02-design-system.md`: colours, fonts, components
3. `docs/03-technical-setup.md`: stack, schema, environment, working rules
4. `docs/04-page-text-en.md`: the approved English text. Use it word for word
5. `docs/prompts/phase-N.md`: the current phase

`design-reference/*.html` are first-draft layouts for proportions only. The docs win where they disagree.

## Rules

- **UK English** everywhere: in copy, UI labels, comments and commit messages (colour, organise, programme, metres).
- **Never invent content.** Missing text gets a visible placeholder and goes in the phase report.
- **Privacy rules in the specification are non-negotiable.** Never publish an address, exact birthday, grades or GPS data. The phone number appears only in the CV PDF.
- No analytics, trackers, contact forms or third-party embeds. Only two cookies: language and admin session.
- `/admin` is for one GitHub account only (`ADMIN_GITHUB_ID`). Everyone else gets a 404.
- Respect `prefers-reduced-motion`. Every image has alt text. Text meets WCAG AA contrast.
- Use a branch and pull request per phase. Never commit secrets; keep `.env.example` current.
- Before finishing a phase: `npm run lint`, `npm run typecheck`, `npm run build`, then check pages at 1440 px and 390 px.
- End each phase with a short report: built, tested, open questions, "check" items.

## Commands

| Task | Command |
|---|---|
| Develop | `npm run dev` |
| Lint and types | `npm run lint` and `npm run typecheck` |
| Build | `npm run build` |
| Database migration | `npm run db:generate` then `npm run db:migrate` |
| Seed | `npm run db:seed` |

## Owner preferences

Samuel is an engineering student, comfortable with tools but new to web development. Explain anything he must do himself (accounts, keys, DNS) in short numbered steps, and say why.
