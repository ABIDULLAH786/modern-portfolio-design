"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { NAV } from "./nav-items";

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);
}

/** Desktop: 240px sidebar (icons only below 1024px). Phones: bottom tab bar. */
export function Sidebar({ initials, unread }: { initials: string; unread: number }) {
  const pathname = usePathname();
  return (
    <>
      <aside className="sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-border bg-surface sm:flex sm:w-[68px] lg:w-[240px]" aria-label="Admin">
        <div className="flex items-center gap-3 px-4 py-5 lg:px-5">
          <span className="logo-mark">{initials}</span>
          <span className="hidden font-bold lg:inline">Dashboard</span>
        </div>
        <nav className="flex-1 overflow-y-auto px-2.5 pb-4">
          <ul className="grid gap-1">
            {NAV.map(({ href, label, icon: Icon, badge }) => {
              const active = isActive(pathname, href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    title={label}
                    className={cn(
                      "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.92rem] font-medium text-muted transition hover:bg-surface-2 hover:text-text",
                      active && "bg-primary-soft text-primary hover:bg-primary-soft hover:text-primary",
                    )}
                  >
                    <Icon className="size-[18px] shrink-0" aria-hidden="true" />
                    <span className="hidden lg:inline">{label}</span>
                    {badge === "unread" && unread > 0 ? (
                      <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-[0.7rem] font-bold text-on-primary max-lg:absolute max-lg:top-1 max-lg:right-1 max-lg:px-1.5" aria-label={`${unread} unread`}>
                        {unread}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur sm:hidden" aria-label="Admin">
        <ul className="flex overflow-x-auto px-1">
          {NAV.map(({ href, label, icon: Icon, badge }) => {
            const active = isActive(pathname, href);
            return (
              <li key={href} className="shrink-0">
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn("relative flex min-w-[68px] flex-col items-center gap-1 px-2 py-2 text-[0.66rem] font-semibold text-muted", active && "text-primary")}
                >
                  <Icon className="size-5" aria-hidden="true" />
                  {label}
                  {badge === "unread" && unread > 0 ? <span className="absolute top-1 right-3 size-2 rounded-full bg-primary" aria-label={`${unread} unread`} /> : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
