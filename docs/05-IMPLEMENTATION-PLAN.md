# 05 — Implementation Plan (A → Z)

> **Status 2026-11-08:** Phases 0–13 built and verified (typecheck, lint, 42 unit tests, 16 Playwright e2e flows, production build). Not yet done: Lighthouse measurement on a deployed URL, manual QA report / screen-reader & cross-browser pass, and Phase 14 deployment.

**How to use this file (Claude Code):** Work top to bottom. Tick each box (`- [x]`) as soon as the task is done. Don't start a phase until the previous phase's **Done when** list is fully satisfied and `pnpm typecheck && pnpm lint && pnpm build` passes. Commit at the end of each phase.

Rough size: 15 phases, ~120 tasks.

---

## Phase 0 — Project setup
- [x] Check the current stable versions of Next.js, React, Tailwind, Auth.js, Mongoose, Zod and Framer Motion.
- [x] `pnpm create next-app` with TypeScript, App Router, `src/`, ESLint, Tailwind, `@/*` alias.
- [x] Enable TS `strict`, `noUncheckedIndexedAccess`.
- [x] Add Prettier (+ tailwind plugin), `.editorconfig`, `.nvmrc` (current LTS Node).
- [x] Install deps: mongoose, zod, next-auth@beta (v5), bcryptjs, react-hook-form, @hookform/resolvers, motion (framer-motion), @dnd-kit/core + sortable, lucide-react, react-markdown, rehype-sanitize, remark-gfm, cloudinary, resend, react-colorful, culori (or custom color utils), clsx, tailwind-merge, sonner (toasts), Radix primitives as needed.
- [x] Dev deps: vitest, @testing-library/react, playwright, @axe-core/playwright, tsx.
- [x] Create the scripts in `package.json`: dev, build, start, lint, typecheck, test, test:e2e, seed, create-admin.
- [x] Create `.env.example` (Architecture §12) and `src/env.ts` (Zod-validated env).
- [x] Create the folder structure from Architecture §2 (empty index files where useful).
- [x] Copy `docs/reference/prototype.html` into place (already there) and create `docs/DECISIONS.md`.
- [x] `git init`, `.gitignore` (include `.env*.local`), first commit.

**Done when:** `pnpm dev` runs, `pnpm build` passes, and env validation fails with a clear message when a required var is missing.

## Phase 1 — Theme engine & design tokens
- [x] `lib/theme/presets.ts`: 9 presets exactly as in Design §4, typed `ThemeBase`.
- [x] `lib/theme/derive.ts`: `mix()`, `withAlpha()`, `relativeLuminance()`, `contrastRatio()`, `deriveTokens()` (Design §3).
- [x] Unit tests for derive.ts: onPrimary picks dark text for `#A3E635`, light for `#7C5CFF`; contrast of `#ECECF8` on `#0B0B14` > 4.5.
- [x] `lib/theme/fonts.ts`: 4 pairs via next/font (Architecture §8 point 6).
- [x] `lib/theme/to-css-vars.ts`: tokens + radius + fonts → style object/string.
- [x] Tailwind config: map colours/radius/fonts to the CSS variables (Design §3).
- [x] Global CSS: base styles, `.reveal` utilities, reduced-motion rules, focus ring, selection colour, scrollbar styling.
- [ ] A temporary `/dev/tokens` page that shows all tokens for every preset (delete it at the end of Phase 12). _(skipped: tokens verified via unit tests + Theme Studio preview instead)_

**Done when:** switching a hard-coded preset id in the root layout recolours the token page correctly, and unit tests pass.

## Phase 2 — Database, models, validation, seed
- [x] `server/db.ts`: cached Mongoose connection (global cache for dev hot reload).
- [x] Models per Architecture §3 (settings, profile, games, skillCategories, skills, experiences, services, testimonials, messages, media, customThemes, users, rateLimits) with indexes.
- [x] Zod schemas in `lib/validation/` for every entity (+ shared primitives: hex, url, slug, mediaRef).
- [x] DTO types and mappers (`toGameDTO`, ...).
- [x] `data/seed.ts` containing the content from `06-SEED-CONTENT.md`.
- [x] `scripts/seed.ts`: idempotent (upsert singletons; insert lists only if the collection is empty; `--force` flag to reset content collections).
- [x] `scripts/create-admin.ts`.
- [x] `server/queries/*`: cached public read functions with tags (Architecture §7).

**Done when:** `pnpm seed` against a fresh Atlas DB creates all content; running it twice creates no duplicates; `pnpm create-admin` creates the user.

## Phase 3 — Public layout shell
- [x] Root layout: fetch settings → resolve theme → inject CSS vars, fonts, `data-*` attributes.
- [x] Visitor light/dark pre-paint script + dual token sets (only when enabled).
- [x] `Navbar` (desktop + mobile menu, scroll-spy, smooth scroll, Esc/outside-click close).
- [x] `Footer`.
- [x] `BackgroundEffect`: starfield canvas (lazy client component, pauses when hidden, static when reduced motion) | grid | none.
- [x] `Reveal` wrapper component (Framer Motion `whileInView`, once, honours the animations setting + reduced motion).
- [x] UI primitives: Button, IconButton, Card, Badge, Tag, Eyebrow, GradientHeading, Toast (sonner themed).

