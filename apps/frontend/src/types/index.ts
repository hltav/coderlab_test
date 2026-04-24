import { z } from "zod";
import type { ZCategory } from "../components/interface/category.interface";

// ── Categoria ─────────────────────────────────────────────────────────────────

export const CategorySchema: z.ZodType<ZCategory> = z.lazy(() =>
  z.object({
    id: z.number(),
    name: z.string(),
    parentId: z.number().nullable(),
    children: z.array(CategorySchema).optional(),
    parent: CategorySchema.nullable().optional(),
  }),
);

export const ProductCategorySchema = z.object({
  productId: z.number(),
  categoryId: z.number(),
  category: CategorySchema,
});

export const CategoryTreeSchema = z.record(z.string(), z.array(CategorySchema));

// ── Produto ───────────────────────────────────────────────────────────────────
export const ProductSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().optional(),
  price: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  categories: z.array(ProductCategorySchema),
});

export const ProductFormDataSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  description: z.string().optional(),
  price: z.number(),
  categoryIds: z.array(z.number()),
});

// ── UI ────────────────────────────────────────────────────────────────────────
export const NotificationTypeSchema = z.enum(["success", "error", "info"]);

export const NotificationStateSchema = z.object({
  message: z.string(),
  type: NotificationTypeSchema,
});

// Tipos inferidos automaticamente
export type Category = z.infer<typeof CategorySchema>;
export type ProductCategory = z.infer<typeof ProductCategorySchema>;
export type CategoryTree = z.infer<typeof CategoryTreeSchema>;
export type Product = z.infer<typeof ProductSchema>;
export type ProductFormData = z.infer<typeof ProductFormDataSchema>;
export type NotificationType = z.infer<typeof NotificationTypeSchema>;
export type NotificationState = z.infer<typeof NotificationStateSchema>;
export type ProductFormErrors = Partial<Record<keyof ProductFormData, string>>;
