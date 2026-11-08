import type { SectionKey } from "@/lib/constants";
import type { ExperienceDTO, GameDTO, ProfileDTO, ServiceDTO, SettingsDTO, SkillGroup, TestimonialDTO } from "@/lib/types";
import { orderGames } from "@/lib/utils/orderGames";
import { About } from "./about";
import { Contact } from "./contact";
import { Experience } from "./experience";
import { Games } from "./games";
import { Hero } from "./hero";
import { Services } from "./services";
import { Skills } from "./skills";
import { Testimonials } from "./testimonials";

type Data = {
  settings: SettingsDTO;
  profile: ProfileDTO;
  games: GameDTO[];
  groups: SkillGroup[];
  experiences: ExperienceDTO[];
  services: ServiceDTO[];
  testimonials: TestimonialDTO[];
};
/** Renders sections in CMS order; Hero is always first. Also used by /preview. */
export function HomeSections({ settings, profile, games, groups, experiences, services, testimonials }: Data) {
  const { copy, display } = settings;
  const visible = new Set(settings.sections.filter((s) => s.visible).map((s) => s.key));
  const ordered = orderGames(games, display.featuredFirst);
  const animate = settings.theme.animations;
  const firstSkill = groups.flatMap((g) => g.skills)[0]?.name ?? "";
  const turnstile = process.env.TURNSTILE_SITE_KEY || undefined;

  const render: Record<SectionKey, () => React.ReactNode> = {
    hero: () => <Hero key="hero" profile={profile} gameCount={games.length} gamesVisible={visible.has("games")} contactVisible={visible.has("contact")} engineFallback={firstSkill} />,
    about: () => <About key="about" profile={profile} copy={copy.about} contactVisible={visible.has("contact")} />,
    games: () => <Games key="games" games={ordered} copy={copy.games} limit={display.gamesOnHome} animate={animate} />,
    skills: () => (groups.some((g) => g.skills.length) ? <Skills key="skills" groups={groups} copy={copy.skills} showPercent={display.showSkillPercent} /> : null),
    experience: () => (experiences.length ? <Experience key="experience" items={experiences} copy={copy.experience} sort={display.experienceSort} /> : null),
    services: () => (services.length ? <Services key="services" items={services} copy={copy.services} /> : null),
    testimonials: () => (testimonials.length ? <Testimonials key="testimonials" items={testimonials} copy={copy.testimonials} /> : null),
    contact: () => <Contact key="contact" profile={profile} copy={copy.contact} {...(turnstile ? { turnstileSiteKey: turnstile } : {})} />,
  };

  const keys = ["hero" as SectionKey, ...settings.sections.filter((s) => s.visible && s.key !== "hero").map((s) => s.key)];
  return <>{keys.map((k) => render[k]?.())}</>;
}
