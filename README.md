# Maakjobs - Dutch technical / maakindustrie job board

A Dutch-language job board for **technical and manufacturing** roles (werktuigbouw/mechanical,
elektrotechniek, installatie & klimaat, onderhoud & service, engineering & werkvoorbereiding,
mechatronica & procestechniek, productie & montage). Jobs are scraped from public ATS feeds and
Dutch aggregators, classified automatically, and served through a programmatic-SEO site.

## Stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **Tailwind CSS v4** + TypeScript
- **`node:sqlite`** (built into Node) - single file `data/maakjobs.db`, no DB server needed
- Scrapers in TypeScript via **tsx**; HTML parsing with **cheerio**

## Quick start

```bash
npm install
npm run scrape        # populate data/maakjobs.db from the seed companies (ATS only)
npm run dev           # http://localhost:3000
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run scrape` | Scrape all sources (ATS + best-effort aggregators) → classify → upsert |
| `npm run scrape -- --ats-only` | Skip the fragile aggregator adapters |
| `npm run scrape -- greenhouse lever` | Only the named source(s) |
| `npm test` | Classifier unit tests |
| `npm run dev` / `npm run build` / `npm start` | Next.js dev / production build / serve |
| `npm run alerts:send` | Send job-alert digests (dry-run unless `RESEND_API_KEY` is set) |

## How it works

1. **Scrapers** (`scripts/scrapers/`) pull jobs from ATS APIs - Greenhouse, Lever, Ashby,
   Recruitee, Homerun, Personio, Workable, SmartRecruiters - for the companies in
   `scripts/scrapers/seed/companies.json`, plus best-effort Dutch aggregators (Indeed,
   Nationale Vacaturebank, Magnet.me - see ToS caveats in each adapter).
2. **Classifier** (`lib/classify.ts`, config in `lib/taxonomy.ts`) assigns each role a technical
   category, seniority, work mode, location (NL city → province), salary (annualized EUR) and
   reports-to line. Non-technical and non-NL roles are dropped.
3. **The site** (`app/`) reads the DB directly in Server Components. Data pages are dynamic so the
   site reflects the DB without a rebuild after each scrape.

## Add more companies

Edit `scripts/scrapers/seed/companies.json` - add `{ "name", "atsType", "atsSlug", "website" }`.
Find the `atsSlug` from a company's careers URL (e.g. `boards.greenhouse.io/<slug>`,
`jobs.lever.co/<slug>`, `<slug>.recruitee.com`). Then `npm run scrape`.

## Deployment

Run the scraper on a schedule (cron / GitHub Action), then serve with `npm run build && npm start`
(Node server - required because pages render from the local SQLite DB). For email alerts set
`RESEND_API_KEY` + `ALERTS_FROM_EMAIL` (see `.env.example`).

