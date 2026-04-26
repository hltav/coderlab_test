import "@testing-library/jest-dom/vitest";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProductForm } from "../../../pages/products/ProductForm";
import type { CategoryTree, Product } from "../../../types";

// ── Mocks ─────────────────────────────────────────────

const mockCategoryTree: CategoryTree = {
  1: [
    {
      id: 10,
      name: "Smartphones",
      parentId: 1,
      parent: { id: 1, name: "Eletrônicos", parentId: null },
    },
    {
      id: 11,
      name: "Notebooks",
      parentId: 1,
      parent: { id: 1, name: "Eletrônicos", parentId: null },
    },
  ],
  2: [
    {
      id: 20,
      name: "Camisetas",
      parentId: 2,
      parent: { id: 2, name: "Roupas", parentId: null },
    },
  ],
};

const mockProduct: Product = {
  id: 50,
  name: "iPhone 15",
  price: 5000,
  stock: 10,
  description: "Celular Apple",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  categories: [
    {
      productId: 50,
      categoryId: 10,
      category: {
        id: 10,
        name: "Smartphones",
        parentId: 1,
      },
    },
  ],
};

const defaultProps = {
  editingProduct: null,
  categoryTree: mockCategoryTree,
  onSave: vi.fn().mockResolvedValue(true),
  onClose: vi.fn(),
};

// ── Tests ─────────────────────────────────────────────

describe("ProductForm", () => {
  describe("renderização", () => {
    it("deve renderizar nome vazio", () => {
      render(<ProductForm {...defaultProps} />);
      expect(screen.getByPlaceholderText(/Monitor UltraWide/i)).toHaveValue("");
    });

    it("deve renderizar preço vazio", () => {
      render(<ProductForm {...defaultProps} />);
      expect(screen.getByPlaceholderText("0,00")).toHaveValue("");
    });

    it("deve renderizar estoque padrão", () => {
      render(<ProductForm {...defaultProps} />);
      expect(screen.getByPlaceholderText("0")).toHaveValue(0);
    });
  });

  // ── Categoria ───────────────────────────────────────

  describe("categoria", () => {
    it("deve exibir nome do parent corretamente no select", () => {
      render(<ProductForm {...defaultProps} />);

      const options = screen.getAllByRole("option");

      expect(options[0]).toHaveTextContent("Eletrônicos");
      expect(options[1]).toHaveTextContent("Roupas");
    });

    it("deve limpar subcategorias ao trocar categoria", () => {
      render(<ProductForm {...defaultProps} />);

      fireEvent.change(screen.getByLabelText(/Categoria/i), {
        target: { value: "2" },
      });

      expect(
        screen.getByRole("button", { name: /Camisetas/i }),
      ).toBeInTheDocument();
    });
  });

  // ── Subcategorias ───────────────────────────────────

  describe("subcategorias", () => {
    it("deve selecionar subcategoria", () => {
      render(<ProductForm {...defaultProps} />);

      const btn = screen.getByRole("button", { name: /Smartphones/i });

      fireEvent.click(btn);

      expect(btn).toHaveClass("bg-indigo-600");
    });

    it("deve desmarcar subcategoria", () => {
      render(<ProductForm {...defaultProps} />);

      const btn = screen.getByRole("button", { name: /Smartphones/i });

      fireEvent.click(btn);
      fireEvent.click(btn);

      expect(btn).not.toHaveClass("bg-indigo-600");
    });

    it("deve manter múltiplas subcategorias selecionadas", () => {
      render(<ProductForm {...defaultProps} />);

      const smartphone = screen.getByRole("button", { name: /Smartphones/i });
      const notebook = screen.getByRole("button", { name: /Notebooks/i });

      fireEvent.click(smartphone);
      fireEvent.click(notebook);

      expect(smartphone).toHaveClass("bg-indigo-600");
      expect(notebook).toHaveClass("bg-indigo-600");
    });
  });

  // ── Preço ───────────────────────────────────────────

  describe("preço", () => {
    it("deve formatar preço corretamente", () => {
      render(<ProductForm {...defaultProps} />);

      fireEvent.change(screen.getByPlaceholderText("0,00"), {
        target: { value: "25050" },
      });

      expect(screen.getByPlaceholderText("0,00")).toHaveValue("250,50");
    });
  });

  // ── Submissão ───────────────────────────────────────

  describe("submit", () => {
    it("deve chamar onSave com dados corretos", async () => {
      const onSave = vi.fn().mockResolvedValue(true);

      render(<ProductForm {...defaultProps} onSave={onSave} />);

      fireEvent.change(screen.getByPlaceholderText(/Monitor UltraWide/i), {
        target: { value: "Teclado Mecânico" },
      });

      fireEvent.change(screen.getByPlaceholderText("0,00"), {
        target: { value: "25050" },
      });

      fireEvent.click(screen.getByRole("button", { name: /Smartphones/i }));

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /Salvar/i }));
      });

      await waitFor(() => {
        expect(onSave).toHaveBeenCalledWith(
          expect.objectContaining({
            name: "Teclado Mecânico",
            price: 250.5,
            categoryIds: [10],
          }),
        );
      });
    });

    it("deve chamar onClose após sucesso", async () => {
      const onSave = vi.fn().mockResolvedValue(true);
      const onClose = vi.fn();

      render(
        <ProductForm {...defaultProps} onSave={onSave} onClose={onClose} />,
      );

      fireEvent.change(screen.getByPlaceholderText(/Monitor UltraWide/i), {
        target: { value: "Produto Válido" },
      });

      fireEvent.change(screen.getByPlaceholderText("0,00"), {
        target: { value: "10000" },
      });

      fireEvent.click(screen.getByRole("button", { name: /Smartphones/i }));

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /Salvar/i }));
      });

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      });
    });

    it("não deve fechar se salvar falhar", async () => {
      const onSave = vi.fn().mockResolvedValue(false);
      const onClose = vi.fn();

      render(
        <ProductForm {...defaultProps} onSave={onSave} onClose={onClose} />,
      );

      fireEvent.change(screen.getByPlaceholderText(/Monitor UltraWide/i), {
        target: { value: "Produto Válido" },
      });

      fireEvent.change(screen.getByPlaceholderText("0,00"), {
        target: { value: "10000" },
      });

      fireEvent.click(screen.getByRole("button", { name: /Smartphones/i }));

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /Salvar/i }));
      });

      await waitFor(() => {
        expect(onSave).toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();
      });
    });
  });
});
