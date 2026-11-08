"use client";

import { Check, ExternalLink, Laptop, MoreHorizontal, RotateCcw, Smartphone, Tablet, Wand2 } from "lucide-react";
import { DropdownMenu } from "radix-ui";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ColorField } from "@/components/admin/color-field";
import { useUnsavedChanges } from "@/components/admin/leave-guard";
import { useAction } from "@/components/admin/use-action";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Panel, Select } from "@/components/ui/inputs";
import { Switch, SwitchRow } from "@/components/ui/switch";
import { contrastReport, deriveTokens, generateFromPrimary } from "@/lib/theme/derive";
import { FONT_PAIRS, FONT_PAIR_IDS } from "@/lib/theme/font-pairs";
import { PRESETS, PRESET_IDS, type ThemeBase } from "@/lib/theme/presets";
import { buildTheme, resolveSource, resolveTheme } from "@/lib/theme/resolve";
import type { ColorKey, CustomThemeDTO, ThemeSettings, ThemeSource } from "@/lib/theme/types";
import { cn } from "@/lib/utils/cn";
import { createCustomTheme, deleteCustomTheme, discardThemeDraft, publishTheme, renameCustomTheme, saveThemeDraft } from "@/server/actions/theme";

const COLOR_FIELDS: Array<[ColorKey, string]> = [
  ["primary", "Primary"],
  ["accent", "Accent"],
  ["bg", "Background"],
  ["surface", "Cards"],
  ["text", "Text"],
];
const DEVICES = [
  { w: 1280, label: "Desktop", icon: Laptop },
  { w: 820, label: "Tablet", icon: Tablet },
  { w: 390, label: "Mobile", icon: Smartphone },
] as const;

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const srcKey = (s: ThemeSource) => `${s.kind}:${s.id}`;

function Swatch({ base, name, mode, active, onClick }: { base: ThemeBase; name: string; mode: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={cn("relative rounded-2xl border-2 p-2 text-left transition hover:-translate-y-0.5", active ? "border-primary" : "border-border")}>
      <span className="relative mb-2 flex h-14 items-end gap-1 overflow-hidden rounded-lg p-1.5" style={{ background: base.bg, boxShadow: "inset 0 0 0 1px rgba(128,128,128,.25)" }}>
        <b className="absolute top-2 right-2 left-2 h-1.5 rounded" style={{ background: `linear-gradient(90deg, ${base.primary}, ${base.accent})` }} />
        <i className="block size-3.5 rounded-full" style={{ background: base.primary }} />
        <i className="block size-3.5 rounded-full" style={{ background: base.accent }} />
        <i className="block size-3.5 rounded-full" style={{ background: base.surface, boxShadow: "0 0 0 1px rgba(128,128,128,.4)" }} />
      </span>
      <span className="block truncate text-xs font-bold">{name}</span>
      <span className="block text-[0.68rem] text-muted capitalize">{mode}</span>
      {active ? (
        <span className="absolute top-1 right-1 grid size-5 place-items-center rounded-full bg-primary text-on-primary">
          <Check className="size-3" aria-hidden="true" />
        </span>
      ) : null}
    </button>
  );
}

