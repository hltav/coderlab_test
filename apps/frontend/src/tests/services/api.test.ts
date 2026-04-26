import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../../services/api";

describe("API Service", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  const mockFetchResponse = (data: any, ok = true, status = 200) => {
    (fetch as any).mockResolvedValue({
      ok,
      status,
      json: () => Promise.resolve(data),
      text: () => Promise.resolve(JSON.stringify(data)),
    });
  };

  describe("Products", () => {
    it("deve buscar produtos com query string opcional", async () => {
      mockFetchResponse({
        data: [{ id: 1, name: "Teclado" }],
        meta: { total: 1, page: 1, lastPage: 1 },
      });

      const result = await api.getProducts({ name: "Teclado" });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/products?name=Teclado"),
        expect.any(Object),
      );

      expect(result.data).toHaveLength(1);
    });

    it("deve disparar erro quando a resposta não for ok", async () => {
      mockFetchResponse({ message: "Erro no servidor" }, false, 500);

      await expect(api.getProduct(1)).rejects.toThrow("Erro no servidor");
    });

    it("deve decidir entre criar ou atualizar no saveProduct", async () => {
      mockFetchResponse({ id: 1, name: "Novo" });

      await api.saveProduct({
        name: "Novo",
        price: 10,
        categoryIds: [],
      } as any);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/products"),
        expect.objectContaining({ method: "POST" }),
      );

      await api.saveProduct({
        id: 1,
        name: "Editado",
        price: 20,
        categoryIds: [],
      } as any);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/products/1"),
        expect.objectContaining({ method: "PATCH" }),
      );
    });
  });

  describe("Categories", () => {
    it("deve transformar a lista plana em CategoryTree", async () => {
      const flatCategories = [
        {
          id: 1,
          name: "Eletrônicos",
          parentId: null,
          children: [{ id: 10, name: "Mouse", parentId: 1 }],
        },
        {
          id: 2,
          name: "Roupas",
          parentId: null,
          children: [],
        },
      ];

      mockFetchResponse(flatCategories);

      const tree = await api.getCategoryTree();

      // 🔥 CORRETO: chave é ID
      expect(tree).toHaveProperty("1");
      expect(tree["1"]).toHaveLength(1);
      expect(tree["1"][0].name).toBe("Mouse");

      expect(tree).toHaveProperty("2");
    });

    it("deve criar uma categoria via POST", async () => {
      mockFetchResponse({ id: 3, name: "Casa" });

      await api.createCategory({ name: "Casa" });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/categories"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ name: "Casa" }),
        }),
      );
    });
  });
});
