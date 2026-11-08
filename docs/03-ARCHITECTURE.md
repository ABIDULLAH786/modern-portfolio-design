# 03 — Technical Architecture

## 1. High-level overview

```
 Visitor ──► Vercel Edge/CDN ──► Next.js (App Router)
                                   ├─ Public pages (static, ISR, tag-revalidated)
                                   ├─ /admin (dynamic, auth-protected, server actions)
                                   └─ /api (auth, upload signing, contact, preview)
                                          │
              ┌───────────────────────────┼─────────────────────────┐
              ▼                           ▼                         ▼
       MongoDB Atlas (content)     Cloudinary (images, CV)     Resend (email)
```

- Public pages **never** query the DB per request. They are built statically and rebuilt on demand when the admin saves (`revalidateTag`).
- The admin is fully dynamic, and every mutation is a **server action**.
- There is one Next.js app, deployed once. No separate backend service. (NestJS is not needed. Server actions plus Mongoose cover it.)

## 2. Folder structure

```
.
├─ CLAUDE.md
├─ docs/                       # these spec files + DECISIONS.md
├─ public/                     # static fallbacks (favicon default, og fallback)
├─ scripts/
│  ├─ seed.ts                  # pnpm seed
│  └─ create-admin.ts          # pnpm create-admin
├─ src/
│  ├─ app/
│  │  ├─ (site)/
│  │  │  ├─ layout.tsx         # injects theme CSS vars + fonts, Navbar, Footer, background FX
│  │  │  ├─ page.tsx           # home: renders sections in CMS order
│  │  │  ├─ games/page.tsx
│  │  │  ├─ games/[slug]/page.tsx
│  │  │  └─ not-found.tsx
│  │  ├─ admin/
│  │  │  ├─ login/page.tsx
│  │  │  └─ (panel)/           # layout with sidebar; protected
│  │  │     ├─ layout.tsx
│  │  │     ├─ page.tsx                    # overview
│  │  │     ├─ theme/page.tsx
│  │  │     ├─ profile/page.tsx
│  │  │     ├─ games/page.tsx
│  │  │     ├─ games/new/page.tsx
│  │  │     ├─ games/[id]/page.tsx
│  │  │     ├─ skills/page.tsx
│  │  │     ├─ experience/page.tsx
│  │  │     ├─ services/page.tsx
│  │  │     ├─ testimonials/page.tsx
│  │  │     ├─ layout-sections/page.tsx    # "Layout" (avoid clash with layout.tsx naming)
│  │  │     ├─ messages/page.tsx
│  │  │     ├─ media/page.tsx
│  │  │     ├─ seo/page.tsx
│  │  │     ├─ backup/page.tsx
│  │  │     └─ account/page.tsx
│  │  ├─ preview/page.tsx      # theme preview target (see §9)
│  │  ├─ api/
│  │  │  ├─ auth/[...nextauth]/route.ts
│  │  │  ├─ upload/sign/route.ts
│  │  │  ├─ backup/export/route.ts
│  │  │  └─ messages/export/route.ts       # CSV
│  │  ├─ sitemap.ts
│  │  ├─ robots.ts
│  │  ├─ opengraph-image.tsx
│  │  └─ layout.tsx            # root html/body
│  ├─ components/
│  │  ├─ site/                 # public components (see Design §7)
│  │  ├─ sections/             # hero.tsx, about.tsx, games.tsx, skills.tsx, ...
│  │  ├─ admin/                # sidebar, save-bar, list-editor, image-field, icon-picker, ...
│  │  └─ ui/                   # primitives (button, input, dialog, switch, slider, ...)
│  ├─ lib/
│  │  ├─ theme/
│  │  │  ├─ presets.ts
│  │  │  ├─ derive.ts          # derived tokens + contrast
│  │  │  ├─ fonts.ts           # next/font declarations
│  │  │  └─ to-css-vars.ts
│  │  ├─ validation/           # zod schemas (shared)
│  │  ├─ utils/                # slugify, format-period, cn, rate-limit
│  │  └─ constants.ts
│  ├─ server/
│  │  ├─ db.ts                 # cached mongoose connection
│  │  ├─ models/               # mongoose models
│  │  ├─ queries/              # cached read functions for public site
│  │  ├─ actions/              # server actions (admin mutations + contact)
│  │  ├─ services/
│  │  │  ├─ media.ts           # Cloudinary wrapper (MediaService interface)
│  │  │  ├─ email.ts           # Resend wrapper
│  │  │  └─ backup.ts
│  │  └─ auth.ts               # Auth.js config + requireAdmin()
│  ├─ data/seed.ts             # default content (from 06-SEED-CONTENT.md)
│  └─ middleware.ts            # protects /admin/*
├─ tests/
│  ├─ unit/
│  └─ e2e/
├─ .env.example
└─ package.json
```

