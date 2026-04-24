import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CategoryModal } from "../../../pages/categories/CategoryModal";
import { CategoryTree } from "../../../types";

// ── Mocks de Dados ───────────────────────────────────────────────────────────

const mockCategoryTree: CategoryTree = {
  Eletronicos: [
    { id: 2, name: "Celulares", parentId: 1 },
    { id: 3, name: "Notebooks", parentId: 1 },
  ],
  Roupas: [],
};

const defaultProps = {
  isOpen: true,
  categoryTree: mockCategoryTree,
  onAddCategory: vi.fn(),
  onAddSubcategory: vi.fn(),
  onDeleteCategory: vi.fn(),
  onClose: vi.fn(),
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("CategoryModal", () => {
  it("não deve renderizar nada quando isOpen for false", () => {
    render(<CategoryModal {...defaultProps} isOpen={false} />);
    expect(
      screen.queryByText(/Configurar Categorias/i),
    ).not.toBeInTheDocument();
  });

  it("deve renderizar as categorias e subcategorias corretamente", () => {
    render(<CategoryModal {...defaultProps} />);

    expect(screen.getByText(/eletronicos/i)).toBeInTheDocument();
    expect(screen.getByText(/roupas/i)).toBeInTheDocument();

    expect(screen.getByText(/celulares/i)).toBeInTheDocument();
    expect(screen.getByText(/notebooks/i)).toBeInTheDocument();
  });

  it("deve chamar onAddCategory com o valor correto ao clicar no botão", () => {
    const onAddCategory = vi.fn();
    render(<CategoryModal {...defaultProps} onAddCategory={onAddCategory} />);

    const input = screen.getByPlaceholderText(/Ex: Brinquedos/i);
    const button = screen.getByRole("button", { name: /Adicionar/i });

    fireEvent.change(input, { target: { value: "Livros" } });
    fireEvent.click(button);

    expect(onAddCategory).toHaveBeenCalledWith("Livros");
    // Verifica se o input foi limpo
    expect(input).toHaveValue("");
  });

  it("deve chamar onAddSubcategory ao clicar no botão de subcategoria", () => {
    const onAddSubcategory = vi.fn();
    render(
      <CategoryModal {...defaultProps} onAddSubcategory={onAddSubcategory} />,
    );

    // Pegamos o input de subcategoria dentro da seção "Eletronicos"
    const subInputs = screen.getAllByPlaceholderText(/Nova subcategoria.../i);
    const subButtons = screen.getAllByText(/\+ Add Sub/i);

    // Vamos usar o primeiro (índice 0) que corresponde a Eletronicos
    fireEvent.change(subInputs[0], { target: { value: "Tablets" } });
    fireEvent.click(subButtons[0]);

    expect(onAddSubcategory).toHaveBeenCalledWith("Eletronicos", "Tablets");
    expect(subInputs[0]).toHaveValue("");
  });

  it("deve chamar onDeleteCategory ao clicar no ícone de lixeira", () => {
    const onDeleteCategory = vi.fn();
    render(
      <CategoryModal {...defaultProps} onDeleteCategory={onDeleteCategory} />,
    );

    // Existem dois botões de delete (um para Eletronicos, outro para Roupas)
    const deleteButtons = screen.getAllByLabelText(/Delete/i);

    fireEvent.click(deleteButtons[1]); // Clicando no delete de "Roupas"

    expect(onDeleteCategory).toHaveBeenCalledWith("Roupas");
  });

  it("deve chamar onClose ao clicar no botão de fechar", () => {
    const onClose = vi.fn();
    render(<CategoryModal {...defaultProps} onClose={onClose} />);

    const closeButton = screen.getByLabelText("close");
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });

  it("deve permitir adicionar categoria pressionando Enter", () => {
    const onAddCategory = vi.fn();
    render(<CategoryModal {...defaultProps} onAddCategory={onAddCategory} />);

    const input = screen.getByPlaceholderText(/Ex: Brinquedos/i);
    fireEvent.change(input, { target: { value: "Ferramentas" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    expect(onAddCategory).toHaveBeenCalledWith("Ferramentas");
  });
});
