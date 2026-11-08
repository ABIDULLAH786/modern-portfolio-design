import type { ResolvedTheme } from "@/lib/theme/resolve";
import type { ProfileDTO, SettingsDTO } from "@/lib/types";
import { initials } from "@/lib/utils/text";
import { BackgroundEffect } from "./background-effect";
import { Footer } from "./footer";
import { Navbar } from "./navbar";
import { RevealObserver } from "./reveal-observer";
import { Toaster } from "./toaster";

/** Public page frame: background effect, navbar, footer. Used by the site layout and /preview. */
export function SiteChrome({ theme, settings, profile, children }: { theme: ResolvedTheme; settings: SettingsDTO; profile: ProfileDTO; children: React.ReactNode }) {
  const links = settings.sections.filter((s) => s.visible && s.key !== "hero").map((s) => ({ key: s.key, label: s.label }));
  return (
    <div className={`site-root${theme.effect === "grid" ? " site-fx-grid" : ""}`} data-anim={theme.animations ? "on" : "off"} data-effect={theme.effect} data-font={theme.fontPair}>
      <a href="#main" className="skip-link sr-only-focusable">
        Skip to content
      </a>
      <BackgroundEffect effect={theme.effect} animate={theme.animations} />
      <Navbar name={profile.name} initials={initials(profile.name)} links={links} toggle={theme.toggle ? { defaultMode: theme.mode } : null} />
      <main id="main" className="site-main">
        {children}
      </main>
      <Footer profile={profile} />
      <RevealObserver />
      <Toaster />
    </div>
  );
}
