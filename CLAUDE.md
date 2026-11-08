# CLAUDE.md — Najeeb Ullah Portfolio + CMS

This file is read automatically by Claude Code at the start of every session. Read it fully, then read the docs it points to before writing code.

## 1. What we are building

A production-ready personal portfolio website for **Najeeb Ullah, Mobile Game Developer**, with a **built-in admin dashboard (CMS)**. Using the dashboard, Najeeb can change **all content and the visual theme himself**, with no developer help and no code changes.

- Public site: one-page portfolio (Hero, About, Games, Skills, Experience, Services, Testimonials, Contact) plus a detail page per game.
- Admin: password-protected `/admin` with editors for every content type, a theme studio with live preview, a media library, a contact-message inbox, SEO settings, and backup/restore.
- A working visual prototype exists at `docs/reference/prototype.html`. Open it in a browser. It is the **source of truth for look and feel**. Match its layout, spacing, motion and theme behaviour. Do NOT copy its architecture: it is a single file that stores data in localStorage. Production stores everything in a database.

## 2. Documents (read in this order)

| # | File | Purpose |
|---|------|---------|
| 1 | `docs/01-PRD.md` | Product requirements: every feature and acceptance criterion |
| 2 | `docs/02-DESIGN-SYSTEM.md` | Tokens, the 9 theme presets, fonts, components, motion, responsiveness |
| 3 | `docs/03-ARCHITECTURE.md` | Stack, folder structure, data models, server actions, auth, caching, env vars |
| 4 | `docs/04-ADMIN-CMS.md` | Screen-by-screen spec of the admin dashboard |
| 5 | `docs/05-IMPLEMENTATION-PLAN.md` | Phased build plan with checkboxes. **Work through it in order.** |
| 6 | `docs/06-SEED-CONTENT.md` | Default content to seed the database with |
| 7 | `docs/07-QA-DEPLOYMENT.md` | Testing strategy, quality gates, deployment and handover |
| – | `docs/reference/prototype.html` | Visual reference prototype |

## 3. Tech stack (decided; do not swap without asking)

- **Framework:** Next.js (latest stable, App Router) + React + **TypeScript (strict)**
- **Styling:** Tailwind CSS (latest) driven by **CSS custom properties** for all theme colors
- **Database:** MongoDB Atlas + Mongoose
- **Auth:** Auth.js (NextAuth v5) with the Credentials provider. Single admin user stored in DB, password hashed with bcrypt.
- **Validation:** Zod (shared between forms and server actions)
- **Forms:** React Hook Form + `@hookform/resolvers/zod`
- **Images:** Cloudinary (signed uploads) through a `MediaService` abstraction, so it can later be swapped for S3
- **Email:** Resend (contact form notifications)
- **Animation:** Framer Motion (`motion`) for reveals; CSS for small hover effects
- **Drag & drop reorder:** dnd-kit
- **Rich text:** Markdown stored as a string, rendered with `react-markdown` + `rehype-sanitize`
- **Icons:** lucide-react
- **Testing:** Vitest (unit) + Playwright (e2e)
- **Hosting:** Vercel (app) + MongoDB Atlas free tier + Cloudinary free tier
- **Package manager:** pnpm

Before installing, check the current stable versions of each package. Do not pin to versions from memory.

## 4. Commands

```bash
pnpm dev            # start dev server
pnpm build          # production build (must pass with 0 type errors)
pnpm lint           # eslint
pnpm typecheck      # tsc --noEmit
pnpm test           # vitest
pnpm test:e2e       # playwright
pnpm seed           # seed DB from src/data/seed.ts (idempotent)
pnpm create-admin   # create/reset admin user from ADMIN_EMAIL / ADMIN_PASSWORD env
```

Create these scripts in Phase 0 if they don't exist.

## 5. Working rules for Claude Code

1. **Follow `docs/05-IMPLEMENTATION-PLAN.md` phase by phase.** Tick the checkboxes (`- [x]`) in that file as you finish tasks, so progress survives between sessions.
2. At the start of every session, read this file and the plan, then continue from the first unchecked task.
3. Finish each phase with `pnpm typecheck && pnpm lint && pnpm build` passing, and meet that phase's **Done when** criteria before starting the next.
4. Commit after each completed phase with a clear message (`feat(phase-3): public hero + about sections`).
5. If a requirement is ambiguous, choose the option most consistent with the prototype and the PRD. Write the decision in `docs/DECISIONS.md` (create it) with date and reason. Only stop and ask when a decision is expensive to reverse, such as a data model change after content exists.
6. Never hard-code content in components. Every user-visible string on the public site comes from the database, except purely structural UI labels like "Send message" and "Close".
7. Never hard-code colors in components. Use theme tokens only (`bg-surface`, `text-muted`, `var(--primary)`...). The only exceptions are status colors (success, warning, danger) defined in the design system.
8. Every server action and API route that changes data must: (a) check the admin session, (b) validate input with Zod, (c) call `revalidateTag()` for affected content, and (d) return a typed result `{ ok: true, data } | { ok: false, error }`.
9. Accessibility is a requirement, not polish. Use semantic HTML, keyboard support, focus rings, alt text, and support `prefers-reduced-motion`.
10. Keep components small. Write server components by default and use `"use client"` only where interactivity needs it.
11. Do not add features that aren't in the PRD without noting them in `DECISIONS.md` as optional.
12. Never commit secrets. `.env.local` is git-ignored, and `.env.example` documents every variable.

## 6. Code conventions

- Imports use the `@/` alias for `src/`.
- File names: `kebab-case.tsx` for components, `camelCase.ts` for utils, PascalCase component names.
- Mongoose models live in `src/server/models/`, data-access functions in `src/server/queries/`, mutations in `src/server/actions/`.
- Zod schemas live in `src/lib/validation/` and are imported by both the client and the server.
- Wrap all DB reads used by public pages in `unstable_cache` / tagged fetch caching (see Architecture §7).
- Use named exports, except for Next.js special files (`page.tsx`, `layout.tsx`...).
- Write no `any`. Use `unknown` and narrow it.

## 7. Definition of done (whole project)

See `docs/07-QA-DEPLOYMENT.md` §6. In short:
- All PRD acceptance criteria pass.
- Lighthouse on mobile: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95.
- E2E tests for the critical flows pass.
- The site is deployed to Vercel with a seeded DB, and the admin can log in and change theme, content and images.
- `HANDOVER.md` has been written for Najeeb (a non-technical guide to using the dashboard).
