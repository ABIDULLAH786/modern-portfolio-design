# 05 — Implementation Plan (A → Z)

**How to use this file (Claude Code):** Work top to bottom. Tick each box (`- [x]`) as soon as the task is done. Don't start a phase until the previous phase's **Done when** list is fully satisfied and `pnpm typecheck && pnpm lint && pnpm build` passes. Commit at the end of each phase.

Rough size: 15 phases, ~120 tasks.

---

## Phase 0 — Project setup
- [ ] Check the current stable versions of Next.js, React, Tailwind, Auth.js, Mongoose, Zod and Framer Motion.
- [ ] `pnpm create next-app` with TypeScript, App Router, `src/`, ESLint, Tailwind, `@/*` alias.
- [ ] Enable TS `strict`, `noUncheckedIndexedAccess`.
- [ ] Add Prettier (+ tailwind plugin), `.editorconfig`, `.nvmrc` (current LTS Node).
- [ ] Install deps: mongoose, zod, next-auth@beta (v5), bcryptjs, react-hook-form, @hookform/resolvers, motion (framer-motion), @dnd-kit/core + sortable, lucide-react, react-markdown, rehype-sanitize, remark-gfm, cloudinary, resend, react-colorful, culori (or custom color utils), clsx, tailwind-merge, sonner (toasts), Radix primitives as needed.
- [ ] Dev deps: vitest, @testing-library/react, playwright, @axe-core/playwright, tsx.
- [ ] Create the scripts in `package.json`: dev, build, start, lint, typecheck, test, test:e2e, seed, create-admin.
- [ ] Create `.env.example` (Architecture §12) and `src/env.ts` (Zod-validated env).
- [ ] Create the folder structure from Architecture §2 (empty index files where useful).
- [ ] Copy `docs/reference/prototype.html` into place (already there) and create `docs/DECISIONS.md`.
- [ ] `git init`, `.gitignore` (include `.env*.local`), first commit.

**Done when:** `pnpm dev` runs, `pnpm build` passes, and env validation fails with a clear message when a required var is missing.

## Phase 1 — Theme engine & design tokens
- [ ] `lib/theme/presets.ts`: 9 presets exactly as in Design §4, typed `ThemeBase`.
- [ ] `lib/theme/derive.ts`: `mix()`, `withAlpha()`, `relativeLuminance()`, `contrastRatio()`, `deriveTokens()` (Design §3).
- [ ] Unit tests for derive.ts: onPrimary picks dark text for `#A3E635`, light for `#7C5CFF`; contrast of `#ECECF8` on `#0B0B14` > 4.5.
- [ ] `lib/theme/fonts.ts`: 4 pairs via next/font (Architecture §8 point 6).
- [ ] `lib/theme/to-css-vars.ts`: tokens + radius + fonts → style object/string.
- [ ] Tailwind config: map colours/radius/fonts to the CSS variables (Design §3).
- [ ] Global CSS: base styles, `.reveal` utilities, reduced-motion rules, focus ring, selection colour, scrollbar styling.
- [ ] A temporary `/dev/tokens` page that shows all tokens for every preset (delete it at the end of Phase 12).

**Done when:** switching a hard-coded preset id in the root layout recolours the token page correctly, and unit tests pass.

## Phase 2 — Database, models, validation, seed
- [ ] `server/db.ts`: cached Mongoose connection (global cache for dev hot reload).
- [ ] Models per Architecture §3 (settings, profile, games, skillCategories, skills, experiences, services, testimonials, messages, media, customThemes, users, rateLimits) with indexes.
- [ ] Zod schemas in `lib/validation/` for every entity (+ shared primitives: hex, url, slug, mediaRef).
- [ ] DTO types and mappers (`toGameDTO`, ...).
- [ ] `data/seed.ts` containing the content from `06-SEED-CONTENT.md`.
- [ ] `scripts/seed.ts`: idempotent (upsert singletons; insert lists only if the collection is empty; `--force` flag to reset content collections).
- [ ] `scripts/create-admin.ts`.
- [ ] `server/queries/*`: cached public read functions with tags (Architecture §7).

**Done when:** `pnpm seed` against a fresh Atlas DB creates all content; running it twice creates no duplicates; `pnpm create-admin` creates the user.

## Phase 3 — Public layout shell
- [ ] Root layout: fetch settings → resolve theme → inject CSS vars, fonts, `data-*` attributes.
- [ ] Visitor light/dark pre-paint script + dual token sets (only when enabled).
- [ ] `Navbar` (desktop + mobile menu, scroll-spy, smooth scroll, Esc/outside-click close).
- [ ] `Footer`.
- [ ] `BackgroundEffect`: starfield canvas (lazy client component, pauses when hidden, static when reduced motion) | grid | none.
- [ ] `Reveal` wrapper component (Framer Motion `whileInView`, once, honours the animations setting + reduced motion).
- [ ] UI primitives: Button, IconButton, Card, Badge, Tag, Eyebrow, GradientHeading, Toast (sonner themed).

