"use server";

import { z } from "zod";
import type { ActionResult, SkillCategoryDTO, SkillDTO } from "@/lib/types";
import { skillCategorySchema, skillSchema } from "@/lib/validation/content";
import { idList, objectId } from "@/lib/validation/primitives";
import { toSkillCategoryDTO, toSkillDTO } from "@/server/dto";
import { Skill, SkillCategory } from "@/server/models";
import { TAGS, expire } from "@/server/revalidate";
import { adminAction, fail, invalid, orderOps } from "./_helpers";

type Raw = Record<string, unknown>;

export async function saveCategory(id: string | null, input: unknown): Promise<ActionResult<SkillCategoryDTO>> {
  return adminAction("saveCategory", async () => {
    const parsed = skillCategorySchema.safeParse(input);
    if (!parsed.success) return invalid(parsed.error);
    let doc;
    if (id) doc = await SkillCategory.findByIdAndUpdate(objectId.parse(id), { $set: parsed.data }, { returnDocument: "after" }).lean<Raw>();
    else {
      const last = await SkillCategory.findOne().sort({ order: -1 }).lean();
      doc = (await SkillCategory.create({ ...parsed.data, order: (last?.order ?? -1) + 1 })).toObject() as unknown as Raw;
    }
    if (!doc) return fail("Category not found.");
    expire(TAGS.skills);
    return { ok: true, data: toSkillCategoryDTO(doc) };
  });
}

/** Blocked while the category has skills, unless `moveTo` names another category. */
export async function deleteCategory(id: string, moveTo?: string | null): Promise<ActionResult> {
  return adminAction("deleteCategory", async () => {
    const cid = objectId.parse(id);
    const count = await Skill.countDocuments({ categoryId: cid });
    if (count > 0) {
      if (!moveTo) return fail(`This category still has ${count} skill(s). Move them to another category first.`);
      const target = objectId.parse(moveTo);
      if (target === cid || !(await SkillCategory.exists({ _id: target }))) return fail("Choose a different category to move the skills to.");
      const base = await Skill.countDocuments({ categoryId: target });
      const skills = await Skill.find({ categoryId: cid }).sort({ order: 1 });
      await Skill.bulkWrite(skills.map((s, i) => ({ updateOne: { filter: { _id: s._id }, update: { $set: { categoryId: target, order: base + i } } } })));
    }
    await SkillCategory.deleteOne({ _id: cid });
    expire(TAGS.skills);
    return { ok: true, data: null };
  });
}

export async function reorderCategories(ids: unknown): Promise<ActionResult> {
  return adminAction("reorderCategories", async () => {
    await SkillCategory.bulkWrite(orderOps(idList.parse(ids)));
    expire(TAGS.skills);
    return { ok: true, data: null };
  });
}

export async function saveSkill(id: string | null, input: unknown): Promise<ActionResult<SkillDTO>> {
  return adminAction("saveSkill", async () => {
    const parsed = skillSchema.safeParse(input);
    if (!parsed.success) return invalid(parsed.error);
    if (!(await SkillCategory.exists({ _id: parsed.data.categoryId }))) return fail("Choose a category.");
    let doc: Raw | null;
    if (id) {
      const existing = await Skill.findById(objectId.parse(id)).lean();
      if (!existing) return fail("Skill not found.");
      const moved = String(existing.categoryId) !== parsed.data.categoryId;
      const order = moved ? await Skill.countDocuments({ categoryId: parsed.data.categoryId }) : existing.order;
      doc = await Skill.findByIdAndUpdate(id, { $set: { ...parsed.data, order } }, { returnDocument: "after" }).lean<Raw>();
    } else {
      const order = await Skill.countDocuments({ categoryId: parsed.data.categoryId });
      doc = (await Skill.create({ ...parsed.data, order })).toObject() as unknown as Raw;
    }
    if (!doc) return fail("Skill not found.");
    expire(TAGS.skills);
    return { ok: true, data: toSkillDTO(doc) };
  });
}

export async function deleteSkill(id: string): Promise<ActionResult> {
  return adminAction("deleteSkill", async () => {
    await Skill.deleteOne({ _id: objectId.parse(id) });
    expire(TAGS.skills);
    return { ok: true, data: null };
  });
}

export async function reorderSkills(ids: unknown): Promise<ActionResult> {
  return adminAction("reorderSkills", async () => {
    await Skill.bulkWrite(orderOps(idList.parse(ids)));
    expire(TAGS.skills);
    return { ok: true, data: null };
  });
}

export async function setSkillLevel(id: string, level: unknown): Promise<ActionResult> {
  return adminAction("setSkillLevel", async () => {
    await Skill.updateOne({ _id: objectId.parse(id) }, { $set: { level: z.number().int().min(0).max(100).parse(level) } });
    expire(TAGS.skills);
    return { ok: true, data: null };
  });
}
