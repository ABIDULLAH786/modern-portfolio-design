import { PageHeader } from "@/components/admin/page-header";
import { ProfileEditor } from "@/components/admin/editors/profile-editor";
import { adminProfile } from "@/server/queries/admin";

export default async function ProfilePage({ searchParams }: PageProps<"/admin/profile">) {
  const [profile, sp] = await Promise.all([adminProfile(), searchParams]);
  const tab = typeof sp.tab === "string" ? sp.tab : "basics";
  return (
    <>
      <PageHeader title="Profile" description="Your name, intro, photo, resume and contact details used across the site." />
      <ProfileEditor profile={profile} initialTab={tab} />
    </>
  );
}
