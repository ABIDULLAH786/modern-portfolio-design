import { LayoutEditor } from "@/components/admin/editors/layout-editor";
import { PageHeader } from "@/components/admin/page-header";
import { adminSettings } from "@/server/queries/admin";

export default async function LayoutSectionsPage() {
  return (
    <>
      <PageHeader title="Layout" description="Show, hide, reorder and rename sections, and edit every heading on your site." />
      <LayoutEditor settings={await adminSettings()} />
    </>
  );
}
