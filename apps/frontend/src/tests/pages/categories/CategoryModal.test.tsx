import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CategoryModal } from "../../../pages/categories/CategoryModal";
import { CategoryTree } from "../../../types";

const mockCategoryTree: CategoryTree = {
  1: [
    {
      id: 2,
      name: "Celulares",
      parentId: 1,
      parent: { id: 1, name: "Eletronicos", parentId: null },
    },
    {
      id: 3,
      name: "Notebooks",
      parentId: 1,
      parent: { id: 1, name: "Eletronicos", parentId: null },
    },
  ],
  4: [
    {
      id: 5,
      name: "Camisetas",
      parentId: 4,
      parent: { id: 4, name: "Roupas", parentId: null },
    },
  ],
};

const defaultProps = {
  isOpen: true,
  categoryTree: mockCategoryTree,
  onAddCategory: vi.fn(),
  onAddSubcategory: vi.fn(),
  onDeleteCategory: vi.fn(),
  onClose: vi.fn(),
};

describe("CategoryModal", () => {
  it("não deve renderizar nada quando isOpen for false", () => {
    render(<CategoryModal {...defaultProps} isOpen={false} />);
    expect(
      screen.queryByText(/Configurar Categorias/i),
    ).not.toBeInTheDocument();
  });

  it("deve renderizar os nomes dos pais vindos de parent.name", () => {
    render(<CategoryModal {...defaultProps} />);
    expect(screen.getByText(/eletronicos/i)).toBeInTheDocument();
    expect(screen.getByText(/roupas/i)).toBeInTheDocument();
  });

  it("deve renderizar as subcategorias corretamente", () => {
    render(<CategoryModal {...defaultProps} />);
    expect(screen.getByText(/celulares/i)).toBeInTheDocument();
    expect(screen.getByText(/notebooks/i)).toBeInTheDocument();
    expect(screen.getByText(/camisetas/i)).toBeInTheDocument();
  });

  it("deve chamar onAddCategory com o valor correto ao clicar no botão", () => {
    const onAddCategory = vi.fn();
    render(<CategoryModal {...defaultProps} onAddCategory={onAddCategory} />);

    const input = screen.getByPlaceholderText(/Ex: Brinquedos/i);
    const button = screen.getByRole("button", { name: /Adicionar/i });

    fireEvent.change(input, { target: { value: "Livros" } });
    fireEvent.click(button);

    expect(onAddCategory).toHaveBeenCalledWith("Livros");
    expect(input).toHaveValue("");
  });

  it("deve chamar onAddSubcategory com a chave numérica string e o nome", () => {
    const onAddSubcategory = vi.fn();
    render(
      <CategoryModal {...defaultProps} onAddSubcategory={onAddSubcategory} />,
    );

    const subInputs = screen.getAllByPlaceholderText(/Nova subcategoria.../i);
    const subButtons = screen.getAllByText(/\+ Add Sub/i);

    // índice 0 = grupo 1 (Eletronicos)
    fireEvent.change(subInputs[0], { target: { value: "Tablets" } });
    fireEvent.click(subButtons[0]);

    // o componente passa catIdStr ("1") como primeiro argumento
    expect(onAddSubcategory).toHaveBeenCalledWith("1", "Tablets");
    expect(subInputs[0]).toHaveValue("");
  });

  it("deve chamar onDeleteCategory com o id numérico correto", () => {
    const onDeleteCategory = vi.fn();
    render(
      <CategoryModal {...defaultProps} onDeleteCategory={onDeleteCategory} />,
    );

    const deleteButtons = screen.getAllByLabelText(/Delete/i);

    // índice 0 = grupo 1 (Eletronicos), índice 1 = grupo 4 (Roupas)
    fireEvent.click(deleteButtons[1]);

    expect(onDeleteCategory).toHaveBeenCalledWith(4);
  });

  it("deve chamar onClose ao clicar no botão de fechar", () => {
    const onClose = vi.fn();
    render(<CategoryModal {...defaultProps} onClose={onClose} />);

    fireEvent.click(screen.getByLabelText("close"));
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

  it("não deve chamar onAddSubcategory se o input estiver vazio", () => {
    const onAddSubcategory = vi.fn();
    render(
      <CategoryModal {...defaultProps} onAddSubcategory={onAddSubcategory} />,
    );

    const subButtons = screen.getAllByText(/\+ Add Sub/i);
    fireEvent.click(subButtons[0]); // clica sem digitar nada

    expect(onAddSubcategory).not.toHaveBeenCalled();
  });
});