## 3. Data model (Mongoose)

Every document has `createdAt` and `updatedAt` (`timestamps: true`). Every list-type collection has `order: number` for manual sorting. Image fields store a **MediaRef**:

```ts
type MediaRef = { mediaId: string; url: string; width: number; height: number; alt: string; blurDataUrl?: string } | null;
```

### 3.1 `settings` (singleton, `_id: "site"`)
```ts
{
  theme: {
    source: { kind: "preset" | "custom"; id: string };   // preset id or customTheme _id
    overrides: Partial<{ bg; surface; text; primary; accent: string }>;  // hex
    fontPair: "sora" | "grotesk" | "arcade" | "outfit";
    radius: number;                      // 0–32
    effect: "starfield" | "grid" | "none";
    animations: boolean;
    visitorToggle: { enabled: boolean; darkSource: ThemeSource; lightSource: ThemeSource };
  },
  themeDraft: <same shape as theme> | null,   // Theme Studio edits live here until Publish
  sections: Array<{ key: SectionKey; label: string; visible: boolean; order: number }>,
  // SectionKey = "hero"|"about"|"games"|"skills"|"experience"|"services"|"testimonials"|"contact"
  copy: {
    about:        { eyebrow; title; subtitle? },
    games:        { eyebrow; title; subtitle },
    skills:       { eyebrow; title; subtitle },
    experience:   { eyebrow; title; subtitle? },
    services:     { eyebrow; title; subtitle },
    testimonials: { eyebrow; title; subtitle? },
    contact:      { eyebrow; title; subtitle; successMessage; projectTypes: string[];
                    budgetEnabled: boolean; budgetOptions: string[];
                    autoReply: { enabled: boolean; subject: string; body: string } }
  },
  display: {
    gamesOnHome: number;          // default 6
    featuredFirst: boolean;
    showSkillPercent: boolean;
    experienceSort: "manual" | "newest";
  },
  seo: {
    siteTitle; description; keywords: string[];
    ogImage: MediaRef; favicon: MediaRef;
    googleVerification?: string; analyticsEnabled: boolean;
  }
}
```

### 3.2 `profile` (singleton, `_id: "profile"`)
```ts
{
  name; role; tagline; bio /* markdown */;
  avatar: MediaRef; cv: { mediaId; url; fileName } | null;
  location; email; phone?;
  available: boolean; availabilityText; heroBadge; busyBadge;
  primaryEngine; heroChip3: { title; subtitle };
  aboutExternal: { label; url } | null;
  socials: Array<{ id; platform: SocialPlatform; label; url; order }>;
  // SocialPlatform = itch|github|linkedin|x|youtube|discord|instagram|playstore|appstore|website|other
  stats: Array<{ id; value; label; order }>;
}
```

### 3.3 `games`
```ts
{
  title; slug /* unique index */; previousSlugs: string[];
  status: "released" | "in-development" | "prototype";
  published: boolean; featured: boolean; order: number;
  genre; platforms: string[]; engine; releaseYear?: number;
  shortDescription /* ≤ 220 chars */; description /* markdown */;
  tags: string[];
  cover: MediaRef; coverStyle: "space" | "battle" | "jet" | "arcade";
  gallery: MediaRef[];         // ≤ 12
  trailerUrl?: string;         // YouTube only, validated
  links: Array<{ kind: "itch"|"playstore"|"appstore"|"web"|"steam"|"other"; url; label? }>;
}
```
Indexes: `{ slug: 1 } unique`, `{ published: 1, order: 1 }`, `{ previousSlugs: 1 }`.

