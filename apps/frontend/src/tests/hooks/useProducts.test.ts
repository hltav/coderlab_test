import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useProducts } from "../../hooks/useProducts";
import { Product } from "../../types";

// ── Mocks ────────────────────────────────────────────────────────────────────

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

// ── Helpers ──────────────────────────────────────────────────────────────────

const now = new Date().toISOString();

const seedProducts: Product[] = [
  {
    id: 1,
    name: "Mouse Gamer",
    price: 150,
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

function setup() {
  const showNotification = vi.fn();
  const hook = renderHook(() => useProducts(showNotification));
  return { ...hook, showNotification };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("useProducts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetProducts.mockResolvedValue(seedProducts);
  });

  describe("carregamento inicial", () => {
    it("carrega produtos e define loading como false", async () => {
      const { result } = setup();
      expect(result.current.loading).toBe(true);
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.products).toEqual(seedProducts);
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

  describe("filtragem", () => {
    it("filtra produtos pelo nome", async () => {
      const { result } = setup();
      await waitFor(() => expect(result.current.loading).toBe(false));
      act(() => {
        result.current.setFilter("Mouse");
      });
      expect(result.current.filteredProducts).toHaveLength(1);
      expect(result.current.filteredProducts[0].name).toBe("Mouse Gamer");
    });
  });

  describe("saveProduct", () => {
    it("não permite salvar produto com preço zero ou negativo", async () => {
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
    });

    it("adiciona novo produto à lista ao criar", async () => {
      const newProduct: Product = {
        id: 3,
        name: "Monitor",
        price: 1000,
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
          categoryIds: [],
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
          categoryIds: [],
        });
      });

      expect(result.current.products[0].name).toBe("Mouse Atualizado");
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
  });
});
