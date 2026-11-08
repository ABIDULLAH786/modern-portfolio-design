# 06 — Seed Content

This is the starter content for `src/data/seed.ts`. It matches the prototype.

> ⚠️ Items marked **[PLACEHOLDER]** are not confirmed by Najeeb. They exist so the site looks complete on day one. The admin Overview "Setup checklist" must flag them until they are edited (store a hash of each seeded placeholder value and compare). Never present placeholder numbers or testimonials as real.

---

## 1. Settings

```ts
theme: {
  source: { kind: "preset", id: "neon" },
  overrides: {},
  fontPair: "sora",
  radius: 18,
  effect: "starfield",
  animations: true,
  visitorToggle: { enabled: false, darkSource: { kind:"preset", id:"neon" }, lightSource: { kind:"preset", id:"light" } }
},
themeDraft: null,
sections: [
  { key:"hero",         label:"Home",         visible:true,  order:0 },
  { key:"about",        label:"About",        visible:true,  order:1 },
  { key:"games",        label:"Games",        visible:true,  order:2 },
  { key:"skills",       label:"Skills",       visible:true,  order:3 },
  { key:"experience",   label:"Experience",   visible:true,  order:4 },
  { key:"services",     label:"Services",     visible:true,  order:5 },
  { key:"testimonials", label:"Testimonials", visible:false, order:6 },
  { key:"contact",      label:"Contact",      visible:true,  order:7 }
],
copy: {
  about:        { eyebrow:"About me",   title:"Crafting games that feel great to play" },
  games:        { eyebrow:"Portfolio",  title:"Games I've built & shipped",
                  subtitle:"A selection of my published games. Open any game for details, or play it on itch.io." },
  skills:       { eyebrow:"Skills",     title:"Tools & skills", subtitle:"The engines, languages and craft behind my games." },
  experience:   { eyebrow:"Experience", title:"My journey" },
  services:     { eyebrow:"Services",   title:"What I can do for you",
                  subtitle:"From idea to app store, I can help at every stage of your game." },
  testimonials: { eyebrow:"Testimonials", title:"What people say" },
  contact: {
    eyebrow:"Contact", title:"Let's build your next game",
    subtitle:"Have a game idea, a project or a role in mind? Send a message and I'll get back to you.",
    successMessage:"Thanks! Your message has been received. I'll reply soon.",
    projectTypes:["New mobile game","Prototype","Job opportunity","Collaboration","Other"],
    budgetEnabled:false,
    budgetOptions:["Under $500","$500 – $2,000","$2,000 – $5,000","$5,000+","Not sure yet"],
    autoReply:{ enabled:false, subject:"Thanks for reaching out!",
      body:"Hi {name},\n\nThanks for your message. I've received it and will get back to you within 1–2 days.\n\n— Najeeb" }
  }
},
display: { gamesOnHome: 6, featuredFirst: false, showSkillPercent: true, experienceSort: "manual" },
seo: {
  siteTitle: "Najeeb Ullah — Mobile Game Developer",
  description: "Portfolio of Najeeb Ullah, a mobile game developer building arcade, action and shooter games for Android and the web.",
  keywords: ["Najeeb Ullah","mobile game developer","Unity developer","indie games","itch.io","Pakistan game developer"],
  ogImage: null, favicon: null, analyticsEnabled: false
}
```

## 2. Profile

```ts
name: "Najeeb Ullah",
role: "Mobile Game Developer",
tagline: "I design and build fun, polished games for mobile and the web, from the first prototype to a published release.",
bio: "I'm a mobile game developer who loves turning simple ideas into games people want to play again and again.\n\nI focus on tight controls, satisfying game feel and smooth performance on real devices. From arcade shooters to space adventures, I handle gameplay programming, UI, and publishing.",   // [PLACEHOLDER]
avatar: null, cv: null,
location: "Pakistan",                       // [PLACEHOLDER] confirm city
email: "your.email@example.com",            // [PLACEHOLDER] MUST be changed
available: true,
availabilityText: "Open to freelance & full-time roles",
heroBadge: "Available for new projects",
busyBadge: "Currently busy, but say hi",
primaryEngine: "Unity",                     // [PLACEHOLDER] confirm
heroChip3: { title: "Mobile-first", subtitle: "Android · Web" },
aboutExternal: { label: "itch.io profile", url: "https://najo98.itch.io" },
socials: [
  { platform:"itch",     label:"itch.io",  url:"https://najo98.itch.io", order:0 },
  { platform:"github",   label:"GitHub",   url:"https://github.com/",     order:1 },   // [PLACEHOLDER]
  { platform:"linkedin", label:"LinkedIn", url:"https://www.linkedin.com/", order:2 } // [PLACEHOLDER]
],
stats: [
  { value:"3+",     label:"Games published on itch.io", order:0 },
  { value:"2D",     label:"Arcade & action gameplay",   order:1 },
  { value:"Mobile", label:"Android-first development",  order:2 }
]
```