export function ThemeStudio({ published, draft: initialDraft, customThemes: initialCustom }: { published: ThemeSettings; draft: ThemeSettings | null; customThemes: CustomThemeDTO[] }) {
  const [theme, setTheme] = useState<ThemeSettings>(initialDraft ?? published);
  const [live, setLive] = useState(published);
  const [custom, setCustom] = useState(initialCustom);
  const [device, setDevice] = useState<number>(1280);
  const [tab, setTab] = useState<"controls" | "preview">("controls");
  const [saveAs, setSaveAs] = useState<{ open: boolean; name: string }>({ open: false, name: "" });
  const [rename, setRename] = useState<{ id: string; name: string } | null>(null);
  const [gen, setGen] = useState<{ open: boolean; primary: string; mode: "dark" | "light" }>({ open: false, primary: "#7C5CFF", mode: "dark" });
  const [saving, setSaving] = useState<"idle" | "saving" | "saved">("idle");
  const iframe = useRef<HTMLIFrameElement>(null);
  const frameBox = useRef<HTMLDivElement>(null);
  const [boxW, setBoxW] = useState(800);
  const saveTimer = useRef<number | undefined>(undefined);
  const lastSavedEffect = useRef(theme.effect);
  const { run, pending } = useAction();
  const confirm = useConfirm();

  const hasDraft = !same(theme, live);
  useUnsavedChanges("theme-draft", false); // the draft autosaves; nothing is lost when leaving

  const resolved = useMemo(() => buildTheme(theme, custom), [theme, custom]);
  const base = useMemo(() => resolveTheme(theme, custom), [theme, custom]);
  const contrast = useMemo(() => contrastReport(deriveTokens(base)), [base]);
  const sourceBase = useMemo(() => resolveSource(theme.source, custom), [theme.source, custom]);

  /* Instant preview via postMessage. */
  const post = useCallback(() => {
    iframe.current?.contentWindow?.postMessage({ type: "theme-preview", vars: resolved.vars, animations: resolved.animations, effect: resolved.effect, fontPair: resolved.fontPair }, window.location.origin);
  }, [resolved]);
  useEffect(post, [post]);
  useEffect(() => {
    const on = (e: MessageEvent) => e.origin === window.location.origin && (e.data as { type?: string })?.type === "preview-ready" && post();
    window.addEventListener("message", on);
    return () => window.removeEventListener("message", on);
  }, [post]);

  /* Debounced draft autosave (800 ms). */
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    window.clearTimeout(saveTimer.current);
    if (!hasDraft) return;
    saveTimer.current = window.setTimeout(async () => {
      const r = await saveThemeDraft(theme);
      setSaving(r.ok ? "saved" : "idle");
      if (!r.ok) toast.error(r.error);
      // A new effect (e.g. starfield) needs a fresh render of the preview.
      if (r.ok && theme.effect !== lastSavedEffect.current) {
        lastSavedEffect.current = theme.effect;
        iframe.current?.contentWindow?.location.reload();
      }
    }, 800);
    return () => window.clearTimeout(saveTimer.current);
  }, [theme, hasDraft]);

  useEffect(() => {
    const el = frameBox.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => e && setBoxW(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const update = (patch: Partial<ThemeSettings>) => {
    setSaving("saving");
    setTheme((t) => ({ ...t, ...patch }));
  };
  const pickSource = (source: ThemeSource) => {
    const prev = theme;
    update({ source, overrides: {} });
    if (Object.keys(prev.overrides).length) {
      toast("Custom colours were reset for this theme", { action: { label: "Undo", onClick: () => setTheme(prev) } });
    }
  };
  const setColor = (k: ColorKey, v: string) => {
    const overrides = { ...theme.overrides, [k]: v };
    if (sourceBase[k].toUpperCase() === v.toUpperCase()) delete overrides[k];
    update({ overrides });
  };

  const doPublish = async () => {
    window.clearTimeout(saveTimer.current);
    const r = await run(() => publishTheme(theme), { success: "Theme published · live site updated" });
    if (r.ok) {
      setLive(theme);
      setSaving("idle");
    }
  };
  const doDiscard = async () => {
    if (!(await confirm({ title: "Discard theme changes?", body: "The preview goes back to your live theme.", confirmLabel: "Discard", danger: true }))) return;
    window.clearTimeout(saveTimer.current);
    const r = await run(() => discardThemeDraft(), { success: "Changes discarded", refresh: false });
    if (r.ok) {
      setTheme(live);
      first.current = true;
      setSaving("idle");
      iframe.current?.contentWindow?.location.reload();
    }
  };

  const scale = Math.min(1, boxW / device);
  const darkThemes = [...PRESET_IDS.filter((id) => PRESETS[id].mode === "dark").map((id) => ({ key: `preset:${id}`, name: PRESETS[id].name })), ...custom.filter((c) => c.mode === "dark").map((c) => ({ key: `custom:${c.id}`, name: c.name }))];
  const lightThemes = [...PRESET_IDS.filter((id) => PRESETS[id].mode === "light").map((id) => ({ key: `preset:${id}`, name: PRESETS[id].name })), ...custom.filter((c) => c.mode === "light").map((c) => ({ key: `custom:${c.id}`, name: c.name }))];
  const parseKey = (k: string): ThemeSource => {
    const [kind, id] = k.split(":");
    return { kind: kind === "custom" ? "custom" : "preset", id: id ?? "neon" };
  };

  const controls = (
    <div className="grid gap-5">
      <Panel title="Theme presets" description="Pick a ready-made theme, then fine-tune it below.">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {PRESET_IDS.map((id) => (
            <Swatch key={id} base={PRESETS[id]} name={PRESETS[id].name} mode={PRESETS[id].mode} active={theme.source.kind === "preset" && theme.source.id === id && !Object.keys(theme.overrides).length} onClick={() => pickSource({ kind: "preset", id })} />
          ))}
        </div>
        {custom.length ? (
          <div className="grid gap-2">
            <p className="text-sm font-semibold">My themes</p>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {custom.map((c) => (
                <div key={c.id} className="relative">
                  <Swatch base={c} name={c.name} mode={c.mode} active={theme.source.kind === "custom" && theme.source.id === c.id && !Object.keys(theme.overrides).length} onClick={() => pickSource({ kind: "custom", id: c.id })} />
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger className="absolute right-1 bottom-1 grid size-7 place-items-center rounded-lg bg-surface text-muted hover:text-text" aria-label={`Options for ${c.name}`}>
                      <MoreHorizontal className="size-4" />
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.Content align="end" className="z-[70] min-w-36 rounded-xl border border-border bg-surface p-1 shadow-2xl">
                        <DropdownMenu.Item onSelect={() => setRename({ id: c.id, name: c.name })} className="cursor-pointer rounded-lg px-3 py-2 text-sm outline-none data-[highlighted]:bg-surface-2">
                          Rename
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          onSelect={async () => {
                            if (!(await confirm({ title: `Delete “${c.name}”?`, confirmLabel: "Delete", danger: true }))) return;
                            const r = await run(() => deleteCustomTheme(c.id), { success: "Theme deleted", refresh: false });
                            if (r.ok) setCustom((l) => l.filter((x) => x.id !== c.id));
                          }}
                          className="cursor-pointer rounded-lg px-3 py-2 text-sm text-danger outline-none data-[highlighted]:bg-danger/10"
                        >
                          Delete
                        </DropdownMenu.Item>
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </Panel>

      <Panel
        title="Custom colours"
        actions={
          Object.keys(theme.overrides).length ? (
            <Button size="sm" variant="link" onClick={() => update({ overrides: {} })}>
              <RotateCcw aria-hidden="true" /> Reset to preset
            </Button>
          ) : null
        }
      >
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {COLOR_FIELDS.map(([k, label]) => (
            <ColorField key={k} label={label} value={base[k]} overridden={k in theme.overrides} onChange={(v) => setColor(k, v)} />
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => setSaveAs({ open: true, name: "" })}>
            Save as my theme…
          </Button>
          <Button size="sm" onClick={() => setGen({ open: true, primary: base.primary, mode: base.mode })}>
            <Wand2 aria-hidden="true" /> Generate from one colour
          </Button>
        </div>
        <div className="grid gap-1.5">
          <p className="text-sm font-semibold">Contrast check</p>
          <ul className="grid gap-1">
            {contrast.map((c) => (
              <li key={c.label} className="flex items-center justify-between rounded-lg bg-bg/40 px-3 py-1.5 text-sm">
                <span>{c.label}</span>
                <span className={cn("flex items-center gap-2 font-semibold tabular-nums", c.ok ? "text-success" : "text-warning")}>
                  {c.ratio.toFixed(2)}:1 {c.ok ? "✓ AA" : "⚠ Low"}
                </span>
              </li>
            ))}
          </ul>
          {contrast.some((c) => !c.ok && c.label.startsWith("Text")) ? (
            <p className="rounded-lg bg-warning/10 px-3 py-2 text-sm text-warning">Body text may be hard to read with these colours. You can still publish, but consider more contrast.</p>
          ) : null}
        </div>
      </Panel>

      <Panel title="Typography">
        <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Font pair">
          {FONT_PAIR_IDS.map((id) => {
            const f = FONT_PAIRS[id];
            return (
              <button key={id} type="button" role="radio" aria-checked={theme.fontPair === id} onClick={() => update({ fontPair: id })} className={cn("rounded-xl border-2 p-3 text-left", theme.fontPair === id ? "border-primary" : "border-border")}>
                <span className="block text-lg font-bold" style={{ fontFamily: f.head }}>
                  Najeeb Ullah
                </span>
                <span className="block text-sm text-muted" style={{ fontFamily: f.body }}>
                  {f.name} · {f.feel}
                </span>
              </button>
            );
          })}
        </div>
      </Panel>

      <Panel title="Shape & effects">
        <Field label={`Corner roundness: ${theme.radius}px`} htmlFor="radius">
          <input id="radius" type="range" min={0} max={32} value={theme.radius} onChange={(e) => update({ radius: Number(e.target.value) })} className="w-full accent-[var(--primary)]" />
          <div className="flex gap-2">
            {[
              ["Sharp", 4],
              ["Soft", 18],
              ["Round", 28],
            ].map(([l, r]) => (
              <button key={l} type="button" onClick={() => update({ radius: Number(r) })} className={cn("rounded-full border px-3 py-1 text-xs font-semibold", theme.radius === r ? "border-primary text-primary" : "border-border text-muted")}>
                {l}
              </button>
            ))}
          </div>
        </Field>
        <div className="grid gap-1.5">
          <span className="text-sm font-semibold" id="fx-label">
            Background effect
          </span>
          <div role="radiogroup" aria-labelledby="fx-label" className="flex gap-1 rounded-xl border border-border bg-bg p-1">
            {(["starfield", "grid", "none"] as const).map((e) => (
              <button key={e} type="button" role="radio" aria-checked={theme.effect === e} onClick={() => update({ effect: e })} className={cn("flex-1 rounded-lg py-2 text-sm font-semibold capitalize", theme.effect === e ? "bg-[image:var(--gradient)] text-on-primary" : "text-muted")}>
                {e}
              </button>
            ))}
          </div>
        </div>
        <SwitchRow id="anim" label="Animations" hint="Scroll reveals, floating chips and the moving starfield." checked={theme.animations} onCheckedChange={(v) => update({ animations: v })} />
      </Panel>

      <Panel title="Visitor light/dark switch">
        <SwitchRow
          id="vt"
          label="Let visitors switch between light and dark"
          hint="Adds a sun/moon button to the menu. It never changes your saved theme."
          checked={theme.visitorToggle.enabled}
          onCheckedChange={(v) => update({ visitorToggle: { ...theme.visitorToggle, enabled: v } })}
        />
        {theme.visitorToggle.enabled ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Dark theme" htmlFor="vt-dark">
              <Select id="vt-dark" value={srcKey(theme.visitorToggle.darkSource)} onChange={(e) => update({ visitorToggle: { ...theme.visitorToggle, darkSource: parseKey(e.target.value) } })}>
                {darkThemes.map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Light theme" htmlFor="vt-light">
              <Select id="vt-light" value={srcKey(theme.visitorToggle.lightSource)} onChange={(e) => update({ visitorToggle: { ...theme.visitorToggle, lightSource: parseKey(e.target.value) } })}>
                {lightThemes.map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        ) : null}
      </Panel>
    </div>
  );

  return (
    <div className="grid gap-4">
      {hasDraft ? (
        <div className="sticky top-[61px] z-20 flex flex-wrap items-center gap-3 rounded-2xl border border-primary/40 bg-[var(--glass-strong)] px-4 py-3 backdrop-blur-md" role="status">
          <span className="text-sm font-medium">
            You&apos;re previewing unpublished changes
            <span className="ml-2 text-xs text-muted">{saving === "saving" ? "Saving draft…" : saving === "saved" ? "Draft saved" : ""}</span>
          </span>
          <div className="ml-auto flex gap-2">
            <Button size="sm" onClick={() => void doDiscard()} disabled={pending}>
              Discard
            </Button>
            <Button size="sm" variant="primary" onClick={() => void doPublish()} loading={pending}>
              Publish theme
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted">Your live site uses this theme. Change anything to start a draft. Visitors only see it after you publish.</p>
      )}

      <div role="tablist" aria-label="Theme studio view" className="flex gap-1 rounded-xl border border-border bg-surface p-1 xl:hidden">
        {(["controls", "preview"] as const).map((t) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={cn("flex-1 rounded-lg py-2 text-sm font-semibold capitalize", tab === t ? "bg-primary-soft text-primary" : "text-muted")}>
            {t}
          </button>
        ))}
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[420px_1fr]">
        <div className={cn(tab !== "controls" && "max-xl:hidden")}>{controls}</div>
        <div className={cn("grid gap-3 xl:sticky xl:top-20", tab !== "preview" && "max-xl:hidden")}>
          <div className="flex flex-wrap items-center gap-2">
            <div role="radiogroup" aria-label="Preview width" className="flex gap-1 rounded-xl border border-border bg-surface p-1">
              {DEVICES.map(({ w, label, icon: Icon }) => (
                <button key={w} type="button" role="radio" aria-checked={device === w} aria-label={`${label} (${w}px)`} title={`${label} ${w}px`} onClick={() => setDevice(w)} className={cn("grid size-9 place-items-center rounded-lg", device === w ? "bg-primary-soft text-primary" : "text-muted")}>
                  <Icon className="size-4" />
                </button>
              ))}
            </div>
            <a href="/preview" target="_blank" rel="noopener" className="ml-auto inline-flex items-center gap-1.5 text-sm text-muted hover:text-text">
              Open preview in new tab <ExternalLink className="size-3.5" aria-hidden="true" />
            </a>
          </div>
          <div ref={frameBox} className="overflow-hidden rounded-2xl border border-border bg-bg" style={{ height: "calc(100dvh - 210px)", minHeight: 480 }}>
            <iframe
              ref={iframe}
              src="/preview"
              title="Live preview of your site"
              onLoad={post}
              style={{ width: device, height: `${100 / scale}%`, transform: `scale(${scale})`, transformOrigin: "0 0", border: 0, display: "block", margin: scale === 1 ? "0 auto" : undefined }}
            />
          </div>
        </div>
      </div>

      <Dialog
        open={saveAs.open}
        onOpenChange={(o) => setSaveAs((s) => ({ ...s, open: o }))}
        title="Save as my theme"
        description="Saves the current colours so you can reuse them later."
        footer={
          <>
            <Button onClick={() => setSaveAs({ open: false, name: "" })}>Cancel</Button>
            <Button
              variant="primary"
              loading={pending}
              disabled={!saveAs.name.trim()}
              onClick={async () => {
                const r = await run(() => createCustomTheme({ name: saveAs.name, ...base }), { success: "Theme saved", refresh: false });
                if (r.ok) {
                  setCustom((l) => [...l, r.data]);
                  update({ source: { kind: "custom", id: r.data.id }, overrides: {} });
                  setSaveAs({ open: false, name: "" });
                }
              }}
            >
              Save theme
            </Button>
          </>
        }
      >
        <Field label="Theme name" htmlFor="ct-name">
          <Input id="ct-name" autoFocus maxLength={40} value={saveAs.name} onChange={(e) => setSaveAs({ open: true, name: e.target.value })} />
        </Field>
      </Dialog>

      <Dialog
        open={!!rename}
        onOpenChange={(o) => !o && setRename(null)}
        title="Rename theme"
        footer={
          <>
            <Button onClick={() => setRename(null)}>Cancel</Button>
            <Button
              variant="primary"
              loading={pending}
              disabled={!rename?.name.trim()}
              onClick={async () => {
                if (!rename) return;
                const r = await run(() => renameCustomTheme(rename.id, rename.name), { success: "Renamed", refresh: false });
                if (r.ok) {
                  setCustom((l) => l.map((c) => (c.id === rename.id ? { ...c, name: rename.name } : c)));
                  setRename(null);
                }
              }}
            >
              Save
            </Button>
          </>
        }
      >
        <Field label="Theme name" htmlFor="rn-name">
          <Input id="rn-name" autoFocus maxLength={40} value={rename?.name ?? ""} onChange={(e) => rename && setRename({ ...rename, name: e.target.value })} />
        </Field>
      </Dialog>

      <Dialog
        open={gen.open}
        onOpenChange={(o) => setGen((g) => ({ ...g, open: o }))}
        title="Generate from one colour"
        description="Pick a main colour and we'll suggest the rest."
        footer={
          <>
            <Button onClick={() => setGen((g) => ({ ...g, open: false }))}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => {
                const s = generateFromPrimary(gen.primary, gen.mode);
                const src = resolveSource(theme.source, custom);
                const overrides = { bg: s.bg, surface: s.surface, text: s.text, primary: s.primary, accent: s.accent };
                if (src.mode !== gen.mode) {
                  const fallback = PRESET_IDS.find((id) => PRESETS[id].mode === gen.mode) ?? "neon";
                  update({ source: { kind: "preset", id: fallback }, overrides });
                } else update({ overrides });
                setGen((g) => ({ ...g, open: false }));
              }}
            >
              Apply colours
            </Button>
          </>
        }
      >
        <div className="grid gap-4">
          <div className="grid max-w-40">
            <ColorField label="Main colour" value={gen.primary} onChange={(v) => setGen((g) => ({ ...g, primary: v }))} />
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span>Dark</span>
            <Switch checked={gen.mode === "light"} onCheckedChange={(v) => setGen((g) => ({ ...g, mode: v ? "light" : "dark" }))} label="Light mode" />
            <span>Light</span>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
