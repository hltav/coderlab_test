import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getCategoriesMock = vi.fn();
const createCategoryMock = vi.fn();

vi.mock("@/services/api", () => ({
  api: {
    getCategories: getCategoriesMock,
    createCategory: createCategoryMock,
  },
}));

import { useCategories } from "./../../hooks/useCategories";

describe("useCategories", () => {
  const showNotification = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should load categories and build tree", async () => {
    getCategoriesMock.mockResolvedValue([
      { id: 1, name: "Eletrônicos", parentId: null },
      { id: 2, name: "Celulares", parentId: 1 },
      { id: 3, name: "Notebooks", parentId: 1 },
    ]);

    const { result } = renderHook(() => useCategories(showNotification));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.flatCategories).toHaveLength(3);
    expect(result.current.categoryTree["Eletrônicos"]).toHaveLength(2);
  });

  it("should show error notification on load failure", async () => {
    getCategoriesMock.mockRejectedValue(new Error("fail"));

    renderHook(() => useCategories(showNotification));

    await waitFor(() => {
      expect(showNotification).toHaveBeenCalledWith(
        "Erro ao carregar categorias",
        "error",
      );
    });
  });

  it("should add category and reload", async () => {
    getCategoriesMock.mockResolvedValue([]);
    createCategoryMock.mockResolvedValue({});

    const { result } = renderHook(() => useCategories(showNotification));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await result.current.addCategory("Nova");

    expect(createCategoryMock).toHaveBeenCalledWith({ name: "Nova" });

    expect(showNotification).toHaveBeenCalledWith("Categoria adicionada!");
  });

  it("should not add empty category", async () => {
    getCategoriesMock.mockResolvedValue([]);

    const { result } = renderHook(() => useCategories(showNotification));

    await result.current.addCategory("");

    expect(createCategoryMock).not.toHaveBeenCalled();
  });
});
