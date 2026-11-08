import { ExternalLink, LogOut } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Toaster } from "sonner";
import { LeaveGuardProvider } from "@/components/admin/leave-guard";
import { Sidebar } from "@/components/admin/sidebar";
import { buttonClass } from "@/components/ui/button";
import { ConfirmProvider } from "@/components/ui/confirm";
import { initials } from "@/lib/utils/text";
import { logout } from "@/server/actions/auth";
import { requireAdminPage } from "@/server/auth";
import { unreadCount } from "@/server/queries/admin";
import { getProfile } from "@/server/queries/public";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Dashboard", robots: { index: false, follow: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdminPage();
  const [unread, profile] = await Promise.all([unreadCount(), getProfile()]);
  return (
    <div className="admin flex min-h-dvh font-sans">
      <ConfirmProvider>
        <LeaveGuardProvider>
          <Sidebar initials={initials(profile.name)} unread={unread} />
          <div className="flex min-w-0 flex-1 flex-col">
            <header className="sticky top-0 z-30 flex items-center justify-end gap-2 border-b border-border bg-[var(--glass)] px-4 py-3 backdrop-blur-md sm:px-6">
              <span className="mr-auto truncate text-sm text-muted">Signed in as {admin.email}</span>
              <a href="/" target="_blank" rel="noopener" className={buttonClass("ghost", "sm")}>
                <span className="hidden sm:inline">View live site</span>
                <span className="sm:hidden">Site</span>
                <ExternalLink aria-hidden="true" />
              </a>
              <form action={logout}>
                <button type="submit" className={buttonClass("subtle", "sm")} aria-label="Log out">
                  <LogOut aria-hidden="true" />
                  <span className="hidden sm:inline">Log out</span>
                </button>
              </form>
            </header>
            <main id="main" className="mx-auto w-full max-w-[1100px] flex-1 px-4 pt-6 pb-28 sm:px-6 sm:pb-12 lg:px-8">
              {children}
            </main>
          </div>
          <Toaster position="bottom-center" toastOptions={{ style: { background: "var(--text)", color: "var(--bg)", border: "0", borderRadius: "999px" } }} />
          <Link href="#main" className="sr-only">
            Skip to content
          </Link>
        </LeaveGuardProvider>
      </ConfirmProvider>
    </div>
  );
}
