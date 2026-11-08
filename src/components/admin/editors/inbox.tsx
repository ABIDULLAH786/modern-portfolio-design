"use client";

import { AlertTriangle, Archive, ArchiveRestore, ArrowLeft, Copy, Download, Inbox as InboxIcon, Mail, MailOpen, Trash2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useAction } from "@/components/admin/use-action";
import { Button, buttonClass } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm";
import { Badge, EmptyState, Input } from "@/components/ui/inputs";
import type { MessageDTO } from "@/lib/types";
import { cn } from "@/lib/utils/cn";
import { relativeTime } from "@/lib/utils/text";
import { updateMessages } from "@/server/actions/messages";

type Status = "new" | "all" | "archived";

/** Server list, but keep the message currently being read visible even if it left this folder. */
function mergeKeepOpen(next: MessageDTO[], prev: MessageDTO[], openId: string): MessageDTO[] {
  if (next.some((m) => m.id === openId)) return next;
  const open = prev.find((m) => m.id === openId);
  return open ? [open, ...next] : next;
}
type Op = "read" | "unread" | "archive" | "unarchive" | "delete";

export function Inbox({ messages: initial, status, q, openId }: { messages: MessageDTO[]; status: Status; q: string; openId: string | null }) {
  const [openIdState, setOpenId] = useState<string | null>(openId);
  const [messages, setMessages] = useState(initial);
  // Keep local state in sync when the server sends a fresh list (same folder), without remounting.
  const [prevInitial, setPrevInitial] = useState(initial);
  if (initial !== prevInitial) {
    setPrevInitial(initial);
    setMessages(openIdState ? mergeKeepOpen(initial, messages, openIdState) : initial);
  }
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState(q);
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const { run } = useAction();
  const confirm = useConfirm();
  const open = messages.find((m) => m.id === openIdState) ?? null;

  const nav = (patch: Record<string, string | null>) => {
    const sp = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) sp.set(k, v);
      else sp.delete(k);
    }
    router.replace(`${pathname}?${sp.toString()}`);
  };

  const apply = async (ids: string[], op: Op, quiet = false) => {
    if (!ids.length) return;
    if (op === "delete" && !(await confirm({ title: ids.length === 1 ? "Delete this message?" : `Delete ${ids.length} messages?`, body: "This can't be undone.", confirmLabel: "Delete", danger: true }))) return;
    const prev = messages;
    setMessages((list) =>
      op === "delete"
        ? list.filter((m) => !ids.includes(m.id))
        : list.map((m) => (ids.includes(m.id) ? { ...m, status: op === "unread" ? "new" : op === "archive" ? "archived" : "read" } : m)),
    );
    const labels: Record<Op, string> = { read: "Marked as read", unread: "Marked as unread", archive: "Archived", unarchive: "Moved back to inbox", delete: "Deleted" };
    // Opening a message marks it read quietly without a refresh, so it doesn't vanish from "New" while being read.
    const r = await run(() => updateMessages({ ids, action: op }), { success: quiet ? false : labels[op], refresh: !quiet });
    if (!r.ok) setMessages(prev);
    setSelected(new Set());
    if (op === "delete" && open && ids.includes(open.id)) setOpenId(null);
  };

  const openMsg = (m: MessageDTO) => {
    setOpenId(m.id);
    if (m.status === "new") void apply([m.id], "read", true);
  };

  const exportHref = `/api/messages/export?status=${status}${q ? `&q=${encodeURIComponent(q)}` : ""}`;
  const allSelected = messages.length > 0 && selected.size === messages.length;

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div role="tablist" aria-label="Folder" className="flex gap-1 rounded-xl border border-border bg-surface p-1">
          {(["new", "all", "archived"] as const).map((s) => (
            <button key={s} type="button" role="tab" aria-selected={status === s} onClick={() => nav({ status: s, id: null })} className={cn("rounded-lg px-3 py-1.5 text-sm font-semibold", status === s ? "bg-primary-soft text-primary" : "text-muted")}>
              {s === "new" ? "New" : s === "all" ? "All" : "Archived"}
            </button>
          ))}
        </div>
        <form onSubmit={(e) => (e.preventDefault(), nav({ q: search || null, id: null }))} className="flex-1">
          <Input type="search" placeholder="Search name, email or message" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search messages" className="max-w-sm" />
        </form>
        <a href={exportHref} className={buttonClass("ghost", "sm")} download>
          <Download aria-hidden="true" /> Export CSV
        </a>
      </div>

      {selected.size ? (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm">
          <span className="mr-2 font-semibold">{selected.size} selected</span>
          <Button size="sm" onClick={() => void apply([...selected], "read")}>
            <MailOpen aria-hidden="true" /> Mark read
          </Button>
          <Button size="sm" onClick={() => void apply([...selected], status === "archived" ? "unarchive" : "archive")}>
            <Archive aria-hidden="true" /> {status === "archived" ? "Unarchive" : "Archive"}
          </Button>
          <Button size="sm" variant="danger" onClick={() => void apply([...selected], "delete")}>
            <Trash2 aria-hidden="true" /> Delete
          </Button>
        </div>
      ) : null}

      {messages.length === 0 ? (
        <EmptyState icon={<InboxIcon />} title={status === "new" ? "No new messages" : "No messages here"}>
          <p className="text-sm text-muted">Messages from your contact form appear here.</p>
        </EmptyState>
      ) : (
        <div className="grid min-h-[520px] overflow-hidden rounded-[var(--radius)] border border-border bg-surface lg:grid-cols-[minmax(280px,380px)_1fr]">
          <div className={cn("border-border lg:border-r", open && "max-lg:hidden")}>
            <label className="flex items-center gap-3 border-b border-border px-4 py-2.5 text-sm text-muted">
              <input type="checkbox" checked={allSelected} onChange={() => setSelected(allSelected ? new Set() : new Set(messages.map((m) => m.id)))} className="size-4 accent-[var(--primary)]" />
              Select all
            </label>
            <ul className="max-h-[70vh] overflow-y-auto">
              {messages.map((m) => (
                <li key={m.id} className={cn("flex items-start gap-3 border-b border-border px-4 py-3", open?.id === m.id && "bg-primary-soft")}>
                  <input
                    type="checkbox"
                    aria-label={`Select message from ${m.name}`}
                    checked={selected.has(m.id)}
                    onChange={() => setSelected((s) => (s.has(m.id) ? new Set([...s].filter((x) => x !== m.id)) : new Set([...s, m.id])))}
                    className="mt-1 size-4 shrink-0 accent-[var(--primary)]"
                  />
                  <button type="button" onClick={() => openMsg(m)} className="min-w-0 flex-1 text-left">
                    <span className="flex items-center gap-2">
                      {m.status === "new" ? <span className="size-2 shrink-0 rounded-full bg-primary" aria-label="Unread" /> : null}
                      <span className={cn("truncate", m.status === "new" ? "font-bold" : "font-medium")}>{m.name}</span>
                      {!m.emailDelivered ? <AlertTriangle className="size-3.5 shrink-0 text-warning" aria-label="Email notification not delivered" /> : null}
                      <span className="ml-auto shrink-0 text-xs text-muted">{relativeTime(m.createdAt)}</span>
                    </span>
                    {m.projectType ? <span className="block text-xs text-primary">{m.projectType}</span> : null}
                    <span className="block truncate text-sm text-muted">{m.body}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className={cn("p-5 sm:p-6", !open && "max-lg:hidden")}>
            {open ? (
              <article className="grid gap-5">
                <button type="button" onClick={() => setOpenId(null)} className="flex items-center gap-2 text-sm text-muted lg:hidden">
                  <ArrowLeft className="size-4" /> Back to list
                </button>
                <header className="grid gap-1">
                  <h2 className="text-xl font-bold">{open.name}</h2>
                  <p className="flex flex-wrap items-center gap-2 text-sm">
                    <a href={`mailto:${open.email}`} className="text-primary underline-offset-2 hover:underline">
                      {open.email}
                    </a>
                    <button
                      type="button"
                      className="grid size-7 place-items-center rounded-md text-muted hover:text-text"
                      aria-label="Copy email address"
                      onClick={async () => {
                        await navigator.clipboard.writeText(open.email).catch(() => undefined);
                        toast.success("Email copied");
                      }}
                    >
                      <Copy className="size-3.5" />
                    </button>
                  </p>
                  <p className="flex flex-wrap gap-2 text-xs text-muted">
                    {open.projectType ? <Badge tone="primary">{open.projectType}</Badge> : null}
                    {open.budget ? <Badge>{open.budget}</Badge> : null}
                    <span>{new Date(open.createdAt).toLocaleString()}</span>
                  </p>
                  {!open.emailDelivered ? (
                    <p className="mt-2 flex items-center gap-2 rounded-lg bg-warning/10 px-3 py-2 text-sm text-warning">
                      <AlertTriangle className="size-4" /> Email notification not delivered{open.emailError ? `: ${open.emailError}` : ""}. The message is safe here.
                    </p>
                  ) : null}
                </header>
                <div className="rounded-xl bg-bg/50 p-4 leading-relaxed whitespace-pre-wrap">{open.body}</div>
                <div className="flex flex-wrap gap-2">
                  <a href={`mailto:${open.email}?subject=${encodeURIComponent(`Re: your message${open.projectType ? ` (${open.projectType})` : ""}`)}`} className={buttonClass("primary", "sm")}>
                    <Mail aria-hidden="true" /> Reply
                  </a>
                  <Button size="sm" onClick={() => void apply([open.id], "unread")}>
                    <Mail aria-hidden="true" /> Mark unread
                  </Button>
                  {open.status === "archived" ? (
                    <Button size="sm" onClick={() => void apply([open.id], "unarchive")}>
                      <ArchiveRestore aria-hidden="true" /> Unarchive
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => void apply([open.id], "archive")}>
                      <Archive aria-hidden="true" /> Archive
                    </Button>
                  )}
                  <Button size="sm" variant="danger" onClick={() => void apply([open.id], "delete")}>
                    <Trash2 aria-hidden="true" /> Delete
                  </Button>
                </div>
              </article>
            ) : (
              <div className="grid h-full place-items-center text-muted">Select a message to read it.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
