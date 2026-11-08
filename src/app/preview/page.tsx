import type { Metadata } from "next";
import { HomeSections } from "@/components/sections/home-sections";
import { PreviewListener } from "@/components/site/preview-listener";
import { SiteChrome } from "@/components/site/site-chrome";
import { buildTheme, themeStyleSheet } from "@/lib/theme/resolve";
import { requireAdminPage } from "@/server/auth";
import { adminCustomThemes, adminSettings } from "@/server/queries/admin";
import { getExperiences, getProfile, getPublishedGames, getPublishedTestimonials, getServices, getSkillGroups } from "@/server/queries/public";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Theme preview", robots: { index: false, follow: false } };

/** Admin-only live preview of the home page with the unpublished theme draft (Architecture §9). */
export default async function PreviewPage() {
  await requireAdminPage();
  const [settings, custom, profile, games, groups, experiences, services, testimonials] = await Promise.all([
    adminSettings(),
    adminCustomThemes(),
    getProfile(),
    getPublishedGames(),
    getSkillGroups(),
    getExperiences(),
    getServices(),
    getPublishedTestimonials(),
  ]);
  const draft = settings.themeDraft ?? settings.theme;
  const theme = buildTheme(draft, custom);
  const previewSettings = { ...settings, theme: draft };
  return (
    <>
      {/* html:root beats the published :root rules from the root layout */}
      <style dangerouslySetInnerHTML={{ __html: themeStyleSheet(theme, "html:root") }} />
      <SiteChrome theme={theme} settings={previewSettings} profile={profile}>
        <HomeSections settings={previewSettings} profile={profile} games={games} groups={groups} experiences={experiences} services={services} testimonials={testimonials} />
      </SiteChrome>
      <PreviewListener />
    </>
  );
}
