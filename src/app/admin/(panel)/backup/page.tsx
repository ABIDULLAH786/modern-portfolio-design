import { BackupEditor } from "@/components/admin/editors/backup-editor";
import { PageHeader } from "@/components/admin/page-header";

export default function BackupPage() {
  return (
    <>
      <PageHeader title="Backup" description="Download, restore or reset your content." />
      <BackupEditor />
    </>
  );
}
