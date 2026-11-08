import { SiteChrome } from "@/components/site/site-chrome";
import { getProfile, getSettings } from "@/server/queries/public";
import { getPublishedTheme } from "@/server/queries/theme";
import { Analytics } from "@/components/site/analytics";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const [theme, settings, profile] = await Promise.all([getPublishedTheme(), getSettings(), getProfile()]);
  return (
    <SiteChrome theme={theme} settings={settings} profile={profile}>
      {children}
      {settings.seo.analyticsEnabled && process.env.NEXT_PUBLIC_ANALYTICS === "1" ? <Analytics /> : null}
    </SiteChrome>
  );
}
