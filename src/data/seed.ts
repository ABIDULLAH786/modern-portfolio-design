/**
 * Starter content (docs/06-SEED-CONTENT.md), updated with the real details from
 * Najeeb's resume (docs/reference/Najeeb Ullah_2.pdf).
 *
 * Values marked [PLACEHOLDER] are not confirmed by Najeeb. Their hashes are stored in
 * settings.seedHashes so the admin "Setup checklist" can flag them until they're edited.
 */
import type { CoverStyle, ExperienceType, GameStatus, LinkKind, SectionKey, ServiceIcon, SocialPlatform } from "@/lib/constants";
import type { ThemeSettings } from "@/lib/theme/types";
import type { CopyInput, DisplayInput } from "@/lib/validation/settings";

const ITCH = "https://najo98.itch.io";

export const seedTheme: ThemeSettings = {
  source: { kind: "preset", id: "neon" },
  overrides: {},
  fontPair: "sora",
  radius: 18,
  effect: "starfield",
  animations: true,
  visitorToggle: { enabled: false, darkSource: { kind: "preset", id: "neon" }, lightSource: { kind: "preset", id: "light" } },
};

export const seedSections: Array<{ key: SectionKey; label: string; visible: boolean; order: number }> = [
  { key: "hero", label: "Home", visible: true, order: 0 },
  { key: "about", label: "About", visible: true, order: 1 },
  { key: "games", label: "Games", visible: true, order: 2 },
  { key: "skills", label: "Skills", visible: true, order: 3 },
  { key: "experience", label: "Experience", visible: true, order: 4 },
  { key: "services", label: "Services", visible: true, order: 5 },
  { key: "testimonials", label: "Testimonials", visible: false, order: 6 },
  { key: "contact", label: "Contact", visible: true, order: 7 },
];

export const seedCopy: CopyInput = {
  about: { eyebrow: "About me", title: "Crafting games that feel great to play", subtitle: "" },
  games: {
    eyebrow: "Portfolio",
    title: "Games I've built & shipped",
    subtitle: "Personal projects, freelance client work and itch.io releases. Open any game for details, or play it on itch.io.",
  },
  skills: { eyebrow: "Skills", title: "Tools & skills", subtitle: "The engines, languages and craft behind my games." },
  experience: { eyebrow: "Experience", title: "My journey", subtitle: "" },
  services: { eyebrow: "Services", title: "What I can do for you", subtitle: "From idea to app store, I can help at every stage of your game." },
  testimonials: { eyebrow: "Testimonials", title: "What people say", subtitle: "" },
  contact: {
    eyebrow: "Contact",
    title: "Let's build your next game",
    subtitle: "Have a game idea, a project or a role in mind? Send a message and I'll get back to you.",
    successMessage: "Thanks! Your message has been received. I'll reply soon.",
    projectTypes: ["New mobile game", "Prototype", "Job opportunity", "Collaboration", "Other"],
    budgetEnabled: false,
    budgetOptions: ["Under $500", "$500 – $2,000", "$2,000 – $5,000", "$5,000+", "Not sure yet"],
    autoReply: {
      enabled: false,
      subject: "Thanks for reaching out!",
      body: "Hi {name},\n\nThanks for your message. I've received it and will get back to you within 1–2 days.\n\n— Najeeb",
    },
  },
};

export const seedDisplay: DisplayInput = { gamesOnHome: 6, featuredFirst: false, showSkillPercent: true, experienceSort: "manual" };

export const seedSeo = {
  siteTitle: "Najeeb Ullah — Mobile Game Developer",
  description:
    "Portfolio of Najeeb Ullah, a Unity game developer building mobile games for Android and the web: multiplayer, puzzle, arcade, racing and shooter games.",
  keywords: ["Najeeb Ullah", "mobile game developer", "Unity developer", "Unity 3D", "C#", "indie games", "itch.io", "Pakistan game developer"],
  ogImage: null,
  favicon: null,
  googleVerification: "",
  analyticsEnabled: false,
};

