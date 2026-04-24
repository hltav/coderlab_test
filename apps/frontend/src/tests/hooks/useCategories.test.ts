import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCategories } from "../../hooks/useCategories";
import { Category } from "../../types";

// ── Mocks ────────────────────────────────────────────────────────────────────

const mockGetCategories = vi.fn();
const mockCreateCategory = vi.fn();

vi.mock("../../services/api", () => ({
  api: {
    getCategories: (...args: any[]) => mockGetCategories(...args),
    createCategory: (...args: any[]) => mockCreateCategory(...args),
  },
}));

// ── Helpers ──────────────────────────────────────────────────────────────────

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

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("useCategories", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCategories.mockResolvedValue(seedCategories);
    mockCreateCategory.mockResolvedValue({});
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

      // Esperamos o loading terminar ANTES de checar os dados
      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.flatCategories).toEqual(seedCategories);
    });

    it("constrói categoryTree apenas com pais no topo e filhos agrupados", async () => {
      const { result } = setup();
      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.categoryTree).toEqual({
        Eletronicos: [
          makeCategory({ id: 2, name: "Celulares", parentId: 1 }),
          makeCategory({ id: 3, name: "Notebooks", parentId: 1 }),
        ],
        Roupas: [makeCategory({ id: 5, name: "Camisetas", parentId: 4 })],
      });
    });

    it("notifica erro quando getCategories rejeita", async () => {
      // Sobrescreve apenas para este teste
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
      // 1 (mount) + 1 (após add)
      expect(mockGetCategories).toHaveBeenCalledTimes(2);
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
  });

  describe("deleteCategory", () => {
    it("remove a chave do categoryTree localmente", async () => {
      const { result } = setup();
      await waitFor(() => expect(result.current.loading).toBe(false));

      // Garante que a árvore existe antes de deletar
      expect(result.current.categoryTree).toHaveProperty("Eletronicos");

      act(() => {
        result.current.deleteCategory("Eletronicos");
      });

      expect(result.current.categoryTree).not.toHaveProperty("Eletronicos");
      expect(result.current.categoryTree).toHaveProperty("Roupas");
    });
  });
});
