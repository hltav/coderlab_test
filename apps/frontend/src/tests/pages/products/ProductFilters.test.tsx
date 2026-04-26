import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProductFilters } from "../../../pages/products/ProductFilters";
import { Category } from "../../../types";

// ── Mocks de Dados ───────────────────────────────────────────────────────────

const mockCategories: Category[] = [
  { id: 1, name: "Eletronicos", parentId: null },
  { id: 2, name: "Celulares", parentId: 1 },
  { id: 3, name: "Notebooks", parentId: 1 },
  { id: 4, name: "Roupas", parentId: null },
  { id: 5, name: "Camisetas", parentId: 4 },
];

const defaultProps = {
  categories: mockCategories,
  value: { name: "", description: "", categoryIds: [] },
  onChange: vi.fn(),
  onClear: vi.fn(),
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("ProductFilters", () => {
  describe("renderização", () => {
    it("deve renderizar os inputs de nome e descrição", () => {
      render(<ProductFilters {...defaultProps} />);
      expect(
        screen.getByPlaceholderText(/Buscar por nome/i),
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(/Buscar por descrição/i),
      ).toBeInTheDocument();
    });

    it("deve renderizar apenas categorias pai como botões", () => {
      render(<ProductFilters {...defaultProps} />);
      expect(
        screen.getByRole("button", { name: /Eletronicos/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Roupas/i }),
      ).toBeInTheDocument();
      // subcategorias não devem aparecer como botões
      expect(
        screen.queryByRole("button", { name: /Celulares/i }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /Camisetas/i }),
      ).not.toBeInTheDocument();
    });

    it("deve preencher inputs com value externo", () => {
      render(
        <ProductFilters
          {...defaultProps}
          value={{ name: "Mouse", description: "Gamer", categoryIds: [] }}
        />,
      );
      expect(screen.getByPlaceholderText(/Buscar por nome/i)).toHaveValue(
        "Mouse",
      );
      expect(screen.getByPlaceholderText(/Buscar por descrição/i)).toHaveValue(
        "Gamer",
      );
    });

    it("deve mostrar contador de categorias selecionadas", () => {
      render(
        <ProductFilters {...defaultProps} value={{ categoryIds: [2, 3] }} />,
      );
      expect(
        screen.getByText(/2 categoria\(s\) selecionada\(s\)/i),
      ).toBeInTheDocument();
    });

    it("não deve mostrar contador quando nenhuma categoria está selecionada", () => {
      render(<ProductFilters {...defaultProps} />);
      expect(screen.queryByText(/selecionada/i)).not.toBeInTheDocument();
    });
  });

  describe("input de nome", () => {
    it("deve chamar onChange com name ao digitar", () => {
      const onChange = vi.fn();
      render(<ProductFilters {...defaultProps} onChange={onChange} />);

      fireEvent.change(screen.getByPlaceholderText(/Buscar por nome/i), {
        target: { value: "iPhone" },
      });

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ name: "iPhone" }),
      );
    });

    it("deve passar name como undefined quando input estiver vazio", () => {
      const onChange = vi.fn();
      render(
        <ProductFilters
          {...defaultProps}
          onChange={onChange}
          value={{ name: "Mouse", categoryIds: [] }}
        />,
      );

      fireEvent.change(screen.getByPlaceholderText(/Buscar por nome/i), {
        target: { value: "" },
      });

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ name: undefined }),
      );
    });
  });

  describe("input de descrição", () => {
    it("deve chamar onChange com description ao digitar", () => {
      const onChange = vi.fn();
      render(<ProductFilters {...defaultProps} onChange={onChange} />);

      fireEvent.change(screen.getByPlaceholderText(/Buscar por descrição/i), {
        target: { value: "Gamer" },
      });

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ description: "Gamer" }),
      );
    });

    it("deve passar description como undefined quando input estiver vazio", () => {
      const onChange = vi.fn();
      render(
        <ProductFilters
          {...defaultProps}
          onChange={onChange}
          value={{ description: "Algo", categoryIds: [] }}
        />,
      );

      fireEvent.change(screen.getByPlaceholderText(/Buscar por descrição/i), {
        target: { value: "" },
      });

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ description: undefined }),
      );
    });
  });

  describe("filtro de categorias", () => {
    it("deve selecionar os filhos ao clicar em categoria pai", () => {
      const onChange = vi.fn();
      render(<ProductFilters {...defaultProps} onChange={onChange} />);

      fireEvent.click(screen.getByRole("button", { name: /Eletronicos/i }));

      // Eletronicos tem filhos 2 e 3 — devem ser enviados
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ categoryIds: [2, 3] }),
      );
    });

    it("deve deselecionar filhos ao clicar novamente na categoria pai", () => {
      const onChange = vi.fn();
      render(
        <ProductFilters
          {...defaultProps}
          onChange={onChange}
          value={{ categoryIds: [2, 3] }}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: /Eletronicos/i }));

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ categoryIds: undefined }),
      );
    });

    it("deve marcar categoria pai como ativa quando algum filho está selecionado", () => {
      render(<ProductFilters {...defaultProps} value={{ categoryIds: [2] }} />);

      const btn = screen.getByRole("button", { name: /Eletronicos/i });
      expect(btn).toHaveClass("bg-indigo-600");
    });

    it("deve permitir selecionar múltiplas categorias pai independentes", () => {
      const onChange = vi.fn();
      // começa com Eletronicos já selecionado
      render(
        <ProductFilters
          {...defaultProps}
          onChange={onChange}
          value={{ categoryIds: [2, 3] }}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: /Roupas/i }));

      // deve adicionar filho de Roupas (5) mantendo os anteriores
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ categoryIds: [2, 3, 5] }),
      );
    });
  });

  describe("limpar filtros", () => {
    it("deve chamar onClear ao clicar em Limpar filtros", () => {
      const onClear = vi.fn();
      render(<ProductFilters {...defaultProps} onClear={onClear} />);

      fireEvent.click(screen.getByText(/Limpar filtros/i));

      expect(onClear).toHaveBeenCalled();
    });

    it("deve limpar os inputs locais ao clicar em Limpar filtros", () => {
      render(
        <ProductFilters
          {...defaultProps}
          value={{ name: "Mouse", description: "Gamer", categoryIds: [2] }}
        />,
      );

      fireEvent.click(screen.getByText(/Limpar filtros/i));

      expect(screen.getByPlaceholderText(/Buscar por nome/i)).toHaveValue("");
      expect(screen.getByPlaceholderText(/Buscar por descrição/i)).toHaveValue(
        "",
      );
    });
  });
});