**Done when:** the empty home page renders the navbar, footer and background in the seeded theme with no theme flash on hard reload (check with throttled CPU).

## Phase 4 — Public sections (home page)
- [ ] `page.tsx` renders sections from `settings.sections` (visible, ordered). Hero is always first. Map key → component.
- [ ] Hero (FR-H1…H4): availability pill, gradient name, CTAs, socials, avatar frame/initials, 3 floating chips (computed game count), CV button, scroll cue.
- [ ] About (FR-A1…A3): markdown bio, meta grid, buttons, stats column (full width when 0 stats).
- [ ] Games section (FR-P1…P7): client filter chips with layout animation, GameCard, "View all" button, featured-first option.
- [ ] `GameCover` + generated SVG art (Design §8), deterministic seeding, unique gradient ids.
- [ ] Skills (FR-S1…S3): grouped cards, animated bars, percent toggle.
- [ ] Experience (FR-E1…E3): timeline, type badges, `formatPeriod()` util (+ unit test).
- [ ] Services (FR-SV1…SV2): icon map from the allowlist.
- [ ] Testimonials (FR-T-1…3): auto-hidden when empty.
- [ ] Contact section UI (form wired in Phase 10, but build the UI now with client validation).
- [ ] Compare against the prototype side by side at 1440, 1024, 768, 390 and 360 widths, and fix the differences.

**Done when:** with seed data, the home page visually matches the prototype at all widths, every section hides and reorders correctly when the DB is edited by hand, and there are no hydration warnings.

## Phase 5 — Game pages, SEO
- [ ] `/games/[slug]`: banner, meta, markdown description, spec grid, status, links (only filled ones, with icons), lite YouTube facade, gallery + Lightbox (keyboard, swipe, focus trap), "More games".
- [ ] `generateStaticParams`, `dynamicParams=true`, 404 for unknown or unpublished, 308 redirect from `previousSlugs`.
- [ ] `/games` list page with the same cards and filters.
- [ ] `generateMetadata` for home and game pages (from SEO settings + profile + game).
- [ ] JSON-LD `Person` (home) and `VideoGame` (game page).
- [ ] `sitemap.ts`, `robots.ts`, `opengraph-image.tsx` (name, role, gradient from theme), generated favicon fallback.
- [ ] Themed `not-found.tsx` and `error.tsx`.

**Done when:** each game page validates in Google's Rich Results test (JSON-LD), the sitemap lists all published games, and an old slug redirects.

## Phase 6 — Authentication
- [ ] Auth.js v5 config (Credentials, JWT, 7-day sliding sessions, `sessionVersion` check).
- [ ] Login rate limiting + lockout via the `rateLimits` collection.
- [ ] `middleware.ts` protecting `/admin/*` (except login) and `/preview`.
- [ ] `requireAdmin()` helper; unit-test that it rejects with no session.
- [ ] Login page UI (Admin §1).

**Done when:** `/admin` redirects to login when logged out; a correct login lands on `/admin`; 5 bad attempts lock the account for 15 minutes; logout works.

## Phase 7 — Admin shell & shared components
- [ ] Admin layout: sidebar (collapsible; bottom tabs on mobile), top bar, unread badge, "View live site".
- [ ] Shared: `SaveBar` + dirty tracking hook (`useUnsavedChanges`) + leave guard + Ctrl/Cmd+S.
- [ ] `SortableList` (dnd-kit, keyboard sensors, optimistic reorder + rollback on error).
- [ ] `ConfirmDialog`, `Drawer/Sheet`, `FormField` wrappers (label, hint, error), `MarkdownField` (toolbar + preview), `ChipInput`, `Combobox`, `IconPicker`, `ColorField`.
- [ ] `ActionResult` type + `useAction` hook (pending state, toast on success/error, field errors → RHF).
- [ ] Overview page (Admin §2), including the setup checklist and recent messages.

**Done when:** the admin shell is navigable on desktop and a 390px phone, and the overview shows live counts.

## Phase 8 — Media uploads
- [ ] `MediaService` interface + Cloudinary implementation.
- [ ] `/api/upload/sign` (admin-only; kind-specific folder, formats, max size).
- [ ] Client uploader with progress, type/size pre-checks, multiple files.
- [ ] `registerUpload` action (+ blur placeholder generation), `updateAlt`, `deleteMedia` (with usage check).
- [ ] `ImageField` component (upload, pick from library, alt, remove) + `MediaPickerDialog`.
- [ ] Media library page (Admin §12).
- [ ] `next/image` Cloudinary loader + remotePatterns.

**Done when:** an image can be uploaded, given alt text, picked into a field, rendered optimised on the public site, and deleting it warns when it's in use.

