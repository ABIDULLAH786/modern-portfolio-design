# 01 — Product Requirements Document (PRD)

**Product:** Najeeb Ullah — Game Developer Portfolio with built-in CMS
**Owner (client):** Najeeb Ullah, Mobile Game Developer (itch.io: https://najo98.itch.io)
**Builder:** Abid Ullah, with Claude Code
**Status:** Approved for build
**Visual reference:** `docs/reference/prototype.html`

---

## 1. Background & problem

Najeeb publishes mobile and web games (currently on itch.io) and needs a professional portfolio to win freelance work and job offers. His key requirement:

> "It must work out of the box with full controls, so I don't have to ask a developer every time to add or change something."

So the site needs:
1. A modern, polished, game-developer-flavoured public portfolio.
2. A complete admin dashboard where he can edit **every piece of content**, **upload images**, **reorder and hide sections**, and **change the whole colour theme** from a set of modern presets or his own custom colours.

## 2. Goals & non-goals

### Goals
- G1. Show Najeeb's games in an attractive way that sends visitors to play them (itch.io, Play Store, App Store, web build).
- G2. Make it easy for clients and recruiters to understand his skills and contact him.
- G3. Give Najeeb **100% self-service control**: content, media, layout, theme, SEO.
- G4. Make it fast, accessible, SEO-friendly and mobile-first.
- G5. Keep running costs at zero or near zero (Vercel hobby, Atlas free, Cloudinary free, Resend free tier).

### Non-goals (v1)
- A blog. It can be added later; the architecture should not block it.
- Multi-user admin with roles. There is one admin.
- Multi-language content. Use English only, but keep strings in the DB so translation can be added later.
- E-commerce or selling games directly.
- Embedding playable WebGL builds inside the site. v1 links out to itch.io; see the future ideas in §11.

## 3. Users & personas

| Persona | Needs | Primary actions |
|---|---|---|
| **Visitor: client / studio** | Judge quality fast, see shipped games, contact | Browse games, open details, click "Play", send message |
| **Visitor: recruiter** | Skills, experience, CV, contact | Read skills/experience, download CV, check socials |
| **Visitor: player** | Find and play the games | Click game, then play on itch.io / store |
| **Admin: Najeeb** | Update everything without code; non-technical-friendly UI | Log in, edit content, upload images, change theme, read messages |

## 4. Information architecture

### Public routes
| Route | Description |
|---|---|
| `/` | One-page portfolio. Sections appear in the order and visibility set in the CMS. |
| `/games/[slug]` | Detail page per game (SEO-indexable). Its content matches the prototype's game modal, expanded. |
| `/games` | Optional full games list. Required only if there are more than 9 games; otherwise the home section is enough. Build it anyway; it's cheap. |
| `/sitemap.xml`, `/robots.txt` | Generated automatically |
| `/opengraph-image` | Dynamic OG image (name, role, theme colours) |
| `404` | Themed not-found page with a "back home" button |

### Admin routes (all protected except login)
`/admin/login`, `/admin` (overview), `/admin/theme`, `/admin/profile`, `/admin/games`, `/admin/games/new`, `/admin/games/[id]`, `/admin/skills`, `/admin/experience`, `/admin/services`, `/admin/testimonials`, `/admin/layout`, `/admin/messages`, `/admin/media`, `/admin/seo`, `/admin/backup`, `/admin/account`. Full spec: `04-ADMIN-CMS.md`.

## 5. Functional requirements: public site

Each requirement has an ID. Acceptance criteria (AC) must be testable.

### 5.1 Global layout

**FR-G1 Navigation bar**
- Floating "pill" navbar, fixed at the top, with a glass/blur background (see prototype).
- Left: logo mark (initials in a gradient square) and full name. Clicking it scrolls to the top.
- Centre/right: one link per **visible** section, in CMS order, using the CMS section label.
- Scroll-spy highlights the active section link.
- Right: theme-mode toggle (light/dark), shown only if the admin enabled "Allow visitors to switch light/dark" (see FR-T6).
- Mobile (< 900px): hamburger opens a dropdown panel; the panel closes on link click, Esc, or outside click.
- AC: Hiding a section in the CMS removes its nav link. Reordering sections reorders the links. Links are keyboard accessible.

**FR-G2 Footer**
- Copyright line with the current year and name/role, plus social links.
- No public "Admin" link in production. The admin uses `/admin` directly. (The prototype has one only for demo purposes.)

**FR-G3 Background effect**
- One of: `starfield` (animated canvas particles in theme colours), `grid` (CSS grid lines with a radial mask), or `none`. Chosen in the CMS.
- Respect `prefers-reduced-motion`: the starfield is drawn static.
- Pause the canvas animation when the tab is hidden (`visibilitychange`).
- AC: The effect never blocks clicks (`pointer-events:none`). There are no layout shifts, and the effect costs less than 2 ms per frame on a mid-range phone.

**FR-G4 Scroll-reveal animations**
- Sections and cards fade up when they enter the viewport (staggered).
- They are turned off globally when the admin disables animations or the user prefers reduced motion.

### 5.2 Hero section (always visible, always first)

**FR-H1** Shows: an availability pill (green dot if available, amber if not, plus the badge text), "Hi, I'm {firstName}" with the rest of the name in gradient text, role, tagline, two CTAs ("View my games" scrolls to Games; "Hire me" scrolls to Contact), and social links.
**FR-H2** Right side: a profile photo in a tilted gradient frame. If there is no photo, show initials in gradient text. Three floating "chips" bob gently:
- Chip 1: `{publishedGamesCount} Games · Published` (computed, not typed)
- Chip 2: `{primaryEngine} · Main engine` (a profile field; defaults to the first skill)
- Chip 3: `{chip3Title} · {chip3Subtitle}` (editable; default "Mobile-first · Android · Web")
**FR-H3** Optional "Download CV" button, shown only if a CV PDF has been uploaded in Profile.
**FR-H4** Show a scroll cue on desktop only.
- AC: The hero fills at least 100vh on desktop. On mobile, the photo goes on top and the text below. LCP is under 2.5 s on 4G.

### 5.3 About section

**FR-A1** Heading (editable), bio (markdown, multiple paragraphs), and a meta grid: Location, Status/availability, Focus (role), Email.
**FR-A2** Buttons: "Get in touch" (scrolls to Contact) and an optional external profile button (label and URL editable; default "itch.io profile").
**FR-A3** Stats column: 0–6 stat cards (big value + label), editable and reorderable.
- AC: With 0 stats, the bio card spans the full width.

### 5.4 Games (Projects) section

**FR-P1** Heading and subtitle are editable.
**FR-P2** Genre filter chips: "All" plus the unique genres of the **published** games. Clicking one filters client-side with a smooth layout animation.
**FR-P3** Game card: cover image (or generated SVG art when there is no image, see Design §8), genre badge, "★ Featured" badge if featured, title, short description (max 2–3 lines, clamped), tags, platforms, and a "Details →" affordance.
**FR-P4** Order is manual (drag & drop in the CMS). Featured games can optionally be pinned first (CMS toggle).
**FR-P5** Clicking a card goes to `/games/[slug]`. (The prototype uses a modal; production uses a real page for SEO and sharing. Optional enhancement: open it as an intercepting-route modal while keeping the URL.)
**FR-P6** Unpublished (draft) games never appear publicly.
**FR-P7** Home shows at most N games (CMS setting, default 6). If there are more, show a "View all games" button linking to `/games`.
- AC: Adding a game in the CMS makes it appear on the live site within a few seconds of saving (on-demand revalidation). Unpublishing removes it.

### 5.5 Game detail page `/games/[slug]`

**FR-D1** Contents: a large cover/hero banner, title, genre, tags, full description (markdown), a spec grid (Genre, Platforms, Engine, Release year, Status: Released / In development / Prototype), and a screenshot gallery with a lightbox (keyboard: ←/→/Esc).
**FR-D2** Optional trailer: a YouTube URL, embedded lite (click-to-load facade, so no YouTube JS is loaded before the click).
**FR-D3** Store/play buttons, each shown only if its URL is set: itch.io, Google Play, App Store, Web/WebGL, Steam, Other (custom label).
**FR-D4** "More games" strip with 3 other published games.
**FR-D5** SEO: title `{Game} — {Name}`, a meta description from the short description, an OG image (the cover), and JSON-LD `VideoGame` schema.
- AC: An unknown slug returns 404. When a game's slug changes, the old slug redirects with a 308 (keep `previousSlugs[]`).

### 5.6 Skills section

**FR-S1** Heading and subtitle are editable.
**FR-S2** Skills are grouped into cards by category. Category order is set by the admin (a categories list with order). Within a category, skills are ordered manually.
**FR-S3** Each skill: name and level 0–100 shown as an animated progress bar with a % label. An option to hide percentages globally shows only name chips instead (some developers dislike % bars).
- AC: The bars animate once when they come into view; with reduced motion they appear instantly.

### 5.7 Experience section

**FR-E1** Vertical timeline. Each entry: type badge (Job / Freelance / Education / Game Jam / Achievement), period, role/title, company/organisation, location (optional), description (markdown), optional link.
**FR-E2** Period is derived from start month/year and end month/year or "Present". It can be overridden with free text.
**FR-E3** Order: manual, or automatic newest first (CMS toggle).

### 5.8 Services section

**FR-SV1** Heading and subtitle are editable. A grid of service cards: icon (chosen from a curated lucide icon list), title, description.
**FR-SV2** 0–12 services. Hide the section automatically if there are 0.

### 5.9 Testimonials section (new compared with the prototype)

**FR-T-1** Card carousel or grid: quote, person name, role/company, optional avatar, optional link.
**FR-T-2** **Hidden by default and seeded empty.** Only real testimonials may be added. Never seed fake ones.
**FR-T-3** Hide the section automatically if there are 0 published testimonials, even when it is set to visible.

### 5.10 Contact section

**FR-C1** Heading and subtitle are editable. Info cards: Email (with a copy button), Location, Availability. Social links.
**FR-C2** Form fields: Name (required, 2–80 chars), Email (required, valid), Project type (select; options editable in CMS), Budget (optional select; can be turned off), Message (required, 10–5000 chars).
**FR-C3** Anti-spam: a hidden honeypot field, a minimum time-to-submit (> 3 s since render), and a rate limit of 5 submissions per IP per hour (store a hashed IP, never the raw IP). Optional Cloudflare Turnstile behind an env flag.
**FR-C4** On submit: (1) save to the `messages` collection, (2) email Najeeb via Resend (subject `New portfolio message from {name}`, with reply-to set to the visitor's email), (3) optionally send the visitor an auto-reply (CMS toggle and editable text).
**FR-C5** UX: inline field errors, a loading state on the button, a success state with an editable message, and an error state with a fallback ("email me directly at …").
- AC: If email sending fails, the message is still saved and the visitor still sees success. The failure is logged and shown in the admin inbox as "email not delivered".

### 5.11 Theming (visitor side)

**FR-T1** The theme the admin selected is rendered **server-side** as CSS variables in `<html style>` or a `<style>` tag, so there is no flash of the wrong theme.
**FR-T2** Theme parameters: preset, colour overrides (primary, accent, background, surface, text), font pair, corner radius, background effect, animations on/off. See Design System.
**FR-T3** Text on primary-coloured buttons is chosen automatically (dark or light) by contrast.
**FR-T4** Derived tokens (surface-2, border, muted) are computed from the base colours.
**FR-T5** Theme changes appear on the live site after "Publish theme" in the admin (on-demand revalidation).
**FR-T6** Optional visitor light/dark toggle: the admin picks a **dark theme** and a **light theme** pair. Visitors can switch between the pair, and their choice is remembered in localStorage. Default is the admin's primary choice. A visitor's toggle **never** changes the saved site theme. (The prototype's shuffle button that cycles all themes is a demo only. Do not ship it.)

## 6. Functional requirements: Admin CMS (summary)

Detailed in `04-ADMIN-CMS.md`. Must include:

| ID | Feature |
|---|---|
| FR-ADM-1 | Secure login (email + password), logout, session ≥ 7 days, "change password" |
| FR-ADM-2 | Dashboard overview: counts, unread messages, quick links, "View live site" |
| FR-ADM-3 | **Theme Studio**: 9 presets, custom colour pickers, contrast warnings, font pair, radius, background effect, animations, light/dark pair, save custom themes, **live preview**, draft vs **Publish** |
| FR-ADM-4 | Profile editor: identity, photo, CV upload, contact, availability, hero chips, socials (CRUD + reorder), stats (CRUD + reorder) |
| FR-ADM-5 | Games: list with search/filter/status, drag reorder, create/edit/duplicate/delete, cover, gallery, links, markdown description, publish toggle, featured toggle, slug management |
| FR-ADM-6 | Skills: categories (CRUD + reorder) and skills (CRUD + reorder + level slider) |
| FR-ADM-7 | Experience: CRUD + reorder, type, dates/present, markdown |
| FR-ADM-8 | Services: CRUD + reorder + icon picker |
| FR-ADM-9 | Testimonials: CRUD + reorder + publish toggle |
| FR-ADM-10 | Layout: show/hide, reorder, rename sections; edit all section headings/subtitles |
| FR-ADM-11 | Messages inbox: list, read/unread, archive, delete, reply via mailto, export CSV |
| FR-ADM-12 | Media library: upload, browse, alt text, delete (with "in use" warning) |
| FR-ADM-13 | SEO: site title, description, keywords, OG image, favicon, Google Search Console verification, analytics toggle |
| FR-ADM-14 | Backup: export all content as JSON (download), import JSON (with validation + preview + confirm), reset to seed |
| FR-ADM-15 | Every editor: unsaved-changes guard, Save button with loading/success toast, validation errors inline, "View on site" link |

## 7. Non-functional requirements

### 7.1 Performance
- NFR-P1: Public pages are statically rendered (ISR) with on-demand revalidation by tag. No DB call per visitor request.
- NFR-P2: Lighthouse mobile Performance ≥ 90, LCP < 2.5 s, CLS < 0.05, INP < 200 ms.
- NFR-P3: All images go through `next/image` with Cloudinary loader, responsive `sizes`, AVIF/WebP, blur placeholder.
- NFR-P4: Fonts are self-hosted via `next/font/google` with `display: swap`. All 4 pairs are declared, but only the selected pair's CSS variables are applied and preloaded (see Architecture §8). Unused font files are never requested by the browser.
- NFR-P5: JS on the public home page is kept small: no admin code in public bundles; the starfield is lazy-loaded.

### 7.2 Accessibility (WCAG 2.1 AA)
- Semantic landmarks (`header/nav/main/section/footer`), one `h1`, and a logical heading order.
- All interactive elements are keyboard reachable with a visible focus ring (`--primary` outline).
- Colour contrast ≥ 4.5:1 for body text. The Theme Studio warns when a custom colour breaks this.
- Alt text is required for uploaded images (the media library asks for it).
- Modals and lightboxes trap focus and close on Esc. Focus returns to the trigger.
- `prefers-reduced-motion` is respected everywhere.

### 7.3 SEO
- Per-page metadata, canonical URLs, sitemap, robots, OG/Twitter cards.
- JSON-LD: `Person` on home, `VideoGame` on game pages.
- Clean slugs and old-slug redirects.

### 7.4 Security
- Admin routes protected in middleware **and** re-checked in every server action (defence in depth).
- Passwords hashed with bcrypt (cost 12). Login is rate-limited (5 failed attempts per 15 min per IP + email).
- Zod validation on every input. Markdown is sanitised on render.
- Uploads: signed Cloudinary uploads; types restricted to jpg/png/webp/gif/avif (images, ≤ 8 MB) and pdf (CV, ≤ 5 MB).
- Security headers: CSP, X-Frame-Options DENY (except the preview route, same-origin), Referrer-Policy, Permissions-Policy.
- No secrets in the client bundle. Use `server-only` imports in server modules.
- CSRF: rely on Next.js server actions' built-in origin check, and keep API routes same-origin only.

### 7.5 Reliability & data
- Content survives deploys (stored in MongoDB, not files).
- Backup export is available at any time. Recommend a monthly export in HANDOVER.md.
- Seed script is idempotent.

### 7.6 Browser support
Latest 2 versions of Chrome, Edge, Firefox and Safari, iOS Safari 16+, and Android Chrome. `color-mix()` is required, so add a fallback for derived tokens by computing them in JS on the server and emitting hex values (see Design §3). Do not rely on `color-mix` alone.

### 7.7 Responsiveness
Breakpoints: 360, 480, 768, 900, 1200, 1440. Test every section at 360px wide.

## 8. Content rules
- The public site must never show placeholder text like "Lorem ipsum" or "your.email@example.com" in production. The admin overview shows a **"Setup checklist"** that flags fields still holding seed/placeholder values (see Admin §2).
- Never invent testimonials, download counts or ratings.

## 9. Analytics (optional, env-flagged)
- Vercel Web Analytics (privacy-friendly, no cookie banner needed).
- Custom event: click on game store/play buttons (`play_click` with game slug and store). Show the counts per game on the admin overview if analytics are enabled.

## 10. Success metrics
- Najeeb can complete these without help, in under 10 minutes total: change theme, add a new game with cover and screenshots, edit bio, hide a section.
- Lighthouse targets met.
- 0 critical a11y violations (axe).

## 11. Future ideas (not v1; architecture should not block them)
- Blog / devlog with markdown posts.
- Embedded WebGL builds via itch.io iframe embeds (needs CSP allowance).
- Urdu translation.
- Auto-import game metadata from an itch.io URL.
- Multiple portfolio "profiles" (game dev vs freelance).

## 12. Open questions for Najeeb (fill these before or during the build)
1. Real email address, location wording, and social links (GitHub? LinkedIn? X? YouTube? Discord?).
2. Engine(s) actually used for each game, release years, real descriptions, and screenshots.
3. Google Play / App Store links, if any.
4. Profile photo and CV PDF.
5. Real work history / education.
6. Preferred default theme (the prototype default is "Neon Arcade").
7. Custom domain name (e.g. `najeebullah.dev`).
