import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useProducts } from "../../hooks/useProducts";
import { Product } from "../../types";

const mockGetProducts = vi.fn();
const mockSaveProduct = vi.fn();
const mockDeleteProduct = vi.fn();

vi.mock("../../services/api", () => ({
  api: {
    getProducts: (...args: any[]) => mockGetProducts(...args),
    saveProduct: (...args: any[]) => mockSaveProduct(...args),
    deleteProduct: (...args: any[]) => mockDeleteProduct(...args),
  },
}));

const now = new Date().toISOString();

const seedProducts: Product[] = [
  {
    id: 1,
    name: "Mouse Gamer",
    price: 150,
    stock: 5,
    createdAt: now,
    updatedAt: now,
    categories: [
      {
        productId: 1,
        categoryId: 1,
        category: { id: 1, name: "Perifericos", parentId: null },
      },
    ],
  },
  {
    id: 2,
    name: "Teclado",
    price: 300,
    stock: 0,
    createdAt: now,
    updatedAt: now,
    categories: [
      {
        productId: 2,
        categoryId: 1,
        category: { id: 1, name: "Perifericos", parentId: null },
      },
    ],
  },
];

// resposta paginada que a API agora retorna
const mockPaginatedResponse = {
  data: seedProducts,
  meta: { total: 2, page: 1, lastPage: 1 },
};

function setup() {
  const showNotification = vi.fn();
  const hook = renderHook(() => useProducts(showNotification));
  return { ...hook, showNotification };
}

describe("useProducts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetProducts.mockResolvedValue(mockPaginatedResponse);
  });

  describe("carregamento inicial", () => {
    it("inicia com loading=true", () => {
      const { result } = setup();
      expect(result.current.loading).toBe(true);
    });

    it("carrega produtos e define loading=false", async () => {
      const { result } = setup();
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.products).toEqual(seedProducts);
    });

    it("popula meta com total e lastPage", async () => {
      const { result } = setup();
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.meta).toEqual({ total: 2, page: 1, lastPage: 1 });
    });

    it("notifica erro se a API falhar", async () => {
      mockGetProducts.mockRejectedValueOnce(new Error("fail"));
      const { showNotification } = setup();
      await waitFor(() => {
        expect(showNotification).toHaveBeenCalledWith(
          "Erro ao carregar produtos",
          "error",
        );
      });
    });
  });

  describe("filters e setFilters", () => {
    it("expõe filters com valores padrão", async () => {
      const { result } = setup();
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.filters).toEqual({
        name: "",
        description: "",
        categoryIds: [],
        page: 1,
        limit: 10,
      });
    });

    it("chama getProducts novamente ao atualizar filtros", async () => {
      const { result } = setup();
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        result.current.setFilters((prev) => ({
          ...prev,
          name: "Mouse",
          page: 1,
        }));
      });

      await waitFor(() => expect(result.current.loading).toBe(false));

      // 1 (mount) + 1 (após setFilters)
      expect(mockGetProducts).toHaveBeenCalledTimes(2);
      expect(mockGetProducts).toHaveBeenLastCalledWith(
        expect.objectContaining({ name: "Mouse" }),
      );
    });

    it("reseta para página 1 ao mudar filtros", async () => {
      const { result } = setup();
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        result.current.setFilters((prev) => ({ ...prev, page: 3 }));
      });

      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        result.current.setFilters((prev) => ({
          ...prev,
          name: "Teclado",
          page: 1,
        }));
      });

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(mockGetProducts).toHaveBeenLastCalledWith(
        expect.objectContaining({ name: "Teclado", page: 1 }),
      );
    });
  });

  describe("saveProduct", () => {
    it("não permite salvar produto com preço zero", async () => {
      const { result, showNotification } = setup();
      await waitFor(() => expect(result.current.loading).toBe(false));

      let success;
      await act(async () => {
        success = await result.current.saveProduct({
          name: "Erro",
          price: 0,
          categoryIds: [],
        });
      });

      expect(success).toBe(false);
      expect(showNotification).toHaveBeenCalledWith(
        "O preço deve ser superior a zero",
        "error",
      );
      expect(mockSaveProduct).not.toHaveBeenCalled();
    });

    it("adiciona novo produto à lista ao criar", async () => {
      const newProduct: Product = {
        id: 3,
        name: "Monitor",
        price: 1000,
        stock: 0,
        createdAt: now,
        updatedAt: now,
        categories: [],
      };
      mockSaveProduct.mockResolvedValueOnce(newProduct);

      const { result } = setup();
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.saveProduct({
          name: "Monitor",
          price: 1000,
          categoryIds: [1],
        });
      });

      expect(result.current.products).toContainEqual(newProduct);
    });

    it("atualiza produto existente na lista", async () => {
      const updatedProduct = { ...seedProducts[0], name: "Mouse Atualizado" };
      mockSaveProduct.mockResolvedValueOnce(updatedProduct);

      const { result } = setup();
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.saveProduct({
          id: 1,
          name: "Mouse Atualizado",
          price: 150,
          categoryIds: [1],
        });
      });

      expect(result.current.products[0].name).toBe("Mouse Atualizado");
    });

    it("notifica erro ao falhar ao salvar", async () => {
      mockSaveProduct.mockRejectedValueOnce(new Error("fail"));

      const { result, showNotification } = setup();
      await waitFor(() => expect(result.current.loading).toBe(false));

      let success;
      await act(async () => {
        success = await result.current.saveProduct({
          name: "Produto",
          price: 100,
          categoryIds: [1],
        });
      });

      expect(success).toBe(false);
      expect(showNotification).toHaveBeenCalledWith(
        "Erro ao salvar produto",
        "error",
      );
    });
  });

  describe("deleteProduct", () => {
    it("remove o produto da lista após sucesso", async () => {
      mockDeleteProduct.mockResolvedValueOnce(undefined);

      const { result } = setup();
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.deleteProduct(1);
      });

      expect(result.current.products).toHaveLength(1);
      expect(result.current.products.find((p) => p.id === 1)).toBeUndefined();
    });

    it("notifica sucesso ao remover", async () => {
      mockDeleteProduct.mockResolvedValueOnce(undefined);

      const { result, showNotification } = setup();
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.deleteProduct(1);
      });

      expect(showNotification).toHaveBeenCalledWith("Produto removido", "info");
    });

    it("notifica erro se deleteProduct falhar", async () => {
      mockDeleteProduct.mockRejectedValueOnce(new Error("fail"));

      const { result, showNotification } = setup();
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.deleteProduct(1);
      });

      expect(showNotification).toHaveBeenCalledWith(
        "Erro ao remover produto",
        "error",
      );
      // produto não deve ser removido da lista
      expect(result.current.products).toHaveLength(2);
    });
  });
});
