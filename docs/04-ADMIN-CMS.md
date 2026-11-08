# 04 — Admin Dashboard (CMS) Specification

Audience: **Najeeb is not a web developer.** Every screen must be self-explanatory, with short helper text under fields, friendly empty states, and no jargon ("Publish theme", not "Commit draft").

---

## 0. Shared admin patterns (apply to all screens)

| Pattern | Spec |
|---|---|
| **Shell** | Sidebar (Overview, Theme, Profile, Games, Skills, Experience, Services, Testimonials, Layout, Messages •, Media, SEO, Backup, Account). Top bar: page title, "View live site ↗", user menu. |
| **Save model** | Forms keep local state. A sticky **save bar** appears when the form is dirty: "You have unsaved changes · Discard · Save changes". Ctrl/Cmd+S saves. |
| **Leave guard** | Navigating away from a dirty form shows a confirm dialog (in-app dialog, not `window.confirm`). |
| **Feedback** | A toast on success ("Saved · live site updated"), and a toast plus inline errors on failure. The button shows a spinner while saving. |
| **List editors** | A reusable `<SortableList>`: drag handle (dnd-kit; keyboard reorder with Space + arrows), item summary row, Edit (opens a drawer/dialog form), Duplicate, Delete. Reordering saves immediately with an optimistic UI. |
| **Delete** | Always a confirm dialog naming the item: "Delete 'Battle Zone Master'? This can't be undone." |
| **Image field** | `<ImageField>`: drop zone + "Choose from media library" + preview + alt text input (required) + remove. Shows upload progress. |
| **Markdown field** | Textarea with a toolbar (bold, italic, link, list, heading) and a Write/Preview tab. |
| **Empty states** | An illustration/icon, one sentence, and a primary "Add …" button. |
| **Helper text** | Every non-obvious field has a 1-line hint below it. |
| **Responsive** | Fully usable on a phone (Najeeb may edit from mobile). Drawers become full-screen sheets. |
| **Accessibility** | Labels on all inputs, focus management in dialogs, keyboard-friendly reorder. |

---

## 1. Login `/admin/login`
- Centred card on the themed background: logo initials, "Admin login", Email, Password (show/hide toggle), "Log in" button.
- Errors: "Email or password is incorrect." When locked: "Too many attempts. Try again in X minutes."
- Redirects to `?next` or `/admin` after login.
- No sign-up link. No "forgot password" (recovery is `pnpm create-admin`, documented in HANDOVER).

## 2. Overview `/admin`
- Greeting: "Welcome back, {firstName}".
- **Stat tiles:** Published games, Drafts, Unread messages, Skills, Last content update (relative time).
- **Setup checklist** (hidden when everything is done). It flags:
  - Email is still the seed placeholder
  - No profile photo
  - Games without uploaded cover / without screenshots
  - Games whose description is still seed text (store a `seedHash` per seeded text and compare)
  - Socials still pointing at bare `github.com/` / `linkedin.com/`
  - No OG image set
  - Admin password never changed since setup
  Each item links straight to the field.
- **Recent messages** (latest 5, unread in bold) → link to the inbox.
- **Quick actions:** Add game · Change theme · Edit profile · View live site.
- If analytics are enabled: play-button clicks per game over the last 30 days (simple bar list).

## 3. Theme Studio `/admin/theme`

Layout: two columns on desktop: **Controls (left, 420px)** | **Live preview iframe (right)**. On mobile, Controls/Preview tabs.

A banner at the top of the controls when a draft exists: "You're previewing unpublished changes · **Publish theme** · Discard".

### 3.1 Presets
- A grid of 9 preset cards (as in the prototype): a mini preview (bg colour, gradient bar, 3 dots), name, Light/Dark label. The active one has a primary border and a ✓.
- Below it: **My themes**, the saved custom themes as the same cards, each with a ⋯ menu (Rename, Delete).
- Clicking a card sets the draft source and **clears overrides** (with a toast offering "Undo").

### 3.2 Custom colours
- 5 colour fields: Primary, Accent, Background, Cards (surface), Text. Each is a swatch button that opens a picker (react-colorful) with a hex input.
- "Reset to preset" link (visible when overrides exist).
- "Save as my theme…" button → dialog asking for a name → creates a custom theme from the current resolved colours.
- **Contrast checker** (live): Text on Background, Text on Cards, Muted text on Background, Button text on Primary. Each row shows the ratio and a ✓ AA / ⚠ Low badge. If body contrast < 4.5, show an inline warning but still allow publishing.
- **"Generate from one colour"** helper (nice to have): pick a primary and the studio suggests accent (hue +60°), background and surface based on dark/light mode.

