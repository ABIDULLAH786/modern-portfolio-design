"use client";

import { Bold, Heading2, Italic, Link2, List } from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { useRef, useState } from "react";
import { Textarea } from "@/components/ui/inputs";
import { cn } from "@/lib/utils/cn";

const TOOLS = [
  { icon: Bold, label: "Bold" },
  { icon: Italic, label: "Italic" },
  { icon: Heading2, label: "Heading" },
  { icon: List, label: "Bulleted list" },
  { icon: Link2, label: "Link" },
];

/** Markdown textarea with a small toolbar and Write / Preview tabs. */
export function MarkdownField({ id, value, onChange, rows = 8, maxLength, invalid }: { id: string; value: string; onChange: (v: string) => void; rows?: number; maxLength?: number; invalid?: boolean }) {
  const [tab, setTab] = useState<"write" | "preview">("write");
  const ref = useRef<HTMLTextAreaElement>(null);

  const wrap = (before: string, after = before, placeholder = "text") => {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const sel = value.slice(s, e) || placeholder;
    const next = value.slice(0, s) + before + sel + after + value.slice(e);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + before.length, s + before.length + sel.length);
    });
  };
  const linePrefix = (prefix: string) => {
    const el = ref.current;
    if (!el) return;
    const s = el.selectionStart;
    const lineStart = value.lastIndexOf("\n", s - 1) + 1;
    onChange(value.slice(0, lineStart) + prefix + value.slice(lineStart));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + prefix.length, s + prefix.length);
    });
  };

  const act = (tool: string) => {
    if (tool === "Bold") wrap("**");
    else if (tool === "Italic") wrap("*");
    else if (tool === "Heading") linePrefix("## ");
    else if (tool === "Bulleted list") linePrefix("- ");
    else if (tool === "Link") wrap("[", "](https://)", "link text");
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-surface-2/60 px-2 py-1.5">
        <div role="tablist" aria-label="Editor mode" className="mr-2 flex rounded-lg bg-bg p-0.5">
          {(["write", "preview"] as const).map((t) => (
            <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={cn("rounded-md px-3 py-1 text-xs font-semibold capitalize", tab === t ? "bg-primary text-on-primary" : "text-muted")}>
              {t}
            </button>
          ))}
        </div>
        {tab === "write"
          ? TOOLS.map(({ icon: Icon, label }) => (
              <button key={label} type="button" onClick={() => act(label)} className="grid size-8 place-items-center rounded-lg text-muted hover:bg-bg hover:text-text" aria-label={label} title={label}>
                <Icon className="size-4" />
              </button>
            ))
          : null}
        {maxLength ? <span className="ml-auto text-xs text-muted tabular-nums">{value.length}/{maxLength}</span> : null}
      </div>
      {tab === "write" ? (
        <Textarea ref={ref} id={id} rows={rows} value={value} onChange={(e) => onChange(e.target.value)} maxLength={maxLength} aria-invalid={invalid} className="rounded-none border-0 focus:shadow-none" />
      ) : (
        <div className="prose-md min-h-32 px-4 py-3 text-[0.95rem] text-muted">
          {value.trim() ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
              {value}
            </ReactMarkdown>
          ) : (
            <em>Nothing to preview yet.</em>
          )}
        </div>
      )}
    </div>
  );
}
