import { SeoEditor } from "@/components/admin/editors/seo-editor";
import { PageHeader } from "@/components/admin/page-header";
import { siteUrl } from "@/lib/seo";
import { adminSettings } from "@/server/queries/admin";

export default async function SeoPage() {
  const settings = await adminSettings();
  return (
    <>
      <PageHeader title="SEO" description="How your site appears in Google and when it's shared on social media." />
      <SeoEditor seo={settings.seo} siteUrl={siteUrl} analyticsAvailable={process.env.NEXT_PUBLIC_ANALYTICS === "1"} />
    </>
  );
}