export const seedProfile = {
  name: "Najeeb Ullah",
  role: "Mobile Game Developer",
  tagline: "I design and build fun, polished games for mobile and the web, from the first prototype to a published release.",
  bio:
    "I'm a Computer Science graduate with a strong passion for game development, specialising in **Unity 3D** and **C#**.\n\n" +
    "I design and build interactive games end to end: gameplay mechanics, UI systems, AI opponents, real-time multiplayer and asset integration. " +
    "I care about clean, object-oriented code and smooth performance on real mobile devices and PC.\n\n" +
    "I'm eager to join a creative, collaborative team, or to help you take your game from concept to final build.",
  avatar: null,
  cv: null,
  location: "Balochistan, Pakistan",
  email: "najibyarkhan@gmail.com",
  phone: "",
  available: true,
  availabilityText: "Open to freelance & full-time roles",
  heroBadge: "Available for new projects",
  busyBadge: "Currently busy, but say hi",
  primaryEngine: "Unity 3D",
  heroChip3: { title: "Mobile-first", subtitle: "Android · iOS" },
  aboutExternal: { label: "itch.io profile", url: ITCH },
  languages: ["English (intermediate)", "Urdu"],
  socials: [
    { id: "s-itch", platform: "itch" as SocialPlatform, label: "itch.io", url: ITCH },
    { id: "s-linkedin", platform: "linkedin" as SocialPlatform, label: "LinkedIn", url: "https://www.linkedin.com/in/najib-khan-21a969265/" },
    { id: "s-coursera", platform: "coursera" as SocialPlatform, label: "Coursera", url: "https://www.coursera.org/learner/najib-khan-2024" },
  ],
  stats: [
    { id: "st-1", value: "8+", label: "Games & projects built in Unity" },
    { id: "st-2", value: "3", label: "Freelance client projects delivered" },
    { id: "st-3", value: "BS", label: "Computer Science, 2020 – 2024" },
  ],
};

export interface SeedGame {
  title: string;
  slug: string;
  status: GameStatus;
  featured: boolean;
  genre: string;
  platforms: string[];
  engine: string;
  coverStyle: CoverStyle;
  tags: string[];
  shortDescription: string;
  description: string;
  links: Array<{ kind: LinkKind; url: string; label: string }>;
  /** True when the description is generic and should be replaced by Najeeb. */
  placeholder: boolean;
}

const howToPlay = (slug: string) => `## How to play\nPlay it for free on [itch.io](${ITCH}/${slug}).`;

