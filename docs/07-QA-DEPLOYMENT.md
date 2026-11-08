# 07 — QA, Testing, Deployment & Handover

## 1. Test strategy

| Layer | Tool | What |
|---|---|---|
| Unit | Vitest | Pure functions: theme derivation/contrast, formatPeriod, slugify, Zod schemas, rate-limit logic, backup validation, DTO mappers |
| Component | Vitest + Testing Library | GameCard (badges, links), SortableList keyboard reorder, ImageField states, ContactForm validation |
| E2E | Playwright (+ @axe-core/playwright) | Critical user journeys, below |
| Manual | Checklist §4 | Visual parity with the prototype, devices, emails |

The E2E environment uses a separate test DB (`MONGODB_URI` for test). Run `seed --force` before the suite. Mock Cloudinary uploads (intercept the upload request and return fake metadata) and Resend (a `EMAIL_TRANSPORT=log` env switch that logs instead of sending).

## 2. Unit test cases (minimum)
- `deriveTokens`: onPrimary is dark for `#A3E635`, `#EAB308`, `#FBBF24`; light for `#7C5CFF`, `#4F46E5`, `#EF4444`.
- `contrastRatio('#ECECF8','#0B0B14') > 15`; `contrastRatio('#777777','#888888') < 1.5`.
- `formatPeriod({start:{month:3,year:2023},current:true}) === 'Mar 2023 – Present'`; year-only works; override wins.
- `slugify('2D Air Shooter!') === '2d-air-shooter'`.
- `gameSchema` rejects a non-YouTube trailer, a bad hex, a slug with spaces, and a > 220-char short description.
- Rate limiter: the 6th call inside the window returns `limited:true`.
- Backup schema rejects a missing `version` or a wrong shape.

## 3. E2E flows (must pass)
1. **Public home:** loads, all visible sections render in order, nav scroll works, filter chips filter games, axe has no serious violations.
2. **Game page:** open a card → detail page → gallery lightbox opens/closes via keyboard → itch.io link has the correct href and `target=_blank rel=noopener`.
3. **Auth:** `/admin` redirects to login → bad password shows an error → good password lands on the overview → logout.
4. **Edit content → live:** log in → change the hero tagline → save → open `/` → the new tagline is visible.
5. **Games CRUD:** create a game (title, short desc, genre, link) → publish → it appears on home → change the slug → old URL redirects → unpublish → it's gone from home → delete.
6. **Reorder:** drag game 3 to first → home shows it first. Repeat with keyboard reorder.
7. **Layout:** hide Services → its nav link and section disappear; rename the "Games" label → the nav updates.
8. **Theme:** open Theme Studio → click "Sunset Synth" → the preview iframe's `--primary` equals `#FB7185` → the live site is still neon (draft) → Publish → the live site `--primary` is `#FB7185`.
9. **Contact:** submit the form → success message → the message appears in the admin inbox as unread → opening it marks it read.
10. **Contact spam:** filling the honeypot → reported "success", but nothing is stored. 6 quick submissions → rate-limit error.
11. **Backup:** export → import the same file → content is unchanged.
12. **Mobile (390px):** hamburger menu works; the admin game form is usable; save bar is visible.

## 4. Manual QA checklist (record results in `docs/QA-REPORT.md`)

**Visual parity with prototype**
- [ ] Hero, About, Games, Skills, Experience, Services, Contact, Footer match at 1440 / 1024 / 768 / 390 / 360
- [ ] All 9 presets look right; check gradient text, buttons, badges and cover art in each
- [ ] All 4 font pairs; arcade pair readability
- [ ] Radius 0 and 32 extremes don't break layout
- [ ] Starfield / grid / none; animations off

**Behaviour**
- [ ] No theme flash on hard reload (desktop + mobile, throttled)
- [ ] Visitor light/dark toggle (when enabled) persists and doesn't flash
- [ ] Unsaved-changes guard on every editor
- [ ] Ctrl/Cmd+S saves
- [ ] Image upload: large file rejected with a clear message; wrong type rejected; progress shown
- [ ] Deleting in-use media warns
- [ ] Emails: notification received, reply-to works, auto-reply (when enabled)
- [ ] Email failure path: message saved, ⚠ shown in inbox

**Devices/browsers:** Chrome, Firefox, Safari (macOS), iOS Safari, Android Chrome, Edge.

**Accessibility:** keyboard-only through the whole public site and the game form; focus visible everywhere; screen reader announces nav, headings, form errors and toasts; reduced motion respected.

**Performance:** Lighthouse mobile ≥ 90/95/95/95 on `/` and one `/games/[slug]`; no admin JS in public chunks (bundle analyser).

**Security**
- [ ] Every admin server action rejects when called without a session (test by calling it directly)
- [ ] Markdown with `<script>` / `onerror` is sanitised
- [ ] Security headers present (check securityheaders.com)
- [ ] `.env` not committed; no secrets in client bundle (search build output for the key prefixes)

## 5. CI (GitHub Actions)
`.github/workflows/ci.yml` on push/PR: pnpm install (cached) → typecheck → lint → unit tests → build. A separate job runs Playwright against the Vercel preview URL (or locally with a service-container Mongo) on PRs to `main`.

## 6. Definition of Done (project)
- [ ] All PRD functional requirements implemented; all acceptance criteria verified
- [ ] All E2E flows green; unit tests green
- [ ] Lighthouse + axe targets met
- [ ] Deployed on Vercel with a custom domain (or `*.vercel.app` until a domain is bought)
- [ ] Production seeded; admin user created; setup checklist shown to Najeeb
- [ ] `HANDOVER.md` written; `DECISIONS.md` up to date; `README.md` with dev setup

## 7. Deployment steps (production)
1. **MongoDB Atlas:** create a free M0 cluster → DB user → Network Access: allow `0.0.0.0/0` (or the Vercel Atlas integration) → copy the connection string into `MONGODB_URI` (database name `najeeb_portfolio`).
2. **Cloudinary:** free account → copy cloud name, key and secret.
3. **Resend:** free account → API key. If there's a custom domain, verify it (SPF/DKIM DNS records) and set `EMAIL_FROM="Najeeb Ullah <hello@domain>"`.
4. **Vercel:** import the GitHub repo → set all env vars (Production + Preview) → deploy.
5. **Seed:** locally, with the production env loaded: `pnpm seed` then `pnpm create-admin`. Then remove `ADMIN_PASSWORD` from wherever it was stored.
6. **Domain:** add it in Vercel → DNS → set `NEXT_PUBLIC_SITE_URL` → redeploy.
7. **Google Search Console:** verify (paste the code into SEO settings) → submit `/sitemap.xml`.
8. Smoke test production: all E2E flows 1–4 and 8–9 manually.

## 8. HANDOVER.md (for Najeeb — write in simple language)
Sections to include:
1. How to log in (`yourdomain.com/admin`), and what to do if you forget the password (contact Abid → `pnpm create-admin`).
2. **First-time setup:** follow the checklist on the Overview page (email, photo, real game descriptions, screenshots, socials).
3. How to add a new game (step by step with screenshots).
4. How to change the theme (presets, custom colours, Publish).
5. How to hide, show and reorder sections.
6. How to read and reply to messages.
7. Image tips: sizes (cover 1600×1000, photo 800×800, OG 1200×630), always add alt text.
8. Monthly backup: Backup → Download.
9. Costs: all free tiers, and the limits to watch (Cloudinary storage, Resend 100 emails/day, Atlas 512 MB).
10. Who to contact for help.