### 3.4 `skillCategories` & `skills`
```ts
skillCategories: { name; order }
skills: { name; level /* 0–100 */; categoryId: ObjectId; order }
```
Deleting a category: block it if it still has skills, or offer "move skills to…".

### 3.5 `experiences`
```ts
{ type: "job"|"freelance"|"education"|"jam"|"achievement";
  role; organization; location?; url?;
  start: { month?: number; year: number }; end: { month?: number; year: number } | null; current: boolean;
  periodOverride?: string; description /* markdown */; order }
```

### 3.6 `services`
`{ title; icon /* lucide name from allowlist */; description; order }`

### 3.7 `testimonials`
`{ name; role; company?; quote; avatar: MediaRef; url?; published: boolean; order }`

### 3.8 `messages`
```ts
{ name; email; projectType?; budget?; body;
  status: "new" | "read" | "archived";
  emailDelivered: boolean; emailError?: string;
  ipHash; userAgent; createdAt }
```
Index `{ status: 1, createdAt: -1 }`. TTL: none (the admin deletes manually).

### 3.9 `media`
```ts
{ provider: "cloudinary"; publicId; url; format; bytes; width?; height?; alt; kind: "image"|"pdf"; createdAt }
```
Track usage on demand: before deleting, search the settings, profile, games and testimonials documents for `mediaId` and warn if it is in use.

### 3.10 `customThemes`
`{ name; mode; bg; surface; text; primary; accent }`

### 3.11 `users`
`{ email /* unique */; passwordHash; name; lastLoginAt; failedLogins: { count; lockedUntil? } }`

### 3.12 `rateLimits`
`{ key /* e.g. "contact:{ipHash}" */; count; expiresAt }` with a TTL index on `expiresAt`. Used for contact and login throttling, so we don't need Redis. If Upstash env vars are set, use Upstash instead.

## 4. Validation

- One Zod schema per entity in `src/lib/validation/` (`gameSchema`, `profileSchema`, `themeSchema`, ...).
- Hex colour: `/^#[0-9a-fA-F]{6}$/`.
- URL: `z.string().url()` restricted to `http(s)`. YouTube is validated by a host check (`youtube.com`, `youtu.be`).
- Slug: lowercase, `a-z0-9-`, 2–80 chars, auto-generated from the title, editable, unique (checked server-side).
- Strings are trimmed. Set max lengths on every field (title 80, shortDescription 220, description 10k, bio 5k...).
- The server is the source of truth: client validation is only for UX.

## 5. Server actions (admin)

Naming: `src/server/actions/{entity}.ts`. Every action:
```ts
"use server";
export async function updateGame(id: string, input: unknown): Promise<ActionResult<GameDTO>> {
  await requireAdmin();                         // throws/redirects if no session
  const data = gameSchema.parse(input);         // or safeParse → return field errors
  await connectDb();
  // ...mutation...
  revalidateTag("games"); revalidateTag(`game:${slug}`);
  return { ok: true, data: toDTO(doc) };
}
```

