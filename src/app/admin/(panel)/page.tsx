import { ArrowRight, CheckCircle2, Circle, ExternalLink, Gamepad2, Inbox, Palette, PencilLine, Plus } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/admin/page-header";
import { buttonClass } from "@/components/ui/button";
import { Panel } from "@/components/ui/inputs";
import { firstName, relativeTime } from "@/lib/utils/text";
import { requireAdminPage } from "@/server/auth";
import { overviewStats, playClicksByGame } from "@/server/queries/admin";
import { setupChecklist } from "@/server/queries/checklist";
import { getProfile, getSettings } from "@/server/queries/public";

export default async function OverviewPage() {
  const admin = await requireAdminPage();
  const [stats, profile, checklist, settings] = await Promise.all([overviewStats(), getProfile(), setupChecklist(admin.passwordChangedAt), getSettings()]);
  const clicks = settings.seo.analyticsEnabled ? await playClicksByGame(30) : [];
  const maxClicks = Math.max(1, ...clicks.map((c) => c.count));
  const tiles = [
    { label: "Published games", value: stats.published, href: "/admin/games" },
    { label: "Drafts", value: stats.drafts, href: "/admin/games" },
    { label: "Unread messages", value: stats.unread, href: "/admin/messages" },
    { label: "Skills", value: stats.skills, href: "/admin/skills" },
    { label: "Last content update", value: stats.lastUpdate ? relativeTime(stats.lastUpdate) : "—", href: "/admin" },
  ];

  return (
    <>
      <PageHeader title={`Welcome back, ${firstName(profile.name) || "there"}`} description="Here's what's happening with your portfolio." />
      <ul className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
        {tiles.map((t) => (
          <li key={t.label}>
            <Link href={t.href} className="block h-full rounded-[var(--radius)] border border-border bg-surface p-4 transition hover:border-primary">
              <p className="font-display text-2xl font-extrabold">{t.value}</p>
              <p className="text-sm text-muted">{t.label}</p>
            </Link>
          </li>
        ))}
      </ul>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="grid content-start gap-6">
          {checklist.length ? (
            <Panel title="Setup checklist" description="Finish these so visitors see real, complete information.">
              <ul className="grid gap-1">
                {checklist.map((c) => (
                  <li key={c.label}>
                    <Link href={c.href} className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-surface-2">
                      <Circle className="size-4 shrink-0 text-warning" aria-hidden="true" />
                      <span className="flex-1 text-[0.95rem]">{c.label}</span>
                      <ArrowRight className="size-4 text-muted" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </Panel>
          ) : (
            <Panel>
              <p className="flex items-center gap-2 text-success">
                <CheckCircle2 className="size-5" aria-hidden="true" /> Setup complete. Everything is filled in.
              </p>
            </Panel>
          )}
          <Panel
            title="Recent messages"
            actions={
              <Link href="/admin/messages" className={buttonClass("ghost", "sm")}>
                Open inbox
              </Link>
            }
          >
            {stats.recent.length ? (
              <ul className="grid gap-1">
                {stats.recent.map((m) => (
                  <li key={m.id}>
                    <Link href={`/admin/messages?id=${m.id}`} className="flex items-start gap-3 rounded-xl px-3 py-2.5 hover:bg-surface-2">
                      <span className={`mt-2 size-2 shrink-0 rounded-full ${m.status === "new" ? "bg-primary" : "bg-transparent"}`} aria-hidden="true" />
                      <span className="min-w-0 flex-1">
                        <span className={m.status === "new" ? "font-bold" : "font-medium"}>{m.name}</span>
                        <span className="block truncate text-sm text-muted">{m.body}</span>
                      </span>
                      <span className="shrink-0 text-xs text-muted">{relativeTime(m.createdAt)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">No messages yet. They&apos;ll appear here when someone uses your contact form.</p>
            )}
          </Panel>
        </div>
        <div className="grid content-start gap-6">
          <Panel title="Quick actions">
            <div className="grid gap-2">
              <Link href="/admin/games/new" className={buttonClass("primary", "md", "justify-start")}>
                <Plus aria-hidden="true" /> Add game
              </Link>
              <Link href="/admin/theme" className={buttonClass("ghost", "md", "justify-start")}>
                <Palette aria-hidden="true" /> Change theme
              </Link>
              <Link href="/admin/profile" className={buttonClass("ghost", "md", "justify-start")}>
                <PencilLine aria-hidden="true" /> Edit profile
              </Link>
              <Link href="/admin/messages" className={buttonClass("ghost", "md", "justify-start")}>
                <Inbox aria-hidden="true" /> Read messages
              </Link>
              <a href="/" target="_blank" rel="noopener" className={buttonClass("ghost", "md", "justify-start")}>
                <ExternalLink aria-hidden="true" /> View live site
              </a>
            </div>
          </Panel>
          {settings.seo.analyticsEnabled ? (
            <Panel title="Play button clicks" description="Last 30 days">
              {clicks.length ? (
                <ul className="grid gap-2.5">
                  {clicks.map((c) => (
                    <li key={c.slug} className="grid gap-1">
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <Gamepad2 className="size-4 text-muted" aria-hidden="true" />
                          {c.slug}
                        </span>
                        <b className="tabular-nums">{c.count}</b>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                        <div className="h-full rounded-full bg-[image:var(--gradient)]" style={{ width: `${(c.count / maxClicks) * 100}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted">No clicks recorded yet.</p>
              )}
            </Panel>
          ) : null}
        </div>
      </div>
    </>
  );
}
