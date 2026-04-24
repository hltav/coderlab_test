import { describe, expect, it } from "vitest";
import {
  CreateProductSchema,
  UpdateProductSchema,
} from "../../components/dtos/product.dto";

describe("CreateProductSchema", () => {
  it("should validate a valid product", () => {
    const result = CreateProductSchema.safeParse({
      name: "Notebook",
      description: "Top",
      price: 3000,
      categoryIds: [1, 2],
    });

    expect(result.success).toBe(true);
  });

  it("should fail if name is empty", () => {
    const result = CreateProductSchema.safeParse({
      name: "",
      price: 100,
      categoryIds: [1],
    });

    expect(result.success).toBe(false);
  });

  it("should fail if price is negative", () => {
    const result = CreateProductSchema.safeParse({
      name: "Produto",
      price: -10,
      categoryIds: [1],
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Preço não pode ser negativo",
      );
    }
  });

  it("should fail if categoryIds is empty", () => {
    const result = CreateProductSchema.safeParse({
      name: "Produto",
      price: 100,
      categoryIds: [],
    });

    expect(result.success).toBe(false);
  });
});

describe("UpdateProductSchema", () => {
  it("should allow partial update", () => {
    const result = UpdateProductSchema.safeParse({
      name: "Novo nome",
    });

    expect(result.success).toBe(true);
  });

  it("should fail if categoryIds is empty array", () => {
    const result = UpdateProductSchema.safeParse({
      categoryIds: [],
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Produto deve ter pelo menos uma categoria",
      );
    }
  });

  it("should pass if categoryIds is undefined", () => {
    const result = UpdateProductSchema.safeParse({});

    expect(result.success).toBe(true);
  });

  it("should pass if categoryIds has values", () => {
    const result = UpdateProductSchema.safeParse({
      categoryIds: [1],
    });

    expect(result.success).toBe(true);
  });
});