Action list:
| File | Actions |
|---|---|
| `theme.ts` | `saveThemeDraft`, `publishTheme`, `discardThemeDraft`, `createCustomTheme`, `renameCustomTheme`, `deleteCustomTheme` |
| `profile.ts` | `updateProfile`, `upsertSocial`, `deleteSocial`, `reorderSocials`, `upsertStat`, `deleteStat`, `reorderStats` |
| `games.ts` | `createGame`, `updateGame`, `duplicateGame`, `deleteGame`, `reorderGames`, `togglePublished`, `toggleFeatured` |
| `skills.ts` | category CRUD + reorder; skill CRUD + reorder |
| `experience.ts` | CRUD + reorder |
| `services.ts` | CRUD + reorder |
| `testimonials.ts` | CRUD + reorder + publish toggle |
| `layout.ts` | `updateSections`, `updateCopy`, `updateDisplay` |
| `messages.ts` | `markRead`, `markUnread`, `archive`, `deleteMessage`, `bulkUpdate` |
| `media.ts` | `registerUpload` (after the signed upload succeeds), `updateAlt`, `deleteMedia` |
| `seo.ts` | `updateSeo` |
| `backup.ts` | `importBackup` (validate → preview diff → apply in a transaction), `resetToSeed` |
| `account.ts` | `changePassword`, `changeEmail` |
| `contact.ts` (public) | `submitContact` (no auth; honeypot + timing + rate limit) |

Reorder actions take an array of ids in the new order and write `order = index` with `bulkWrite`.

## 6. Authentication

- Auth.js v5 with the Credentials provider, using the JWT session strategy (no DB adapter needed). Session max age 7 days, sliding.
- `authorize()`: rate-limit check → find user by email → `bcrypt.compare` → update `lastLoginAt` and reset `failedLogins`. On failure, increment the counter. After 5 failures, lock for 15 min.
- `middleware.ts`: matcher `/admin/:path*` excluding `/admin/login`. Redirect to `/admin/login?next=...` when there's no session.
- `requireAdmin()` helper is used inside **every** admin server action and admin API route.
- `pnpm create-admin` reads `ADMIN_EMAIL` and `ADMIN_PASSWORD` from env and creates or updates the single user.
- Account page: change password (requires the current password; new password ≥ 10 chars).

## 7. Caching & revalidation

Public reads live in `src/server/queries/` and are wrapped:
```ts
export const getPublishedGames = unstable_cache(
  async () => { await connectDb(); return Game.find({ published: true }).sort({ order: 1 }).lean().then(toDTOs); },
  ["published-games"], { tags: ["games"] }
);
```
(If the installed Next.js version recommends the newer `"use cache"` + `cacheTag()` API, use that instead and record it in DECISIONS.md.)

| Tag | Invalidated by |
|---|---|
| `settings` | theme publish, layout, copy, display, seo |
| `profile` | profile, socials, stats |
| `games`, `game:{slug}` | any game mutation (both old and new slug on rename) |
| `skills` | skills/categories |
| `experience` | experience |
| `services` | services |
| `testimonials` | testimonials |

- Home page: `export const revalidate = false` (static) + tags. As a safety net, time-based revalidation of 1 day.
- `generateStaticParams` for `/games/[slug]` from published games, with `dynamicParams = true` so new games work immediately.
- DTO mappers convert `_id` → `id: string` and strip internal fields before data reaches components.

## 8. Theme engine (server-rendered, no flash)

1. `getSettings()` (cached) returns `theme`.
2. `resolveTheme(theme, customThemes)` gives the 6 base colours + mode.
3. `deriveTokens(base)` gives the full token set (Design §3).
4. `toCssVars(tokens, radius, fontPair)` returns a string like `--bg:#0B0B14;--surface:...`.
5. The root layout renders `<html style={cssVars} data-mode={mode} data-effect={effect} data-anim={animations}>`.
6. Fonts: `src/lib/theme/fonts.ts` declares all 4 pairs with `next/font/google` (`variable: '--font-sora'`, etc., `preload: false`, `display: 'swap'`). The root `<html>` gets **only** the selected pair's `.variable` classes, and `--font-head` / `--font-body` point at those variables. Because unused families aren't referenced in CSS, the browser doesn't download them.
7. **Visitor light/dark toggle** (if enabled): the server emits both the dark and light token sets: `:root{...dark}` and `[data-visitor-mode="light"]{...light}`. A tiny inline script in `<head>` reads `localStorage.visitorMode` and sets the attribute **before paint** to avoid a flash. The toggle button just flips the attribute and localStorage.

## 9. Live theme preview in admin

