import { ThemeStudio } from "@/components/admin/editors/theme-studio";
import { PageHeader } from "@/components/admin/page-header";
import { adminCustomThemes, adminSettings } from "@/server/queries/admin";

export default async function ThemePage() {
  const [settings, custom] = await Promise.all([adminSettings(), adminCustomThemes()]);
  return (
    <div className="theme-wide">
      <PageHeader title="Theme Studio" description="Change colours, fonts and effects. The preview updates instantly; publish when you're happy." />
      <ThemeStudio published={settings.theme} draft={settings.themeDraft} customThemes={custom} />
    </div>
  );
}