export const seedGames: SeedGame[] = [
  {
    title: "Checkers — Online Multiplayer",
    slug: "checkers-online-multiplayer",
    status: "in-development",
    featured: true,
    genre: "Strategy",
    platforms: ["Android"],
    engine: "Unity 3D",
    coverStyle: "arcade",
    tags: ["Multiplayer", "Board game", "AI", "Photon"],
    shortDescription:
      "An online and offline multiplayer checkers game with AI opponents, multiple difficulty levels and real-time multiplayer powered by Photon PUN 2.",
    description:
      "A modern take on classic checkers, built in Unity 3D for Android. Play against friends online, pass-and-play offline, or challenge the AI.\n\n" +
      "## Features\n- Online multiplayer with real-time synchronisation (Photon PUN 2)\n- Offline mode with AI opponents and multiple difficulty levels\n- Custom movement and capture mechanics\n\n" +
      "## Status\nPersonal project, currently in final testing.",
    links: [],
    placeholder: false,
  },
  {
    title: "Battle Zone Master",
    slug: "battle-zone-master",
    status: "released",
    featured: true,
    genre: "Shooter",
    platforms: ["Android", "Windows"],
    engine: "Unity 3D",
    coverStyle: "battle",
    tags: ["Multiplayer", "FPS", "Team deathmatch"],
    shortDescription:
      "A multiplayer team deathmatch shooter with customised weapons, maps and gameplay mechanics. My final year project, built with Unity and MFPS.",
    description:
      "Drop into the battle zone and fight it out in fast team deathmatch matches.\n\n" +
      "## Features\n- Multiplayer team deathmatch\n- Customised weapons and maps\n- Gameplay mechanics built on top of MFPS (Multiplayer FPS)\n\n" +
      "Built as my BS Computer Science final year project.\n\n" +
      howToPlay("battle-zone-master"),
    links: [{ kind: "itch", url: `${ITCH}/battle-zone-master`, label: "" }],
    placeholder: false,
  },
  {
    title: "Block Puzzle",
    slug: "block-puzzle",
    status: "released",
    featured: false,
    genre: "Puzzle",
    platforms: ["Android"],
    engine: "Unity 2D",
    coverStyle: "arcade",
    tags: ["Puzzle", "Casual", "Client project"],
    shortDescription:
      "A complete 2D block puzzle game with grid-based placement, row and column detection, and automatic line-clearing. Built for a freelance client.",
    description:
      "A relaxing, satisfying block puzzle for Android, built in Unity 2D for a freelance client.\n\n" +
      "## Features\n- Grid-based block placement\n- Row and column detection\n- Automatic line-clearing mechanics",
    links: [],
    placeholder: false,
  },
  {
    title: "Low-Poly Car Stunt",
    slug: "low-poly-car-stunt",
    status: "released",
    featured: false,
    genre: "Racing",
    platforms: ["Android"],
    engine: "Unity 3D",
    coverStyle: "jet",
    tags: ["Racing", "Stunts", "Low-poly", "Client project"],
    shortDescription:
      "A 3D platform-based car stunt game with vehicle controls, coin collection, checkpoints and challenging platform navigation. Freelance client project.",
    description:
      "Race across floating low-poly platforms and pull off stunts without falling off. Built in Unity 3D for a freelance client.\n\n" +
      "## Features\n- Responsive vehicle controls\n- Coin collection and checkpoints\n- Challenging platform navigation",
    links: [],
    placeholder: false,
  },
  {
    title: "Super Space Stronout",
    slug: "super-space-stronout",
    status: "released",
    featured: true,
    genre: "Arcade",
    platforms: ["Android", "Web"],
    engine: "Unity",
    coverStyle: "space",
    tags: ["Space", "Arcade", "Casual"],
    shortDescription:
      "Float through deep space as a lone astronaut, dodge hazards and push for a new high score in this arcade space adventure.",
    description:
      "Float through deep space as a lone astronaut, dodge hazards and push for a new high score in this arcade space adventure.\n\n" +
      "## Features\n- Simple one-touch controls\n- Endless, score-chasing gameplay\n- Colourful space visuals\n\n" +
      howToPlay("super-space-stronout"),
    links: [{ kind: "itch", url: `${ITCH}/super-space-stronout`, label: "" }],
    placeholder: true,
  },
  {
    title: "2D Air Shooter",
    slug: "2d-air-shooter",
    status: "released",
    featured: false,
    genre: "Shooter",
    platforms: ["Android", "Web"],
    engine: "Unity",
    coverStyle: "jet",
    tags: ["Shoot 'em up", "2D", "Retro"],
    shortDescription:
      "A classic vertical-scrolling air shooter: power up your jet, blast through enemy squadrons and chase the leaderboard.",
    description:
      "A classic vertical-scrolling air shooter: power up your jet, blast through enemy squadrons and chase the leaderboard.\n\n" +
      "## Features\n- Vertical-scrolling shoot 'em up action\n- Power-ups and enemy squadrons\n- Retro arcade feel\n\n" +
      howToPlay("2d-air-shooter"),
    links: [{ kind: "itch", url: `${ITCH}/2d-air-shooter`, label: "" }],
    placeholder: true,
  },
  {
    title: "Rotating Cubes",
    slug: "rotating-cubes",
    status: "released",
    featured: false,
    genre: "Strategy",
    platforms: ["Android"],
    engine: "Unity 3D",
    coverStyle: "arcade",
    tags: ["Turn-based", "AI", "Client project"],
    shortDescription:
      "A turn-based strategy game with AI movement, rerouting paths, cube interactions and obstacle placement. Freelance client project.",
    description:
      "A turn-based 3D strategy game built in Unity for a freelance client.\n\n" +
      "## Features\n- AI movement with path rerouting\n- Cube interactions\n- Obstacle placement",
    links: [],
    placeholder: false,
  },
  {
    title: "Master Test — Quiz Game",
    slug: "master-test-quiz-game",
    status: "released",
    featured: false,
    genre: "Trivia",
    platforms: ["Android"],
    engine: "Unity 2D",
    coverStyle: "space",
    tags: ["Quiz", "Education", "Timed"],
    shortDescription: "A quiz game with subject-based questions, timed gameplay, scoring and result statistics.",
    description:
      "Test your knowledge across subjects against the clock. A personal project built in Unity 2D for Android.\n\n" +
      "## Features\n- Subject-based questions\n- Timed gameplay and scoring\n- Result statistics",
    links: [],
    placeholder: false,
  },
];

