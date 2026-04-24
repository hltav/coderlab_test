import { z } from "zod";

export const CreateProductSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  price: z.number().min(0, "Preço não pode ser negativo"),
  categoryIds: z
    .array(z.number().int())
    .min(1, "Produto deve ter pelo menos uma categoria"),
});

export const UpdateProductSchema = CreateProductSchema.partial().refine(
  (data) => data.categoryIds === undefined || data.categoryIds.length > 0,
  {
    message: "Produto deve ter pelo menos uma categoria",
    path: ["categoryIds"],
  },
);

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
