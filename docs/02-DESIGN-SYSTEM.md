# 02 — Design System

The prototype (`docs/reference/prototype.html`) is the visual reference. This document turns it into exact tokens and rules. **No component may use a raw colour value**. Components use only the tokens below.

---

## 1. Design principles

1. **Game-dev energy, professional restraint.** Neon gradients and a starfield give it personality. Generous whitespace and clean type keep it credible for clients.
2. **Content first.** Game covers are the hero of the Games section, and the UI frames them.
3. **One accent system.** Every highlight uses the `primary → accent` gradient, so changing theme recolours the whole site consistently.
4. **Everything themeable.** Colours, fonts, radius and effects all come from settings.
5. **Motion with purpose.** Use reveals, subtle hovers and floating chips. Never animate for more than 1 s, and always honour reduced motion.

## 2. Base theme tokens (stored per theme)

Every theme defines exactly these 6 values plus a `mode`:

| Token | Meaning |
|---|---|
| `bg` | Page background |
| `surface` | Card / panel background |
| `text` | Primary text colour |
| `primary` | Brand colour (buttons, links, active states, gradient start) |
| `accent` | Secondary brand colour (gradient end, highlights) |
| `mode` | `dark` or `light` (affects shadows, the on-colour default, and the visitor toggle pairing) |

## 3. Derived tokens (computed, never stored)

Computed **in TypeScript on the server** (`src/lib/theme/derive.ts`) and emitted as hex/rgba, so we don't depend on `color-mix()` support. Use `culori` or a small hand-written mixer.

| Token | Formula | Use |
|---|---|---|
| `surface2` | mix(surface 90%, text 10%) | Inputs, chips, meta boxes, progress track |
| `border` | text at 12% alpha | All 1px borders |
| `muted` | mix(text 64%, bg 36%) | Secondary text |
| `onPrimary` | `#0B0B10` if relativeLuminance(primary) > 0.45, else `#FFFFFF` | Text on primary/gradient buttons |
| `primarySoft` | primary at 15% alpha | Icon tiles, active tab backgrounds |
| `ring` | primary at 18% alpha | Focus ring glow |
| `shadow` | `0 20px 50px -20px` + primary at 45% alpha | Elevated cards, primary buttons |
| `gradient` | `linear-gradient(120deg, primary, accent)` | Buttons, gradient text, logo, bars |

Status colours (fixed and not themeable): success `#22C55E`, warning `#F59E0B`, danger `#EF4444`.

### CSS variable names (emitted on `<html>`)
```
--bg --surface --surface-2 --text --muted --border
--primary --accent --on-primary --primary-soft --ring
--shadow --gradient --radius --font-head --font-body
```

### Tailwind mapping (`tailwind` theme extension or v4 `@theme`)
```
colors: bg, surface, surface-2, text, muted, border, primary, accent, on-primary, primary-soft
borderRadius: theme → var(--radius); theme-lg → calc(var(--radius) * 2)
fontFamily: head → var(--font-head); body → var(--font-body)
```
Example usage: `className="bg-surface border border-border rounded-theme text-text"`.

## 4. Theme presets (seed these exactly)

| id | Name | Mode | bg | surface | text | primary | accent |
|---|---|---|---|---|---|---|---|
| `neon` | Neon Arcade **(default)** | dark | `#0B0B14` | `#14142A` | `#ECECF8` | `#7C5CFF` | `#22D3EE` |
| `ocean` | Ocean Depth | dark | `#06111C` | `#0D1D2E` | `#E6F1FB` | `#38BDF8` | `#818CF8` |
| `lime` | Cyber Lime | dark | `#090E0A` | `#121A13` | `#E8F5E9` | `#A3E635` | `#2DD4BF` |
| `sunset` | Sunset Synth | dark | `#140B12` | `#22121E` | `#FCEFF5` | `#FB7185` | `#FBBF24` |
| `gold` | Royal Gold | dark | `#0E0C08` | `#1A1710` | `#F7F1E3` | `#EAB308` | `#F97316` |
| `crimson` | Crimson Core | dark | `#100808` | `#1D0F11` | `#FBECEC` | `#EF4444` | `#F472B6` |
| `light` | Clean Light | light | `#F6F6FB` | `#FFFFFF` | `#15151F` | `#4F46E5` | `#0891B2` |
| `mint` | Mint Fresh | light | `#F2FAF6` | `#FFFFFF` | `#0F1F19` | `#059669` | `#0284C7` |
| `paper` | Warm Paper | light | `#FAF6EF` | `#FFFDF8` | `#231C14` | `#C2410C` | `#A16207` |