/** Skill levels are [PLACEHOLDER] estimates; the skill names come from the resume. */
export const seedSkills: Array<{ category: string; skills: Array<[string, number]> }> = [
  { category: "Engines & Tools", skills: [["Unity 3D", 90], ["Photon PUN 2 (multiplayer)", 72], ["Git & Version Control", 75]] },
  { category: "Programming", skills: [["C#", 88], ["Object-Oriented Programming", 85], ["Performance Optimization", 74]] },
  { category: "Game Design", skills: [["Game Design", 82], ["Level Design", 80], ["Game UI Systems", 80], ["Scene Management", 82]] },
  { category: "Mobile & Publishing", skills: [["Mobile Development (Android / iOS)", 85], ["Play Store / App Store Deployment", 78], ["Game Testing", 80]] },
];

export const seedExperiences: Array<{
  type: ExperienceType;
  role: string;
  organization: string;
  location: string;
  url: string;
  start: { month: number | null; year: number } | null;
  end: { month: number | null; year: number } | null;
  current: boolean;
  periodOverride: string;
  description: string;
}> = [
  {
    type: "freelance",
    role: "Freelance Unity Game Developer",
    organization: "Client projects",
    location: "Remote",
    url: "",
    start: null,
    end: null,
    current: true,
    periodOverride: "Present",
    description:
      "Building complete Android games for clients in Unity 2D and 3D: a block puzzle game, a low-poly car stunt game and the turn-based strategy game *Rotating Cubes*.",
  },
  {
    type: "project",
    role: "Indie Game Developer",
    organization: "Independent · itch.io (najo98)",
    location: "",
    url: ITCH,
    start: null,
    end: null,
    current: true,
    periodOverride: "Present",
    description:
      "Designing, programming and publishing my own games, from arcade and shooter games on itch.io to *Checkers*, an online multiplayer board game built with Photon PUN 2.",
  },
  {
    type: "education",
    role: "BS Computer Science",
    organization: "University of Loralai",
    location: "Balochistan, Pakistan",
    url: "",
    start: { month: null, year: 2020 },
    end: { month: null, year: 2024 },
    current: false,
    periodOverride: "",
    description: "Final year project: **Battle Zone Master**, a multiplayer team deathmatch shooter built in Unity with MFPS.",
  },
  {
    type: "achievement",
    role: "Online certificates",
    organization: "Coursera",
    location: "",
    url: "https://www.coursera.org/learner/najib-khan-2024",
    start: null,
    end: null,
    current: false,
    periodOverride: "Certificates",
    description: "Completed online courses and certificates on Coursera.",
  },
];

export const seedServices: Array<{ icon: ServiceIcon; title: string; description: string }> = [
  { icon: "gamepad-2", title: "Mobile Game Development", description: "Complete 2D/3D games for Android and iOS, built in Unity for smooth performance on real devices." },
  { icon: "users", title: "Multiplayer & AI", description: "Online multiplayer with Photon PUN 2, and AI opponents with difficulty levels that feel fair and fun." },
  { icon: "rocket", title: "Rapid Prototyping", description: "Turn your idea into a playable prototype fast, so you can test the fun before investing more." },
  { icon: "sparkles", title: "Game Feel & Polish", description: "Juicy effects, responsive controls and feedback that make every action satisfying." },
  { icon: "smartphone", title: "UI & HUD Systems", description: "Clean menus, HUDs and onboarding flows that players understand at a glance." },
  { icon: "box", title: "Publishing & Testing", description: "Store-ready builds, game testing and deployment to Google Play, the App Store and itch.io." },
];

/** Path of the resume that the seed uploads to ImageKit (if configured and no resume exists yet). */
export const seedResumePath = "docs/reference/Najeeb Ullah_2.pdf";
