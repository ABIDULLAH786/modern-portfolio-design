# QA report

## 2026-11-08 — automated checks (local, production build)

| Check | Result |
|---|---|
| `pnpm typecheck` / `pnpm lint` / `pnpm build` | ✅ pass (0 type errors, 0 lint problems) |
| Unit tests (Vitest) | ✅ 43 passed: theme derive/contrast (incl. AA primary text for all 9 presets), formatPeriod, slugify, rate limiter, Zod schemas, backup schema, ImageKit folders |
| E2E (Playwright, flows from 07-QA §3) | ✅ 16 passed: public home/sections/filters/nav, axe (0 serious/critical), game page + JSON-LD + play link, 404 + sitemap, mobile menu, auth + lockout, edit → live, games CRUD + slug redirect, keyboard reorder, layout hide/rename, theme draft vs publish, contact → inbox, honeypot + rate limit, backup round-trip, unauthenticated API rejection, mobile admin form |
| Lighthouse mobile `/` | ✅ Performance 96 · Accessibility 100 · Best Practices 96 · SEO 100 · CLS 0 · LCP 2.7 s (simulated slow 4G) |
| Lighthouse mobile `/games/battle-zone-master` | ✅ Performance 91 · Accessibility 100 · Best Practices 100 · SEO 100 · CLS 0 · LCP 3.5 s (simulated) |
| ImageKit live test | ✅ media upload lands in `/najeeb-portfolio/library` and delete removes it from ImageKit; replacing the resume deleted the old PDF (404 on its fileId) and exactly one file remains in `/najeeb-portfolio/resume` |
| Hydration warnings (dev, all admin pages) | ✅ none after the dnd-kit id fix |

LCP is slightly above the 2.5 s target under Lighthouse's simulated throttling on a local machine; re-measure on Vercel (CDN + compression).

## Still to do manually (07-QA §4)

- [ ] Visual parity with the prototype at 1440 / 1024 / 768 / 390 / 360 (spot-checked at 1280 and 390 only)
- [ ] All 9 presets, 4 font pairs, radius 0 / 32, effects & animations off — visual pass
- [ ] Real emails via Resend (notification, reply-to, auto-reply) — needs `RESEND_API_KEY`
- [ ] Browsers: Firefox, Safari (macOS/iOS), Android Chrome, Edge
- [ ] Screen-reader smoke test (VoiceOver / NVDA)
- [ ] securityheaders.com and Lighthouse on the deployed URL