- Presets live in code (`src/lib/theme/presets.ts`) as constants. They are read-only.
- **Custom themes** created by the admin are stored in the DB (`customThemes` collection) with the same shape plus `name`. The admin can save the current overrides as a named custom theme, rename it, or delete it.
- Active theme resolution: `final = { ...preset(or custom theme), ...overrides }`.

## 5. Typography

### Font pairs (admin selectable)
| id | Name | Headings | Body | Feel |
|---|---|---|---|---|
| `sora` | Sora + Inter **(default)** | Sora 600/700/800 | Inter 400/500/600/700 | Modern, clean |
| `grotesk` | Space Grotesk + DM Sans | Space Grotesk 500/600/700 | DM Sans 400/500/700 | Techy |
| `arcade` | Orbitron + Rajdhani | Orbitron 600/700/800 | Rajdhani 500/600/700 | Gaming / sci-fi |
| `outfit` | Outfit | Outfit 600/800 | Outfit 400/500 | Friendly, rounded |

Note: Rajdhani body text renders small. When `arcade` is active, raise the base font size from 16 → 17px.

### Type scale (fluid)
| Role | Size | Weight | Line-height | Letter-spacing |
|---|---|---|---|---|
| Hero h1 | `clamp(2.6rem, 6.2vw, 5.2rem)` | 800 | 1.1 | -0.02em |
| Section h2 | `clamp(2rem, 4vw, 3rem)` | 700 | 1.15 | -0.02em |
| Hero role | `clamp(1.2rem, 2.4vw, 1.7rem)` | 600 | 1.3 | — |
| Card h3 | 1.15–1.3rem | 700 | 1.2 | -0.01em |
| Body large | 1.05–1.12rem | 400 | 1.6 | — |
| Body | 1rem | 400 | 1.6 | — |
| Small / meta | 0.85rem | 500 | 1.5 | — |
| Eyebrow | 0.78rem uppercase | 700 | 1 | 0.14em |

**Gradient heading rule:** In every section h2, the **last two words** use gradient text (`background: var(--gradient); background-clip: text`). If the heading has one word, the whole word gets the gradient. Implement this as a `<GradientHeading text="..."/>` component.

## 6. Spacing, layout, radius, elevation

- Container: `width: min(1200px, 100% - 48px)`, centred.
- Section vertical padding: 110px desktop, 80px tablet, 64px mobile.
- Section header: eyebrow (with a 22px gradient line before it), h2, subtitle (max-width 640px), 56px gap below.
- Grid gaps: 20–28px. Card padding: 24–40px.
- Spacing scale: 4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 56, 64, 80, 110.
- Radius: `--radius` is admin-controlled (0–32px, default 18). Pills (buttons, chips, nav) are always fully rounded (`999px`). Large frames use `calc(var(--radius) * 2)`.
- Elevation: cards are flat with a 1px border. On hover they lift (`translateY(-4…-8px)`), take a primary-tinted border and get `--shadow`.
- Glow blobs: absolute, blurred (90px) circles of primary or accent at 20–35% opacity behind the hero and contact sections.

## 7. Components (public)

Build each component as its own file under `src/components/site/`. States to implement for every interactive one: default, hover, focus-visible, active, disabled.

