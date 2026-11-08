import { TestimonialsEditor } from "@/components/admin/editors/testimonials-editor";
import { PageHeader } from "@/components/admin/page-header";
import { adminTestimonials } from "@/server/queries/admin";

export default async function TestimonialsPage() {
  return (
    <>
      <PageHeader title="Testimonials" description="Quotes from clients and collaborators. The section stays hidden until at least one is published." />
      <p className="mb-5 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm">Only add real feedback from real people, and ask them first.</p>
      <TestimonialsEditor items={await adminTestimonials()} />
    </>
  );
}
