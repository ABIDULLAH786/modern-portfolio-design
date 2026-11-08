import { AccountEditor } from "@/components/admin/editors/account-editor";
import { PageHeader } from "@/components/admin/page-header";
import { requireAdminPage } from "@/server/auth";

export default async function AccountPage() {
  const admin = await requireAdminPage();
  return (
    <>
      <PageHeader title="Account" description="Your login email and password." />
      <AccountEditor email={admin.email} lastLoginAt={admin.lastLoginAt} />
    </>
  );
}
