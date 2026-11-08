import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { initials } from "@/lib/utils/text";
import { getAdmin } from "@/server/auth";
import { getProfile } from "@/server/queries/public";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin login", robots: { index: false, follow: false } };

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : "/admin";
  if (await getAdmin()) redirect(next.startsWith("/admin") ? next : "/admin");
  const profile = await getProfile();
  return (
    <main className="center-page font-sans">
      <div className="glow glow-primary" style={{ width: 420, height: 420, top: "5%", left: "15%" }} aria-hidden="true" />
      <div className="glow glow-accent" style={{ width: 360, height: 360, bottom: "5%", right: "10%", opacity: 0.2 }} aria-hidden="true" />
      <div className="relative w-full max-w-[400px] rounded-[calc(var(--radius)*1.4)] border border-border bg-surface p-8 text-left shadow-2xl">
        <span className="logo-mark mx-auto mb-4 size-12 text-base">{initials(profile.name)}</span>
        <h1 className="mb-1 text-center font-sans text-2xl font-bold tracking-tight">Admin login</h1>
        <p className="mb-6 text-center text-sm text-muted">Sign in to edit your portfolio.</p>
        <LoginForm next={next} />
      </div>
    </main>
  );
}