### 3.3 Typography
- 4 font pair cards, each rendering "Najeeb Ullah" in the heading font and a sentence in the body font.

### 3.4 Shape & effects
- Corner roundness slider 0–32px with live value, plus 3 quick chips: Sharp (4) / Soft (18) / Round (28).
- Background effect: segmented control Starfield / Grid / None.
- Animations: switch.

### 3.5 Visitor light/dark switch
- Switch: "Let visitors switch between light and dark".
- When on: two selects, "Dark theme" and "Light theme" (each lists the presets and custom themes of that mode).

### 3.6 Behaviour
- Every control change → postMessage to the preview (instant), plus a debounced draft save.
- **Publish theme** → confirm toast "Theme published · live site updated". The live site updates within seconds.
- Preview toolbar above the iframe: device width toggles (Desktop 1280 / Tablet 820 / Mobile 390), "Open preview in new tab".

## 4. Profile `/admin/profile`
Tabs: **Basics · Hero · Contact · Social links · Stats**

- **Basics:** Full name*, Role/title*, Profile photo (ImageField, square crop hint 800×800+), Bio (markdown*), Location, CV (PDF upload; shows file name + Replace/Remove).
- **Hero:** Tagline* (max 200), "Available for work" switch, Badge text when available (default "Available for new projects"), Badge text when busy (default "Currently busy, but say hi"), Main engine (chip 2), Chip 3 title + subtitle, About-section external button (label + URL, optional).
- **Contact:** Public email*, Phone (optional, shown only if filled), Availability text (shown in About and Contact).
- **Social links:** SortableList. Item form: Platform (select with icons; it sets a default label), Label, URL*. Preview of how it renders.
- **Stats:** SortableList (max 6). Item form: Big value* (max 10 chars, e.g. "3+", "50K"), Label* (max 40). Hint: "Use real numbers only."

## 5. Games `/admin/games`

### 5.1 List
- Toolbar: search by title, filter (All / Published / Drafts / Featured), "+ Add game" button.
- View: **sortable rows** (drag handle, cover thumbnail, title, genre, status badges Published/Draft and ★, platforms, updated date, ⋯ menu: Edit, Duplicate, View on site, Publish/Unpublish, Delete).
- Reordering is only enabled when no search/filter is active (show a hint otherwise).
- Inline toggles for Published and Featured directly in the row.

### 5.2 Create / Edit `/admin/games/new`, `/admin/games/[id]`
A two-column form (main + sidebar), stacked on mobile.

**Main column**
1. Title* → auto-generates the slug (until the slug is edited manually).
2. Short description* (max 220, with a counter). Hint: "Shown on the game card."
3. Full description (markdown). Hint: "Shown on the game's own page: story, features, controls."
4. Cover image (ImageField, 16:10 hint 1600×1000). If empty: "Generated cover art" style picker with 4 thumbnails (space/battle/jet/arcade) rendered live with the current theme.
5. Screenshots gallery: multi-upload, drag reorder thumbnails, alt per image, max 12.
6. Trailer: YouTube URL (validated; shows a thumbnail preview).
7. Links: repeatable rows [Store type select] [URL] [custom label if "other"]. At least one link is recommended (show a warning if none).

**Sidebar**
- Publish card: Published switch, Featured switch, Status select (Released / In development / Prototype), Save button, "View on site" (disabled while draft).
- Details card: Genre* (combobox: existing genres + free text; this drives the public filter chips), Platforms (multi-select chips: Android, iOS, Web, Windows, macOS, Linux + custom), Engine (combobox: Unity, Godot, Unreal, GameMaker, Defold, Custom + free text), Release year.
- Tags: chip input (Enter or comma to add, max 8).
- URL card: slug field with prefix `/games/`. Warning when edited: "Old links will redirect automatically."
- Danger zone: Duplicate, Delete.

AC: Saving shows a toast with a "View live" link, and the change is visible on the public site after revalidation.

