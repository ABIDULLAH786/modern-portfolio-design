"use client";

import { ChartBar, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { ListRow, SortableList } from "@/components/admin/sortable-list";
import { useAction } from "@/components/admin/use-action";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState, Field, Input, Panel, Select } from "@/components/ui/inputs";
import { SwitchRow } from "@/components/ui/switch";
import type { SkillCategoryDTO, SkillDTO } from "@/lib/types";
import { updateDisplay } from "@/server/actions/settings";
import { deleteCategory, deleteSkill, reorderCategories, reorderSkills, saveCategory, saveSkill, setSkillLevel } from "@/server/actions/skills";

type SkillDraft = { id: string | null; name: string; level: number; categoryId: string };

export function SkillsEditor({ categories: initCats, skills: initSkills, showPercent }: { categories: SkillCategoryDTO[]; skills: SkillDTO[]; showPercent: boolean }) {
  const [cats, setCats] = useState(initCats);
  const [skills, setSkills] = useState(initSkills);
  const [percent, setPercent] = useState(showPercent);
  const [catDialog, setCatDialog] = useState<{ id: string | null; name: string } | null>(null);
  const [skillDialog, setSkillDialog] = useState<SkillDraft | null>(null);
  const [moveDialog, setMoveDialog] = useState<{ cat: SkillCategoryDTO; to: string } | null>(null);
  const { run, pending } = useAction();
  const confirm = useConfirm();

  const reorderCats = async (next: SkillCategoryDTO[]) => {
    const prev = cats;
    setCats(next);
    const r = await run(() => reorderCategories(next.map((c) => c.id)), { success: "Order saved", refresh: false });
    if (!r.ok) setCats(prev);
  };
  const reorderIn = async (catId: string, next: SkillDTO[]) => {
    const prev = skills;
    setSkills([...skills.filter((s) => s.categoryId !== catId), ...next.map((s, i) => ({ ...s, order: i }))]);
    const r = await run(() => reorderSkills(next.map((s) => s.id)), { success: "Order saved", refresh: false });
    if (!r.ok) setSkills(prev);
  };

  const saveCat = async () => {
    if (!catDialog) return;
    const r = await run(() => saveCategory(catDialog.id, { name: catDialog.name }), { refresh: false });
    if (r.ok) {
      setCats((l) => (catDialog.id ? l.map((c) => (c.id === r.data.id ? r.data : c)) : [...l, r.data]));
      setCatDialog(null);
    }
  };

  const removeCat = async (c: SkillCategoryDTO) => {
    const count = skills.filter((s) => s.categoryId === c.id).length;
    if (count) {
      const other = cats.find((x) => x.id !== c.id);
      if (!other) return void confirm({ title: "Can't delete the only category", body: "Add another category first, or delete its skills.", confirmLabel: "OK" });
      setMoveDialog({ cat: c, to: other.id });
      return;
    }
    if (!(await confirm({ title: `Delete “${c.name}”?`, confirmLabel: "Delete", danger: true }))) return;
    const r = await run(() => deleteCategory(c.id), { success: "Category deleted", refresh: false });
    if (r.ok) setCats((l) => l.filter((x) => x.id !== c.id));
  };

  const moveAndDelete = async () => {
    if (!moveDialog) return;
    const { cat, to } = moveDialog;
    const r = await run(() => deleteCategory(cat.id, to), { success: "Skills moved and category deleted" });
    if (r.ok) {
      setSkills((l) => l.map((s) => (s.categoryId === cat.id ? { ...s, categoryId: to, order: s.order + 1000 } : s)));
      setCats((l) => l.filter((x) => x.id !== cat.id));
      setMoveDialog(null);
    }
  };

  const saveSk = async () => {
    if (!skillDialog) return;
    const { id, ...data } = skillDialog;
    const r = await run(() => saveSkill(id, data), { refresh: false });
    if (r.ok) {
      setSkills((l) => (id ? l.map((s) => (s.id === r.data.id ? r.data : s)) : [...l, r.data]));
      setSkillDialog(null);
    }
  };

  const changeLevel = (s: SkillDTO, level: number) => setSkills((l) => l.map((x) => (x.id === s.id ? { ...x, level } : x)));
  const commitLevel = async (s: SkillDTO, level: number) => {
    await run(() => setSkillLevel(s.id, level), { success: `${s.name}: ${level}%`, refresh: false });
  };

  const moveSkill = async (s: SkillDTO, categoryId: string) => {
    const r = await run(() => saveSkill(s.id, { name: s.name, level: s.level, categoryId }), { success: "Skill moved", refresh: false });
    if (r.ok) setSkills((l) => l.map((x) => (x.id === s.id ? r.data : x)));
  };

  const removeSkill = async (s: SkillDTO) => {
    if (!(await confirm({ title: `Delete “${s.name}”?`, confirmLabel: "Delete", danger: true }))) return;
    const r = await run(() => deleteSkill(s.id), { success: "Skill deleted", refresh: false });
    if (r.ok) setSkills((l) => l.filter((x) => x.id !== s.id));
  };

  return (
    <div className="grid gap-6">
      <SwitchRow
        id="show-percent"
        label="Show percentages"
        hint="Off: skills are shown as simple chips without progress bars."
        checked={percent}
        onCheckedChange={async (v) => {
          setPercent(v);
          const r = await run(() => updateDisplay({ showSkillPercent: v }));
          if (!r.ok) setPercent(!v);
        }}
      />
      <div className="grid items-start gap-6 lg:grid-cols-[320px_1fr]">
        <Panel
          title="Categories"
          description="Each category is a card on your site."
          actions={
            <Button size="sm" onClick={() => setCatDialog({ id: null, name: "" })}>
              <Plus aria-hidden="true" /> Add
            </Button>
          }
        >
          {cats.length ? (
            <SortableList
              label="Categories"
              items={cats}
              onReorder={reorderCats}
              render={(c) => (
                <ListRow
                  actions={
                    <>
                      <Button size="icon" variant="subtle" aria-label={`Rename ${c.name}`} onClick={() => setCatDialog({ id: c.id, name: c.name })}>
                        <Pencil />
                      </Button>
                      <Button size="icon" variant="danger" aria-label={`Delete ${c.name}`} onClick={() => void removeCat(c)}>
                        <Trash2 />
                      </Button>
                    </>
                  }
                >
                  <span className="font-semibold">{c.name}</span>
                  <span className="block text-xs text-muted">{skills.filter((s) => s.categoryId === c.id).length} skills</span>
                </ListRow>
              )}
            />
          ) : (
            <p className="text-sm text-muted">Add a category first, e.g. “Engines & Tools”.</p>
          )}
        </Panel>

        <div className="grid gap-6">
          <div className="flex justify-end">
            <Button variant="primary" disabled={!cats.length} onClick={() => setSkillDialog({ id: null, name: "", level: 70, categoryId: cats[0]?.id ?? "" })}>
              <Plus aria-hidden="true" /> Add skill
            </Button>
          </div>
          {!cats.length ? <EmptyState icon={<ChartBar />} title="No skills yet" /> : null}
          {cats.map((c) => {
            const list = skills.filter((s) => s.categoryId === c.id).sort((a, b) => a.order - b.order);
            return (
              <Panel key={c.id} title={c.name}>
                {list.length ? (
                  <SortableList
                    label={`${c.name} skills`}
                    items={list}
                    onReorder={(next) => void reorderIn(c.id, next)}
                    render={(s) => (
                      <ListRow
                        actions={
                          <>
                            <Button size="icon" variant="subtle" aria-label={`Rename ${s.name}`} onClick={() => setSkillDialog({ id: s.id, name: s.name, level: s.level, categoryId: s.categoryId })}>
                              <Pencil />
                            </Button>
                            <Button size="icon" variant="danger" aria-label={`Delete ${s.name}`} onClick={() => void removeSkill(s)}>
                              <Trash2 />
                            </Button>
                          </>
                        }
                      >
                        <div className="grid items-center gap-2 sm:grid-cols-[1fr_200px_150px]">
                          <span className="truncate font-medium">{s.name}</span>
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="range"
                              min={0}
                              max={100}
                              value={s.level}
                              aria-label={`${s.name} level`}
                              className="w-full accent-[var(--primary)]"
                              onChange={(e) => changeLevel(s, Number(e.target.value))}
                              onPointerUp={(e) => void commitLevel(s, Number((e.target as HTMLInputElement).value))}
                              onKeyUp={(e) => ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "PageUp", "PageDown"].includes(e.key) && void commitLevel(s, Number((e.target as HTMLInputElement).value))}
                            />
                            <span className="w-10 text-right tabular-nums">{s.level}%</span>
                          </label>
                          <Select aria-label={`Category for ${s.name}`} value={s.categoryId} onChange={(e) => void moveSkill(s, e.target.value)} className="py-1.5 text-sm">
                            {cats.map((x) => (
                              <option key={x.id} value={x.id}>
                                {x.name}
                              </option>
                            ))}
                          </Select>
                        </div>
                      </ListRow>
                    )}
                  />
                ) : (
                  <p className="text-sm text-muted">No skills in this category. Empty categories are hidden on the site.</p>
                )}
              </Panel>
            );
          })}
        </div>
      </div>

      <Dialog
        open={!!catDialog}
        onOpenChange={(o) => !o && setCatDialog(null)}
        title={catDialog?.id ? "Rename category" : "Add category"}
        footer={
          <>
            <Button onClick={() => setCatDialog(null)}>Cancel</Button>
            <Button variant="primary" loading={pending} onClick={() => void saveCat()} disabled={!catDialog?.name.trim()}>
              Save
            </Button>
          </>
        }
      >
        <form onSubmit={(e) => (e.preventDefault(), void saveCat())}>
          <Field label="Category name" htmlFor="cat-name" required>
            <Input id="cat-name" autoFocus maxLength={50} value={catDialog?.name ?? ""} onChange={(e) => catDialog && setCatDialog({ ...catDialog, name: e.target.value })} />
          </Field>
        </form>
      </Dialog>

      <Dialog
        open={!!skillDialog}
        onOpenChange={(o) => !o && setSkillDialog(null)}
        title={skillDialog?.id ? "Edit skill" : "Add skill"}
        footer={
          <>
            <Button onClick={() => setSkillDialog(null)}>Cancel</Button>
            <Button variant="primary" loading={pending} onClick={() => void saveSk()} disabled={!skillDialog?.name.trim()}>
              Save
            </Button>
          </>
        }
      >
        {skillDialog ? (
          <form className="grid gap-4" onSubmit={(e) => (e.preventDefault(), void saveSk())}>
            <Field label="Skill name" htmlFor="sk-name" required>
              <Input id="sk-name" autoFocus maxLength={60} value={skillDialog.name} onChange={(e) => setSkillDialog({ ...skillDialog, name: e.target.value })} />
            </Field>
            <Field label="Category" htmlFor="sk-cat">
              <Select id="sk-cat" value={skillDialog.categoryId} onChange={(e) => setSkillDialog({ ...skillDialog, categoryId: e.target.value })}>
                {cats.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={`Level: ${skillDialog.level}%`} htmlFor="sk-level">
              <input id="sk-level" type="range" min={0} max={100} value={skillDialog.level} onChange={(e) => setSkillDialog({ ...skillDialog, level: Number(e.target.value) })} className="w-full accent-[var(--primary)]" />
            </Field>
          </form>
        ) : null}
      </Dialog>

      <Dialog
        open={!!moveDialog}
        onOpenChange={(o) => !o && setMoveDialog(null)}
        title={`Delete “${moveDialog?.cat.name ?? ""}”?`}
        description="This category still has skills. Choose where to move them first."
        footer={
          <>
            <Button onClick={() => setMoveDialog(null)}>Cancel</Button>
            <Button variant="danger" loading={pending} onClick={() => void moveAndDelete()}>
              Move skills & delete
            </Button>
          </>
        }
      >
        {moveDialog ? (
          <Field label="Move skills to" htmlFor="move-to">
            <Select id="move-to" value={moveDialog.to} onChange={(e) => setMoveDialog({ ...moveDialog, to: e.target.value })}>
              {cats
                .filter((c) => c.id !== moveDialog.cat.id)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </Select>
          </Field>
        ) : null}
      </Dialog>
    </div>
  );
}
