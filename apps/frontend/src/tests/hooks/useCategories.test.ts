import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCategories } from "../../hooks/useCategories";
import { Category } from "../../types";

const mockGetCategories = vi.fn();
const mockCreateCategory = vi.fn();
const mockDeleteCategory = vi.fn(); // ← faltava

vi.mock("../../services/api", () => ({
  api: {
    getCategories: (...args: any[]) => mockGetCategories(...args),
    createCategory: (...args: any[]) => mockCreateCategory(...args),
    deleteCategory: (...args: any[]) => mockDeleteCategory(...args), // ← faltava
  },
}));

const makeCategory = (overrides: Partial<Category>): Category => ({
  id: 1,
  name: "Default",
  parentId: null,
  ...overrides,
});

const seedCategories: Category[] = [
  makeCategory({ id: 1, name: "Eletronicos", parentId: null }),
  makeCategory({ id: 2, name: "Celulares", parentId: 1 }),
  makeCategory({ id: 3, name: "Notebooks", parentId: 1 }),
  makeCategory({ id: 4, name: "Roupas", parentId: null }),
  makeCategory({ id: 5, name: "Camisetas", parentId: 4 }),
];

function setup() {
  const showNotification = vi.fn();
  const hook = renderHook(() => useCategories(showNotification));
  return { ...hook, showNotification };
}

describe("useCategories", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCategories.mockResolvedValue(seedCategories);
    mockCreateCategory.mockResolvedValue({});
    mockDeleteCategory.mockResolvedValue({});
  });

  describe("carregamento inicial", () => {
    it("inicia com loading=true", () => {
      const { result } = setup();
      expect(result.current.loading).toBe(true);
    });

    it("define loading=false após carregar", async () => {
      const { result } = setup();
      await waitFor(() => expect(result.current.loading).toBe(false));
    });

    it("popula flatCategories com todas as categorias retornadas pela API", async () => {
      const { result } = setup();
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.flatCategories).toEqual(seedCategories);
    });

    it("constrói categoryTree com id do pai como chave e filhos agrupados", async () => {
      const { result } = setup();
      await waitFor(() => expect(result.current.loading).toBe(false));

      // chave é o id do pai (number), não o nome
      expect(result.current.categoryTree).toEqual({
        1: [
          makeCategory({ id: 2, name: "Celulares", parentId: 1 }),
          makeCategory({ id: 3, name: "Notebooks", parentId: 1 }),
        ],
        4: [makeCategory({ id: 5, name: "Camisetas", parentId: 4 })],
      });
    });

    it("notifica erro quando getCategories rejeita", async () => {
      mockGetCategories.mockRejectedValueOnce(new Error("fail"));
      const { result, showNotification } = setup();
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(showNotification).toHaveBeenCalledWith(
        "Erro ao carregar categorias",
        "error",
      );
    });
  });

  describe("addCategory", () => {
    it("chama api.createCategory e recarrega a lista", async () => {
      const { result, showNotification } = setup();
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.addCategory("Games");
      });

      expect(mockCreateCategory).toHaveBeenCalledWith({ name: "Games" });
      expect(showNotification).toHaveBeenCalledWith("Categoria adicionada!");
      expect(mockGetCategories).toHaveBeenCalledTimes(2);
    });

    it("não chama api.createCategory se nome estiver vazio", async () => {
      const { result } = setup();
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.addCategory("   ");
      });

      expect(mockCreateCategory).not.toHaveBeenCalled();
    });
  });

  describe("addSubcategory", () => {
    it("chama api.createCategory com parentId correto", async () => {
      const { result } = setup();
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.addSubcategory("Eletronicos", "Tablets");
      });

      expect(mockCreateCategory).toHaveBeenCalledWith({
        name: "Tablets",
        parentId: 1,
      });
    });

    it("não chama api.createCategory se pai não for encontrado", async () => {
      const { result } = setup();
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.addSubcategory("Inexistente", "Sub");
      });

      expect(mockCreateCategory).not.toHaveBeenCalled();
    });
  });

  describe("deleteCategory", () => {
    it("chama api.deleteCategory com o id correto e recarrega", async () => {
      const { result, showNotification } = setup();
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.deleteCategory(1);
      });

      expect(mockDeleteCategory).toHaveBeenCalledWith(1);
      expect(showNotification).toHaveBeenCalledWith(
        "Categoria removida!",
        "info",
      );
      expect(mockGetCategories).toHaveBeenCalledTimes(2);
    });

    it("notifica erro com mensagem do backend quando api.deleteCategory rejeita", async () => {
      const { result, showNotification } = setup();
      await waitFor(() => expect(result.current.loading).toBe(false));

      const err: any = new Error("bloqueado");
      err.response = {
        data: {
          message: "Não é possível remover categoria com produtos vinculados",
        },
      };
      mockDeleteCategory.mockRejectedValueOnce(err);

      await act(async () => {
        await result.current.deleteCategory(1);
      });

      expect(showNotification).toHaveBeenCalledWith(
        "Não é possível remover categoria com produtos vinculados",
        "error",
      );
    });

    it("notifica mensagem genérica quando erro não tem response", async () => {
      const { result, showNotification } = setup();
      await waitFor(() => expect(result.current.loading).toBe(false));

      mockDeleteCategory.mockRejectedValueOnce(new Error("network error"));

      await act(async () => {
        await result.current.deleteCategory(1);
      });

      expect(showNotification).toHaveBeenCalledWith(
        "Erro ao remover categoria",
        "error",
      );
    });
  });
});