## Phase 9 — Content editors
- [ ] Profile editor, all tabs (Admin §4) + actions + revalidation.
- [ ] Games list (Admin §5.1): search, filters, sortable rows, inline publish/featured toggles.
- [ ] Game form (Admin §5.2): slug auto/manual + uniqueness, cover or generated art picker, gallery, trailer, links, tags, sidebar cards, duplicate, delete.
- [ ] Skills editor (Admin §6) with categories.
- [ ] Experience editor (Admin §7).
- [ ] Services editor (Admin §8) with icon picker.
- [ ] Testimonials editor (Admin §9).
- [ ] Layout editor (Admin §10): sections order/visibility/labels, headings per section, contact form options, display options.
- [ ] SEO editor (Admin §13).
- [ ] Verify every mutation calls the right `revalidateTag`. Write a checklist test: edit each type, then fetch the public page and assert the change.

**Done when:** every visible piece of public content can be changed from the admin and appears on the live site within seconds, with no redeploy.

## Phase 10 — Contact form, inbox, email
- [ ] `submitContact` action: Zod, honeypot, min time, rate limit (ipHash with salt), optional Turnstile, save, send email, optional auto-reply, graceful email failure.
- [ ] Wire the public form: RHF, inline errors, pending, success message from CMS, error fallback with the email address.
- [ ] Email templates (notification + auto-reply).
- [ ] Messages inbox (Admin §11): filters, search, bulk actions, reading pane, mark read on open, mailto reply, CSV export route.

**Done when:** a submitted message arrives in the inbox and the email arrives (test with Resend), a 6th message within an hour is rate-limited with a friendly error, and the bot honeypot submission is silently dropped.

## Phase 11 — Theme Studio & live preview
- [ ] `/preview` route (admin only, dynamic, applies the draft; postMessage listener applies vars instantly).
- [ ] Theme Studio UI (Admin §3): preset grid, my themes, colour fields, reset, save-as-theme, contrast checker, font pairs, radius slider + quick chips, effect, animations, visitor toggle pair.
- [ ] Draft autosave (debounced), Publish, Discard, draft banner.
- [ ] Preview device-width toggles + open in new tab.
- [ ] Custom theme CRUD.
- [ ] (Nice to have) "Generate from one colour".

**Done when:** changing any control updates the preview in under 100 ms; Publish updates the live site; a visitor never sees draft changes; contrast warnings show for poor combinations (e.g. text `#777777` on bg `#888888`).

## Phase 12 — Backup, account, polish
- [ ] Backup export (streamed JSON download) and import (validate → preview → type REPLACE → transaction → revalidate all).
- [ ] Reset to starter content.
- [ ] Account page: change email/password, last login, log out of all devices.
- [ ] Analytics (env + setting flag) + `play_click` tracking + overview chart.
- [ ] Animation pass: compare timings with the prototype; check reduced motion everywhere.
- [ ] Accessibility pass: axe on all public pages + admin login + game form; keyboard-only walkthrough; screen reader smoke test (VoiceOver/NVDA).
- [ ] Performance pass: bundle analyser; make sure no admin code is in public chunks; lazy starfield; image `sizes`; font loading.
- [ ] Remove `/dev/tokens` and any debug code.

**Done when:** Lighthouse mobile targets (PRD §7.1) are met on home and a game page, and axe reports 0 serious/critical issues.

## Phase 13 — Testing
- [ ] Unit (Vitest): theme derive/contrast, formatPeriod, slugify, Zod schemas (valid/invalid samples), rate-limit util, backup schema.
- [ ] E2E (Playwright) — see `07-QA-DEPLOYMENT.md` §3 for the exact flows.
- [ ] Run the full QA checklist in `07-QA-DEPLOYMENT.md` §4 manually and record the results in `docs/QA-REPORT.md`.

**Done when:** all tests are green in CI (GitHub Actions: install → typecheck → lint → test → build; e2e against a preview deploy, or locally with a test DB).

## Phase 14 — Deployment & handover
- [ ] Create production MongoDB Atlas cluster (M0), DB user, network access (0.0.0.0/0 for Vercel or Vercel integration).
- [ ] Cloudinary account + upload folder. Resend account (+ domain verification if a custom domain is used).
- [ ] Vercel project, env vars for Production and Preview, deploy.
- [ ] Run `pnpm seed` and `pnpm create-admin` against production (from local with prod env, carefully).
- [ ] Custom domain + HTTPS, set `NEXT_PUBLIC_SITE_URL`.
- [ ] Submit the sitemap to Google Search Console.
- [ ] Write `HANDOVER.md` (non-technical guide for Najeeb; see `07-QA-DEPLOYMENT.md` §7).
- [ ] Final walkthrough with Najeeb: change theme, add a game, read a message.

**Done when:** the live URL works, the admin login works on production, and Najeeb has done the 4 success-metric tasks himself (PRD §10).
