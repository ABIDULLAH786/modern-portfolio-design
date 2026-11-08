"use server";

import { z } from "zod";
import type { ActionResult, ExperienceDTO, ServiceDTO, TestimonialDTO } from "@/lib/types";
import { MAX_SERVICES } from "@/lib/constants";
import { experienceSchema, serviceSchema, testimonialSchema } from "@/lib/validation/content";
import { idList, objectId } from "@/lib/validation/primitives";
import { toExperienceDTO, toServiceDTO, toTestimonialDTO } from "@/server/dto";
import { Experience, Service, Testimonial } from "@/server/models";
import { TAGS, expire } from "@/server/revalidate";
import { adminAction, fail, invalid, orderOps } from "./_helpers";

/*
 * Experience, Services and Testimonials share the same CRUD + reorder shape.
 * Each export is an explicit server action so it gets its own auth + validation.
 */
type Raw = Record<string, unknown>;
type AnyModel = typeof Experience | typeof Service | typeof Testimonial;

async function upsert<T>(model: AnyModel, id: string | null, data: Record<string, unknown>, map: (d: Raw) => T): Promise<ActionResult<T>> {
  let doc: Raw | null;
  if (id) {
    doc = await (model as typeof Experience).findByIdAndUpdate(objectId.parse(id), { $set: data }, { returnDocument: "after" }).lean<Raw>();
  } else {
    const last = await (model as typeof Experience).findOne().sort({ order: -1 }).select("order").lean();
    doc = (await (model as typeof Experience).create({ ...data, order: (last?.order ?? -1) + 1 })).toObject() as unknown as Raw;
  }
  if (!doc) return fail("This item no longer exists.");
  return { ok: true, data: map(doc) };
}

/* ── Experience ── */
export async function saveExperience(id: string | null, input: unknown): Promise<ActionResult<ExperienceDTO>> {
  return adminAction("saveExperience", async () => {
    const parsed = experienceSchema.safeParse(input);
    if (!parsed.success) return invalid(parsed.error);
    const data = { ...parsed.data, end: parsed.data.current ? null : parsed.data.end };
    const res = await upsert(Experience, id, data, toExperienceDTO);
    expire(TAGS.experience);
    return res;
  });
}
export async function deleteExperience(id: string): Promise<ActionResult> {
  return adminAction("deleteExperience", async () => {
    await Experience.deleteOne({ _id: objectId.parse(id) });
    expire(TAGS.experience);
    return { ok: true, data: null };
  });
}
export async function reorderExperiences(ids: unknown): Promise<ActionResult> {
  return adminAction("reorderExperiences", async () => {
    await Experience.bulkWrite(orderOps(idList.parse(ids)));
    expire(TAGS.experience);
    return { ok: true, data: null };
  });
}

/* ── Services ── */
export async function saveService(id: string | null, input: unknown): Promise<ActionResult<ServiceDTO>> {
  return adminAction("saveService", async () => {
    const parsed = serviceSchema.safeParse(input);
    if (!parsed.success) return invalid(parsed.error);
    if (!id && (await Service.countDocuments()) >= MAX_SERVICES) return fail(`You can have up to ${MAX_SERVICES} services.`);
    const res = await upsert(Service, id, parsed.data, toServiceDTO);
    expire(TAGS.services);
    return res;
  });
}
export async function deleteService(id: string): Promise<ActionResult> {
  return adminAction("deleteService", async () => {
    await Service.deleteOne({ _id: objectId.parse(id) });
    expire(TAGS.services);
    return { ok: true, data: null };
  });
}
export async function reorderServices(ids: unknown): Promise<ActionResult> {
  return adminAction("reorderServices", async () => {
    await Service.bulkWrite(orderOps(idList.parse(ids)));
    expire(TAGS.services);
    return { ok: true, data: null };
  });
}

/* ── Testimonials ── */
export async function saveTestimonial(id: string | null, input: unknown): Promise<ActionResult<TestimonialDTO>> {
  return adminAction("saveTestimonial", async () => {
    const parsed = testimonialSchema.safeParse(input);
    if (!parsed.success) return invalid(parsed.error);
    const res = await upsert(Testimonial, id, parsed.data, toTestimonialDTO);
    expire(TAGS.testimonials);
    return res;
  });
}
export async function deleteTestimonial(id: string): Promise<ActionResult> {
  return adminAction("deleteTestimonial", async () => {
    await Testimonial.deleteOne({ _id: objectId.parse(id) });
    expire(TAGS.testimonials);
    return { ok: true, data: null };
  });
}
export async function reorderTestimonials(ids: unknown): Promise<ActionResult> {
  return adminAction("reorderTestimonials", async () => {
    await Testimonial.bulkWrite(orderOps(idList.parse(ids)));
    expire(TAGS.testimonials);
    return { ok: true, data: null };
  });
}
export async function setTestimonialPublished(id: string, value: unknown): Promise<ActionResult> {
  return adminAction("setTestimonialPublished", async () => {
    await Testimonial.updateOne({ _id: objectId.parse(id) }, { $set: { published: z.boolean().parse(value) } });
    expire(TAGS.testimonials);
    return { ok: true, data: null };
  });
}
