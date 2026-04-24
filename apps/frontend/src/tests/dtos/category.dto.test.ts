import { describe, expect, it } from "vitest";
import { CreateCategorySchema } from "../../components/dtos/category.dto";

describe("CreateCategorySchema", () => {
  it("should validate a valid category", () => {
    const result = CreateCategorySchema.safeParse({
      name: "Eletrônicos",
      parentId: 1,
    });

    expect(result.success).toBe(true);
  });

  it("should fail if name is empty", () => {
    const result = CreateCategorySchema.safeParse({
      name: "",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Nome é obrigatório");
    }
  });

  it("should fail if parentId is negative", () => {
    const result = CreateCategorySchema.safeParse({
      name: "Categoria",
      parentId: -1,
    });

    expect(result.success).toBe(false);
  });

  it("should pass without parentId", () => {
    const result = CreateCategorySchema.safeParse({
      name: "Sem pai",
    });

    expect(result.success).toBe(true);
  });
});
