import { SkillsEditor } from "@/components/admin/editors/skills-editor";
import { PageHeader } from "@/components/admin/page-header";
import { adminSettings, adminSkills } from "@/server/queries/admin";

export default async function SkillsPage() {
  const [{ categories, skills }, settings] = await Promise.all([adminSkills(), adminSettings()]);
  return (
    <>
      <PageHeader title="Skills" description="Group your skills into categories. Changes save instantly." />
      <SkillsEditor categories={categories} skills={skills} showPercent={settings.display.showSkillPercent} />
    </>
  );
}
