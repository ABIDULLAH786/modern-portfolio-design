import { MediaLibrary } from "@/components/admin/editors/media-library";
import { PageHeader } from "@/components/admin/page-header";
import { env, imagekitConfigured } from "@/env";
import { adminMedia } from "@/server/queries/admin";

export default async function MediaPage() {
  const items = await adminMedia();
  const used = items.reduce((s, m) => s + m.bytes, 0);
  return (
    <>
      <PageHeader title="Media" description="Every image and document you've uploaded, stored on ImageKit." />
      <MediaLibrary items={items} configured={imagekitConfigured()} usedBytes={used} capMb={env().IMAGEKIT_MAX_STORAGE_MB ?? null} />
    </>
  );
}