## 6. Skills `/admin/skills`
- Two panels. **Categories** (SortableList: name; delete is blocked while it holds skills unless the user chooses "Move skills to…"). **Skills** grouped under category headers, each a SortableList within its category.
- Skill row: name, level slider 0–100 inline (saves on release), category select (moves it), delete.
- "+ Add skill" asks for name, category and level.
- Display options (stored in `settings.display`): "Show percentages" switch.

## 7. Experience `/admin/experience`
- SortableList with type badge, role, organisation, period.
- Item form: Type (Job / Freelance / Education / Game jam / Achievement), Role/Title*, Organisation*, Location, URL, Start month/year*, End month/year or a "I currently do this" checkbox, Period override (advanced, collapsed), Description (markdown).
- Option: "Sort automatically by date (newest first)". When on, drag is disabled.

## 8. Services `/admin/services`
- SortableList. Item form: Icon (IconPicker grid of ~40 curated lucide icons with a search: gamepad-2, smartphone, code, box, sparkles, rocket, palette, layers, monitor, cpu, joystick, trophy, wand, brush, zap, globe, bug, rotate, store, megaphone...), Title*, Description* (max 200).

## 9. Testimonials `/admin/testimonials`
- A notice at the top: "Only add real feedback from real people. Ask them first."
- SortableList. Item form: Quote* (max 400), Name*, Role, Company, Avatar (optional), Link (optional), Published switch.

## 10. Layout `/admin/layout-sections` (sidebar label "Layout")
- **Sections:** a SortableList of all 8 sections. Hero is pinned first (lock icon, not draggable or hideable). Each row: drag, menu label (editable inline), visibility switch, "Edit headings" button.
- **Headings & text:** an accordion per section with eyebrow, title (hint: "The last two words get the gradient"), subtitle.
- **Contact form options:** project type options (chip list editor), budget field on/off + options, success message, auto-reply on/off + subject + body (supports `{name}`).
- **Display options:** games shown on home (number 3–12), featured first (switch), experience sort.

## 11. Messages `/admin/messages`
- Two-pane inbox (list | reading pane). On mobile, list → detail.
- List: filter tabs New / All / Archived, search, bulk select (mark read, archive, delete). Unread rows are bold with a dot. A row shows name, project type, first line, and relative date. A ⚠ icon appears if the email notification failed.
- Reading pane: name, email (copy button), project type, budget, date, full message. Actions: **Reply** (mailto link with the subject prefilled; also show the address as text), Mark unread, Archive, Delete.
- Opening a message marks it read. The sidebar badge shows the unread count.
- "Export CSV" button (all or filtered).

## 12. Media `/admin/media`
- A grid of all uploads with filters (Images / Documents) and search by alt or file name.
- Upload button + drag-drop anywhere on the page (multi-file).
- Click an item → side panel: preview, alt text (editable), dimensions, size, URL (copy), "Used in" list, Delete (blocked or warned if used).
- The same component is used as a picker dialog by ImageField ("Choose from library").

## 13. SEO `/admin/seo`
- Site title (default "{name} — {role}"), meta description (with a counter, ideal 120–160), keywords (chips).
- Social share image (1200×630, ImageField). If none is set, the dynamic OG image is used. Show a preview of how a share card looks (Google result + social card mockups).
- Favicon upload (square PNG ≥ 512). If none, a generated initials favicon is used.
- Google Search Console verification code.
- Analytics switch (Vercel Analytics).

## 14. Backup `/admin/backup`
- **Export:** "Download backup (.json)" → `/api/backup/export` streams JSON with `{ version, exportedAt, settings, profile, games, skillCategories, skills, experiences, services, testimonials, customThemes }` (no messages, users or secrets; media referenced by URL). Note: "Images stay on Cloudinary; the backup stores their links."
- **Import:** upload a .json → validate it with Zod → show a summary preview ("Will replace: 3 games, 12 skills...") → type `REPLACE` to confirm → apply inside a MongoDB transaction → revalidate all tags.
- **Reset to starter content:** the same confirm pattern; re-runs the seed (keeps users, messages and media).
- Recommendation text: "Download a backup once a month."

## 15. Account `/admin/account`
- Change email, change password (current + new + confirm, min 10 chars, strength meter).
- Show last login time.
- "Log out of all devices" (rotate a `sessionVersion` stored on the user, checked in the JWT callback).
