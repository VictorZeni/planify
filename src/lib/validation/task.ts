import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().trim().min(3).max(160),
  dueAt: z.string().datetime().optional().nullable(),
  categoryId: z.string().uuid().optional().nullable(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