| Component | Spec |
|---|---|
| `Navbar` | Fixed at 14px from top, pill shape, `surface` at 72% opacity with backdrop-blur(16px), border. Height ~60px. Links: pill hover background `surface-2`; active = `surface-2` + `text`. |
| `Button` | Variants: `primary` (gradient bg, on-primary text, shadow, hover lift 2px), `ghost` (surface bg, border, hover border primary), `link`. Sizes: `md` (13×22 padding), `sm` (8×14). Optional leading icon 18px. |
| `IconButton` | 40×40 circle, surface bg, border; hover = primary colour + border. |
| `Eyebrow` | Uppercase label with gradient line. |
| `GradientHeading` | See §5. |
| `Card` | surface bg, 1px border, radius `--radius`. |
| `Pill` / `Badge` | Availability pill with pulsing dot; game genre badge (blurred bg); Featured badge (gradient). |
| `Tag` | `surface-2` bg, muted text, radius 8px, `#tag` prefix. |
| `StatCard` | Big gradient number (Head font 2.3rem 800) + muted label right-aligned; hover slides 4px right. |
| `SkillBar` | 7px track `surface-2`, gradient fill animated from 0 to level. |
| `GameCard` | Cover 16:10 with zoom on hover (scale 1.06, 600ms), badges, body, footer with platforms + "Details →". |
| `GameCover` | Renders the uploaded image or the generated SVG art (§8). |
| `TimelineItem` | Gradient vertical line; ring dot; card with period (primary, uppercase), role, company, description. |
| `ServiceCard` | Icon tile (52px, primary-soft bg, primary icon), title, description; hover glow blob. |
| `TestimonialCard` | Quote mark icon, quote, avatar + name + role. |
| `ContactForm` | Inputs: `bg` background, border, radius 12px, focus = primary border + 4px ring. |
| `Lightbox` | Full-screen, dark scrim, arrows, counter, Esc to close, swipe on mobile. |
| `Toast` | Bottom-centre pill; text colour on bg colour (inverted). |
| `StarfieldCanvas` | ~1 particle per 14px of viewport width, colours [primary, accent, text], upward drift, twinkle; DPR capped at 2. |

## 8. Generated game cover art

When a game has no uploaded cover, render an SVG illustration that **uses theme CSS variables**, so it recolours with the theme. Port the four styles from the prototype (`coverSVG()` function) into `src/components/site/game-cover-art.tsx`:

| style | Content |
|---|---|
| `space` | Starfield, ringed planet (radial gradient accent→primary), floating astronaut, dashed orbit |
| `battle` | Faint grid, accent crosshair, primary-coloured tank |
| `jet` | Soft clouds, 3 accent enemy jets, accent bullet trails, white player jet |
| `arcade` | Random pixel squares in primary/accent + gamepad icon |

- Make it deterministic: use a pseudo-random generator seeded from the game id, so stars stay stable between renders (avoids hydration mismatch). Render it on the server.
- Gradient IDs must be unique per game (`g-{id}`) to avoid SVG id collisions.
- viewBox `0 0 400 250`, `preserveAspectRatio="xMidYMid slice"`.

## 9. Motion

| Pattern | Spec |
|---|---|
| Section reveal | opacity 0→1, translateY 26px→0, 800ms `cubic-bezier(.2,.7,.2,1)`, stagger 70–80ms per card, trigger at 12% visibility, once |
| Card hover | translateY -4/-8px, 300–350ms |
| Floating chips | translateY 0↔-12px, 5s ease-in-out infinite, staggered delays |
| Pulse dot | box-shadow ring 2s infinite |
| Skill bars | width 0→level, 1.4s, 200ms delay |
| Modal/lightbox | fade 250ms + scale .95→1 350ms |
| Filter change | Framer Motion `layout` + AnimatePresence fade/scale |

`prefers-reduced-motion: reduce` OR the admin setting `animations=false` → no transforms or infinite animations, and content is visible immediately.

## 10. Responsive behaviour

| Width | Behaviour |
|---|---|
| ≥ 1200 | Full layout as in prototype |
| 900–1199 | Hero 2 columns tighter; games 2–3 cols (auto-fill minmax 320px) |
| < 900 | Hamburger nav; hero stacks (photo first, max 340px); about stacks; contact stacks; floating chips smaller |
| < 560 | Single-column grids; form rows stack; section padding 64px; chips hidden except one |
| < 380 | Hero h1 min 2.4rem; nav shows initials only (hide full name) |

## 11. Admin UI design

The admin uses the **same theme tokens** (so Najeeb sees his theme while editing), but with a calmer layout:
- A left sidebar (240px, collapsible to icons at < 1024px; a bottom tab bar on mobile) with sections: Overview, Theme, Profile, Games, Skills, Experience, Services, Testimonials, Layout, Messages (badge = unread), Media, SEO, Backup, Account.
- A top bar with the page title, a "View live site ↗" button, and the user menu (Account / Logout).
- Content max-width 960px, cards for field groups, sticky save bar at the bottom of every editor ("Unsaved changes · Discard · Save").
- Use shadcn/ui-style primitives (Dialog, DropdownMenu, Tabs, Switch, Slider, Select, Tooltip), built on Radix and styled with our tokens. Generating them with the shadcn CLI and then mapping colours to our tokens is fine.
- Admin fonts always use the body font of the active pair (headings too) for readability.