## 3. Games (all published; descriptions are **[PLACEHOLDER]** pending Najeeb's real text)

| order | title | slug | genre | platforms | engine | status | featured | coverStyle | itch link | tags |
|---|---|---|---|---|---|---|---|---|---|---|
| 0 | Super Space Stronout | `super-space-stronout` | Arcade | Android, Web | Unity* | released | ✓ | space | https://najo98.itch.io/super-space-stronout | Space, Arcade, Casual |
| 1 | Battle Zone Master | `battle-zone-master` | Action | Android, Windows | Unity* | released | ✓ | battle | https://najo98.itch.io/battle-zone-master | Action, Shooter, Combat |
| 2 | 2D Air Shooter | `2d-air-shooter` | Shooter | Android, Web | Unity* | released | ✗ | jet | https://najo98.itch.io/2d-air-shooter | Shoot 'em up, 2D, Retro |

\* engine and platforms are unconfirmed.

Short descriptions:
- **Super Space Stronout:** "Float through deep space as a lone astronaut, dodge hazards and push for a new high score in this arcade space adventure."
- **Battle Zone Master:** "Drop into the battle zone, outlast waves of enemies and master every arena with fast, punchy combat."
- **2D Air Shooter:** "A classic vertical-scrolling air shooter: power up your jet, blast through enemy squadrons and chase the leaderboard."

Full descriptions (markdown): use the short description plus a "## Features" list with 3 generic bullets, and a "## How to play" line pointing to the itch.io page. Mark them [PLACEHOLDER].

`links`: one `itch` link each (the URLs above). `cover: null` (generated art), `gallery: []`, `trailerUrl: undefined`, `releaseYear: undefined`.

## 4. Skill categories & skills (levels are **[PLACEHOLDER]**)

| Category (order) | Skills (level) |
|---|---|
| Engines & Tools (0) | Unity (90), Git & Version Control (75), Blender / Asset prep (60) |
| Programming (1) | C# (88), Game Physics & AI (78), Performance Optimization (72) |
| Design (2) | Level Design (80), Game UI / HUD (82), Game Feel & Juice (85) |
| Publishing (3) | Android Build & Release (84), Ads & In-App Purchases (70), itch.io / Play Store (80) |

## 5. Experience (**[PLACEHOLDER]**)

1. type `freelance` · role "Indie Mobile Game Developer" · organization "Independent · itch.io (najo98)" · current: true · start year: current year (placeholder) · description: "Designing, programming and publishing my own arcade and action games, handling everything from gameplay systems and UI to builds and store pages."
2. type `jam` · role "Game Development Projects" · organization "Personal & game-jam work" · periodOverride "Earlier" · description: "Built prototypes to explore mechanics, controls and mobile performance."

## 6. Services

| order | icon | title | description |
|---|---|---|---|
| 0 | gamepad-2 | Mobile Game Development | Complete 2D/3D games for Android and iOS, built for smooth performance on real devices. |
| 1 | rocket | Rapid Prototyping | Turn your idea into a playable prototype fast, so you can test the fun before investing more. |
| 2 | sparkles | Game Feel & Polish | Juicy effects, responsive controls, screen shake and feedback that make every action satisfying. |
| 3 | smartphone | UI & HUD Design | Clean menus, HUDs and onboarding flows that players understand at a glance. |
| 4 | code | Ads & IAP Integration | Rewarded ads, interstitials and in-app purchases wired up the right way. |
| 5 | box | Publishing & Porting | Store-ready builds, store pages and porting to new platforms like WebGL and desktop. |

## 7. Testimonials
**None.** Seed an empty collection. The section is hidden.

## 8. Custom themes
None.

## 9. Admin user
Created by `pnpm create-admin` from env, not by the seed.