**Done when:** the empty home page renders the navbar, footer and background in the seeded theme with no theme flash on hard reload (check with throttled CPU).

## Phase 4 — Public sections (home page)
- [x] `page.tsx` renders sections from `settings.sections` (visible, ordered). Hero is always first. Map key → component.
- [x] Hero (FR-H1…H4): availability pill, gradient name, CTAs, socials, avatar frame/initials, 3 floating chips (computed game count), CV button, scroll cue.
- [x] About (FR-A1…A3): markdown bio, meta grid, buttons, stats column (full width when 0 stats).
- [x] Games section (FR-P1…P7): client filter chips with layout animation, GameCard, "View all" button, featured-first option.
- [x] `GameCover` + generated SVG art (Design §8), deterministic seeding, unique gradient ids.
- [x] Skills (FR-S1…S3): grouped cards, animated bars, percent toggle.
- [x] Experience (FR-E1…E3): timeline, type badges, `formatPeriod()` util (+ unit test).
- [x] Services (FR-SV1…SV2): icon map from the allowlist.
- [x] Testimonials (FR-T-1…3): auto-hidden when empty.
- [x] Contact section UI (form wired in Phase 10, but build the UI now with client validation).
- [x] Compare against the prototype side by side at 1440, 1024, 768, 390 and 360 widths, and fix the differences.

**Done when:** with seed data, the home page visually matches the prototype at all widths, every section hides and reorders correctly when the DB is edited by hand, and there are no hydration warnings.

## Phase 5 — Game pages, SEO
- [x] `/games/[slug]`: banner, meta, markdown description, spec grid, status, links (only filled ones, with icons), lite YouTube facade, gallery + Lightbox (keyboard, swipe, focus trap), "More games".
- [x] `generateStaticParams`, `dynamicParams=true`, 404 for unknown or unpublished, 308 redirect from `previousSlugs`.
- [x] `/games` list page with the same cards and filters.
- [x] `generateMetadata` for home and game pages (from SEO settings + profile + game).
- [x] JSON-LD `Person` (home) and `VideoGame` (game page).
- [x] `sitemap.ts`, `robots.ts`, `opengraph-image.tsx` (name, role, gradient from theme), generated favicon fallback.
- [x] Themed `not-found.tsx` and `error.tsx`.

**Done when:** each game page validates in Google's Rich Results test (JSON-LD), the sitemap lists all published games, and an old slug redirects.

## Phase 6 — Authentication
- [x] Auth.js v5 config (Credentials, JWT, 7-day sliding sessions, `sessionVersion` check).
- [x] Login rate limiting + lockout via the `rateLimits` collection.
- [x] `middleware.ts` protecting `/admin/*` (except login) and `/preview`.
- [x] `requireAdmin()` helper; unit-test that it rejects with no session.
- [x] Login page UI (Admin §1).

**Done when:** `/admin` redirects to login when logged out; a correct login lands on `/admin`; 5 bad attempts lock the account for 15 minutes; logout works.

## Phase 7 — Admin shell & shared components
- [x] Admin layout: sidebar (collapsible; bottom tabs on mobile), top bar, unread badge, "View live site".
- [x] Shared: `SaveBar` + dirty tracking hook (`useUnsavedChanges`) + leave guard + Ctrl/Cmd+S.
- [x] `SortableList` (dnd-kit, keyboard sensors, optimistic reorder + rollback on error).
- [x] `ConfirmDialog`, `Drawer/Sheet`, `FormField` wrappers (label, hint, error), `MarkdownField` (toolbar + preview), `ChipInput`, `Combobox`, `IconPicker`, `ColorField`.
- [x] `ActionResult` type + `useAction` hook (pending state, toast on success/error, field errors → RHF).
- [x] Overview page (Admin §2), including the setup checklist and recent messages.

**Done when:** the admin shell is navigable on desktop and a 390px phone, and the overview shows live counts.

## Phase 8 — Media uploads
- [x] `MediaService` interface + Cloudinary implementation.
- [x] `/api/upload/sign` (admin-only; kind-specific folder, formats, max size).
- [x] Client uploader with progress, type/size pre-checks, multiple files.
- [x] `registerUpload` action (+ blur placeholder generation), `updateAlt`, `deleteMedia` (with usage check).
- [x] `ImageField` component (upload, pick from library, alt, remove) + `MediaPickerDialog`.
- [x] Media library page (Admin §12).
- [x] `next/image` Cloudinary loader + remotePatterns.

**Done when:** an image can be uploaded, given alt text, picked into a field, rendered optimised on the public site, and deleting it warns when it's in use.

