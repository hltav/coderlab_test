import { z } from "zod";

export const CreateCategorySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  parentId: z.number().int().positive().optional(),
});

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
