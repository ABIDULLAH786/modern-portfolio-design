import { ExperienceEditor } from "@/components/admin/editors/experience-editor";
import { PageHeader } from "@/components/admin/page-header";
import { adminExperiences, adminSettings } from "@/server/queries/admin";

export default async function ExperiencePage() {
  const [items, settings] = await Promise.all([adminExperiences(), adminSettings()]);
  return (
    <>
      <PageHeader title="Experience" description="Jobs, freelance work, education, game jams and achievements, shown as a timeline." />
      <ExperienceEditor items={items} sort={settings.display.experienceSort} />
    </>
  );
}