- `/preview` renders the same home page **dynamically** (no cache), allowed only for admin sessions. It applies `themeDraft` if present, plus `?t=` overrides.
- The Theme Studio shows an `<iframe src="/preview">` beside the controls (desktop) or under a "Preview" tab (mobile).
- Instant updates without saving: the studio sends `postMessage({type:"theme-preview", vars})` to the iframe, and a small client script in the preview page applies the CSS vars to `document.documentElement`. Debounce draft saves to the DB by 800ms.
- **Publish** copies `themeDraft` → `theme`, clears the draft, and calls `revalidateTag("settings")`. **Discard** clears the draft.
- CSP: `frame-ancestors 'self'` for `/preview`; `DENY` for everything else.

## 10. Media handling

- `MediaService` interface: `signUpload(kind)`, `delete(publicId)`, `url(publicId, transforms)`. Cloudinary implementation now; S3 possible later.
- Upload flow: the client asks `/api/upload/sign` (admin only) for a signature (folder `najeeb-portfolio/{kind}`, allowed formats, max bytes) → uploads directly to Cloudinary from the browser with a progress bar → calls the `registerUpload` server action with the returned metadata → gets a `MediaRef`.
- On register: generate a tiny blur placeholder (Cloudinary `w_16,e_blur` URL → fetch → base64) and store it as `blurDataUrl`.
- `next/image` with a custom Cloudinary loader (`f_auto,q_auto,w_{width}`). Add `res.cloudinary.com` to `images.remotePatterns`.
- Client-side pre-checks: type and size. Server-side: Cloudinary enforces the signed params.
- CV PDFs: `resource_type: raw`, served via a direct link with `fl_attachment` for download.

## 11. Email

- `email.ts` wraps Resend. Templates are plain, nicely formatted HTML strings (or React Email if preferred; note the choice in DECISIONS.md).
- Notification to `CONTACT_TO_EMAIL` (defaults to `profile.email`) with reply-to set to the visitor.
- Optional auto-reply to the visitor using the editable subject and body (with `{name}` placeholder support).
- Failures are caught, logged, and stored on the message (`emailDelivered=false`).
- Sender domain: until a domain is verified in Resend, use `onboarding@resend.dev` (it can only send to the account owner's address). Document this in HANDOVER.md.

## 12. Environment variables (`.env.example`)

```
# App
NEXT_PUBLIC_SITE_URL=http://localhost:3000
# Database
MONGODB_URI=
# Auth
AUTH_SECRET=                 # openssl rand -base64 32
ADMIN_EMAIL=
ADMIN_PASSWORD=              # only used by pnpm create-admin
# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
# Email
RESEND_API_KEY=
EMAIL_FROM="Portfolio <onboarding@resend.dev>"
CONTACT_TO_EMAIL=
# Security / misc
IP_HASH_SALT=
TURNSTILE_SITE_KEY=          # optional
TURNSTILE_SECRET_KEY=        # optional
UPSTASH_REDIS_REST_URL=      # optional
UPSTASH_REDIS_REST_TOKEN=    # optional
```
Validate env at boot with a Zod `env.ts`, and fail fast with a readable error.

## 13. Security headers (`next.config` `headers()`)

- `Content-Security-Policy`: default-src 'self'; img-src 'self' data: blob: res.cloudinary.com i.ytimg.com; frame-src youtube-nocookie.com 'self'; connect-src 'self' api.cloudinary.com; script-src 'self' 'unsafe-inline' (needed for the theme pre-paint script; move to a nonce if feasible); style-src 'self' 'unsafe-inline'; font-src 'self'.
- `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`.
- `X-Frame-Options: DENY` everywhere except `/preview` (`SAMEORIGIN`).

## 14. Error handling & logging

- `error.tsx` for the site (themed "Something went wrong" + retry) and for the admin.
- Server actions never throw raw errors to the client. They map them to `{ ok:false, error: "message", fieldErrors? }`.
- Log with `console.error` and a structured prefix (`[action:updateGame]`). Vercel collects logs.
