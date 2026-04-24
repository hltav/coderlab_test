import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProductTable } from "../../../pages/products/ProductTable";
import { Product } from "../../../types";

// ── Mocks de Dados ───────────────────────────────────────────────────────────

const mockProducts: Product[] = [
  {
    id: 1,
    name: "Teclado Mecânico",
    price: 450.9,
    description: "Switch Blue",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    categories: [
      {
        productId: 1,
        categoryId: 10,
        category: {
          id: 10,
          name: "Periféricos",
          parentId: 1,
          parent: { id: 1, name: "Informática", parentId: null },
        },
      },
    ],
  },
];

const defaultProps = {
  products: mockProducts,
  onEdit: vi.fn(),
  onDelete: vi.fn(),
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("ProductTable", () => {
  it("deve renderizar a tabela com os cabeçalhos corretos", () => {
    render(<ProductTable {...defaultProps} />);

    expect(screen.getByText(/produto/i)).toBeInTheDocument();
    expect(screen.getByText(/categorias/i)).toBeInTheDocument();
    expect(screen.getByText(/descrição/i)).toBeInTheDocument();
    expect(screen.getByText(/preço/i)).toBeInTheDocument();
    expect(screen.getByText(/ações/i)).toBeInTheDocument();
  });

  it("deve exibir a mensagem de lista vazia quando não houver produtos", () => {
    render(<ProductTable {...defaultProps} products={[]} />);
    expect(screen.getByText(/Nenhum produto encontrado/i)).toBeInTheDocument();
  });

  it("deve renderizar o nome, descrição e preço formatado", () => {
    render(<ProductTable {...defaultProps} />);

    expect(screen.getByText("Teclado Mecânico")).toBeInTheDocument();
    expect(screen.getByText("Switch Blue")).toBeInTheDocument();
    // Verifica a formatação pt-BR (R$ 450,90)
    expect(screen.getByText(/450,90/)).toBeInTheDocument();
  });

  it("deve renderizar a hierarquia de categorias (Pai > Filho)", () => {
    render(<ProductTable {...defaultProps} />);

    expect(screen.getByText("Informática")).toBeInTheDocument();
    expect(screen.getByText("Periféricos")).toBeInTheDocument();
  });

  it("deve chamar onEdit com o objeto do produto ao clicar em editar", () => {
    const onEdit = vi.fn();
    render(<ProductTable {...defaultProps} onEdit={onEdit} />);

    const editButton = screen.getByTitle("Editar");
    fireEvent.click(editButton);

    expect(onEdit).toHaveBeenCalledWith(mockProducts[0]);
  });

  it("deve chamar onDelete com o ID correto ao clicar em remover", () => {
    const onDelete = vi.fn();
    render(<ProductTable {...defaultProps} onDelete={onDelete} />);

    const deleteButton = screen.getByTitle("Remover");
    fireEvent.click(deleteButton);

    expect(onDelete).toHaveBeenCalledWith(1);
  });

  it("deve exibir um traço quando a descrição for nula", () => {
    const productWithoutDesc = [{ ...mockProducts[0], description: "" }];
    render(<ProductTable {...defaultProps} products={productWithoutDesc} />);

    expect(screen.getByText("—")).toBeInTheDocument();
  });
});
