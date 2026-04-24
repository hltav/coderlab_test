import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../../services/api";
// Ajuste o caminho conforme necessário

describe("API Service", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  // ── Helper para Mockar Respostas do Fetch ──────────────────────────────────
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
      mockFetchResponse([{ id: 1, name: "Teclado" }]);

      const products = await api.getProducts("Teclado");

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/products?name=Teclado"),
        expect.any(Object),
      );
      expect(products).toHaveLength(1);
    });

    it("deve disparar erro quando a resposta não for ok", async () => {
      mockFetchResponse({ message: "Erro no servidor" }, false, 500);

      await expect(api.getProduct(1)).rejects.toThrow("HTTP 500");
    });

    it("deve decidir entre criar ou atualizar no saveProduct", async () => {
      mockFetchResponse({ id: 1, name: "Novo" });

      // Teste Criação (sem ID)
      await api.saveProduct({ name: "Novo", price: 10, categoryIds: [] });
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/products"),
        expect.objectContaining({ method: "POST" }),
      );

      // Teste Atualização (com ID)
      await api.saveProduct({
        id: 1,
        name: "Editado",
        price: 20,
        categoryIds: [],
      });
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/products/1"),
        expect.objectContaining({ method: "PATCH" }),
      );
    });
  });

  describe("Categories", () => {
    it("deve transformar a lista plana de categorias em um CategoryTree", async () => {
      const flatCategories = [
        {
          id: 1,
          name: "Eletrônicos",
          parentId: null,
          children: [{ id: 10, name: "Mouse", parentId: 1 }],
        },
        { id: 2, name: "Roupas", parentId: null, children: [] },
      ];

      mockFetchResponse(flatCategories);

      const tree = await api.getCategoryTree();

      // Verifica se o objeto foi agrupado corretamente
      expect(tree).toHaveProperty("Eletrônicos");
      expect(tree["Eletrônicos"]).toHaveLength(1);
      expect(tree["Eletrônicos"][0].name).toBe("Mouse");
      expect(tree).toHaveProperty("Roupas");
    });

    it("deve criar uma categoria via POST", async () => {
      mockFetchResponse({ id: 3, name: "Casa" });

      await api.createCategory({ name: "Casa" });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/category"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ name: "Casa" }),
        }),
      );
    });
  });
});
