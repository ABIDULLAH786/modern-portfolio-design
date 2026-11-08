"use server";

import { z } from "zod";
import type { ActionResult } from "@/lib/types";
import { Message } from "@/server/models";
import { adminAction } from "./_helpers";

const bulkSchema = z.object({
  ids: z.array(z.string().regex(/^[a-f0-9]{24}$/i)).min(1).max(500),
  action: z.enum(["read", "unread", "archive", "unarchive", "delete"]),
});

/** Inbox actions (single or bulk). Messages aren't public, so no cache tags are involved. */
export async function updateMessages(input: unknown): Promise<ActionResult<{ count: number }>> {
  return adminAction("updateMessages", async () => {
    const { ids, action } = bulkSchema.parse(input);
    const filter = { _id: { $in: ids } };
    if (action === "delete") {
      const r = await Message.deleteMany(filter);
      return { ok: true, data: { count: r.deletedCount } };
    }
    const status = action === "read" || action === "unarchive" ? "read" : action === "unread" ? "new" : "archived";
    const r = await Message.updateMany(filter, { $set: { status } });
    return { ok: true, data: { count: r.modifiedCount } };
  });
}