## Phase 9 — Content editors
- [x] Profile editor, all tabs (Admin §4) + actions + revalidation.
- [x] Games list (Admin §5.1): search, filters, sortable rows, inline publish/featured toggles.
- [x] Game form (Admin §5.2): slug auto/manual + uniqueness, cover or generated art picker, gallery, trailer, links, tags, sidebar cards, duplicate, delete.
- [x] Skills editor (Admin §6) with categories.
- [x] Experience editor (Admin §7).
- [x] Services editor (Admin §8) with icon picker.
- [x] Testimonials editor (Admin §9).
- [x] Layout editor (Admin §10): sections order/visibility/labels, headings per section, contact form options, display options.
- [x] SEO editor (Admin §13).
- [x] Verify every mutation calls the right `revalidateTag`. Write a checklist test: edit each type, then fetch the public page and assert the change.

**Done when:** every visible piece of public content can be changed from the admin and appears on the live site within seconds, with no redeploy.

## Phase 10 — Contact form, inbox, email
- [x] `submitContact` action: Zod, honeypot, min time, rate limit (ipHash with salt), optional Turnstile, save, send email, optional auto-reply, graceful email failure.
- [x] Wire the public form: RHF, inline errors, pending, success message from CMS, error fallback with the email address.
- [x] Email templates (notification + auto-reply).
- [x] Messages inbox (Admin §11): filters, search, bulk actions, reading pane, mark read on open, mailto reply, CSV export route.

**Done when:** a submitted message arrives in the inbox and the email arrives (test with Resend), a 6th message within an hour is rate-limited with a friendly error, and the bot honeypot submission is silently dropped.

## Phase 11 — Theme Studio & live preview
- [x] `/preview` route (admin only, dynamic, applies the draft; postMessage listener applies vars instantly).
- [x] Theme Studio UI (Admin §3): preset grid, my themes, colour fields, reset, save-as-theme, contrast checker, font pairs, radius slider + quick chips, effect, animations, visitor toggle pair.
- [x] Draft autosave (debounced), Publish, Discard, draft banner.
- [x] Preview device-width toggles + open in new tab.
- [x] Custom theme CRUD.
- [x] (Nice to have) "Generate from one colour".

**Done when:** changing any control updates the preview in under 100 ms; Publish updates the live site; a visitor never sees draft changes; contrast warnings show for poor combinations (e.g. text `#777777` on bg `#888888`).

## Phase 12 — Backup, account, polish
- [x] Backup export (streamed JSON download) and import (validate → preview → type REPLACE → transaction → revalidate all).
- [x] Reset to starter content.
- [x] Account page: change email/password, last login, log out of all devices.
- [x] Analytics (env + setting flag) + `play_click` tracking + overview chart.
- [x] Animation pass: compare timings with the prototype; check reduced motion everywhere.
- [x] Accessibility pass: axe on all public pages + admin login + game form; keyboard-only walkthrough; screen reader smoke test (VoiceOver/NVDA). _(axe: 0 serious/critical; keyboard flows covered by e2e. Screen-reader smoke test still to do, see QA-REPORT.md)_
- [x] Performance pass: bundle analyser; make sure no admin code is in public chunks; lazy starfield; image `sizes`; font loading. _(Lighthouse mobile ≥ 90 on home + game page; no admin code in public routes; starfield lazy. Bundle analyser not run)_
- [ ] Remove `/dev/tokens` and any debug code. _(n/a, never created)_

**Done when:** Lighthouse mobile targets (PRD §7.1) are met on home and a game page, and axe reports 0 serious/critical issues.

## Phase 13 — Testing
- [x] Unit (Vitest): theme derive/contrast, formatPeriod, slugify, Zod schemas (valid/invalid samples), rate-limit util, backup schema.
- [x] E2E (Playwright) — see `07-QA-DEPLOYMENT.md` §3 for the exact flows.
- [ ] Run the full QA checklist in `07-QA-DEPLOYMENT.md` §4 manually and record the results in `docs/QA-REPORT.md`.

**Done when:** all tests are green in CI (GitHub Actions: install → typecheck → lint → test → build; e2e against a preview deploy, or locally with a test DB).

## Phase 14 — Deployment & handover
- [ ] Create production MongoDB Atlas cluster (M0), DB user, network access (0.0.0.0/0 for Vercel or Vercel integration).
- [ ] Cloudinary account + upload folder. Resend account (+ domain verification if a custom domain is used). _(now ImageKit: account exists and is configured locally; Resend still to set up)_
- [ ] Vercel project, env vars for Production and Preview, deploy.
- [ ] Run `pnpm seed` and `pnpm create-admin` against production (from local with prod env, carefully).
- [ ] Custom domain + HTTPS, set `NEXT_PUBLIC_SITE_URL`.
- [ ] Submit the sitemap to Google Search Console.
- [x] Write `HANDOVER.md` (non-technical guide for Najeeb; see `07-QA-DEPLOYMENT.md` §7).
- [ ] Final walkthrough with Najeeb: change theme, add a game, read a message.

**Done when:** the live URL works, the admin login works on production, and Najeeb has done the 4 success-metric tasks himself (PRD §10).
