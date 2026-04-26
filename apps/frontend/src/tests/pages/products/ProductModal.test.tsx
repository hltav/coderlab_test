import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProductModal } from "../../../pages/products/ProductModal";
import { CategoryTree, Product } from "../../../types";

// ── Mocks ───────────────────────────────────────────────────────────

const mockCategoryTree: CategoryTree = {
  1: [
    { id: 10, name: "Smartphones", parentId: 1 },
    { id: 11, name: "Notebooks", parentId: 1 },
  ],
};

const mockProduct: Product = {
  id: 1,
  name: "Produto Teste",
  price: 100,
  stock: 20,
  description: "Descrição do produto teste",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  categories: [],
};

const defaultProps = {
  isOpen: true,
  editingProduct: null,
  categoryTree: mockCategoryTree,
  onSave: vi.fn().mockResolvedValue(true),
  onClose: vi.fn(),
};

// ── Tests ───────────────────────────────────────────────────────────

describe("ProductModal", () => {
  it("não deve renderizar nada quando fechado", () => {
    const { container } = render(
      <ProductModal {...defaultProps} isOpen={false} />,
    );

    expect(container.firstChild).toBeNull();
  });

  it("deve exibir 'Novo Produto' quando criando produto", () => {
    render(<ProductModal {...defaultProps} />);

    expect(
      screen.getByRole("heading", { name: /Novo Produto/i }),
    ).toBeInTheDocument();
  });

  it("deve exibir 'Editar Produto' quando editando produto", () => {
    render(<ProductModal {...defaultProps} editingProduct={mockProduct} />);

    expect(
      screen.getByRole("heading", { name: /Editar Produto/i }),
    ).toBeInTheDocument();
  });

  it("deve chamar onClose ao clicar no botão de fechar", () => {
    const onClose = vi.fn();

    render(<ProductModal {...defaultProps} onClose={onClose} />);

    fireEvent.click(screen.getByLabelText("close"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("deve renderizar o ProductForm", () => {
    render(<ProductModal {...defaultProps} />);

    expect(
      screen.getByPlaceholderText(/Ex: Monitor UltraWide/i),
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/Categoria/i)).toBeInTheDocument();
  });
});
