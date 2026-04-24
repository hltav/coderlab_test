import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProductModal } from "../../../pages/products/ProductModal";
import { CategoryTree, Product } from "../../../types";

// ── Mocks de Dados ───────────────────────────────────────────────────────────

const mockCategoryTree: CategoryTree = {
  Eletronicos: [],
};

const mockProduct: Product = {
  id: 1,
  name: "Produto Teste",
  price: 100,
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

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("ProductModal", () => {
  it("não deve renderizar nada quando isOpen for false", () => {
    const { container } = render(
      <ProductModal {...defaultProps} isOpen={false} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("deve exibir 'Novo Produto' quando não houver produto para editar", () => {
    render(<ProductModal {...defaultProps} editingProduct={null} />);
    expect(screen.getByText(/Novo Produto/i)).toBeInTheDocument();
  });

  it("deve exibir 'Editar Produto' quando um produto for passado", () => {
    render(<ProductModal {...defaultProps} editingProduct={mockProduct} />);
    expect(screen.getByText(/Editar Produto/i)).toBeInTheDocument();
  });

  it("deve chamar onClose ao clicar no botão de fechar (X)", () => {
    const onClose = vi.fn();
    render(<ProductModal {...defaultProps} onClose={onClose} />);

    const closeButton = screen.getByLabelText("close");
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("deve renderizar o ProductForm internamente", () => {
    render(<ProductModal {...defaultProps} />);

    expect(screen.getByText(/Nome do Produto/i)).toBeInTheDocument();
    expect(screen.getByText(/Categoria/i)).toBeInTheDocument();
    expect(screen.getByText(/Preço/i)).toBeInTheDocument();
  });
});
