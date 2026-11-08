import { ServicesEditor } from "@/components/admin/editors/services-editor";
import { PageHeader } from "@/components/admin/page-header";
import { adminServices } from "@/server/queries/admin";

export default async function ServicesPage() {
  return (
    <>
      <PageHeader title="Services" description="What clients can hire you for. Up to 12. Drag to reorder." />
      <ServicesEditor items={await adminServices()} />
    </>
  );
}
