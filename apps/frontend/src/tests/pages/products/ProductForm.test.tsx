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
import { CategoryTree, Product } from "../../../types";

// ── Mocks de Dados ───────────────────────────────────────────────────────────

const mockCategoryTree: CategoryTree = {
  Eletronicos: [
    { id: 10, name: "Smartphones", parentId: 1 },
    { id: 11, name: "Notebooks", parentId: 1 },
  ],
  Roupas: [{ id: 20, name: "Camisetas", parentId: 2 }],
};

const mockProduct: Product = {
  id: 50,
  name: "iPhone 15",
  price: 5000,
  description: "Celular Apple",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  categories: [
    {
      productId: 50,
      categoryId: 10,
      category: { id: 10, name: "Smartphones", parentId: 1 },
    },
  ],
};

const defaultProps = {
  editingProduct: null,
  categoryTree: mockCategoryTree,
  onSave: vi.fn().mockResolvedValue(true),
  onClose: vi.fn(),
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("ProductForm", () => {
  it("deve renderizar os campos vazios no modo de criação", () => {
    render(<ProductForm {...defaultProps} />);

    expect(screen.getByPlaceholderText(/Monitor UltraWide/i)).toHaveValue("");
    expect(screen.getByPlaceholderText("0,00")).toHaveValue(null);
    expect(screen.getByLabelText(/Categoria/i)).toHaveValue("Eletronicos");
  });

  it("deve preencher os campos corretamente no modo de edição", () => {
    render(<ProductForm {...defaultProps} editingProduct={mockProduct} />);

    expect(screen.getByPlaceholderText(/Monitor UltraWide/i)).toHaveValue(
      "iPhone 15",
    );
    expect(screen.getByPlaceholderText("0,00")).toHaveValue(5000);
    expect(screen.getByText("Smartphones")).toHaveClass("bg-indigo-600"); // Selecionado
  });

  it("deve atualizar as subcategorias ao mudar a categoria principal", () => {
    render(<ProductForm {...defaultProps} />);

    const select = screen.getByLabelText(/Categoria/i);

    // Inicialmente mostra eletrônicos
    expect(screen.getByText("Smartphones")).toBeInTheDocument();

    fireEvent.change(select, { target: { value: "Roupas" } });

    expect(screen.queryByText("Smartphones")).not.toBeInTheDocument();
    expect(screen.getByText("Camisetas")).toBeInTheDocument();
  });

  it("deve selecionar/deselecionar subcategorias ao clicar", () => {
    render(<ProductForm {...defaultProps} />);

    const subButton = screen.getByText("Smartphones");

    // Seleciona
    fireEvent.click(subButton);
    expect(subButton).toHaveClass("bg-indigo-600");

    // Deseleciona
    fireEvent.click(subButton);
    expect(subButton).not.toHaveClass("bg-indigo-600");
  });

  it("deve validar campos obrigatórios via Zod e exibir mensagens de erro", async () => {
    render(<ProductForm {...defaultProps} />);

    const saveButton = screen.getByRole("button", { name: /Salvar/i });
    fireEvent.click(saveButton);

    // Buscamos por qualquer texto que contenha "obrigatório" ou "Erro"
    // (Ajuste a Regex conforme as mensagens reais do seu CreateProductSchema)
    await waitFor(() => {
      const errorMessages = screen.queryAllByText(
        /obrigatório|inválido|preço/i,
      );
      expect(errorMessages.length).toBeGreaterThan(0);
    });
  });

  it("deve chamar onSave com os dados corretos ao submeter o formulário", async () => {
    const onSave = vi.fn().mockResolvedValue(true);
    render(<ProductForm {...defaultProps} onSave={onSave} />);

    // Preenche os campos
    fireEvent.change(screen.getByPlaceholderText(/Monitor UltraWide/i), {
      target: { value: "Teclado Mecânico" },
    });
    fireEvent.change(screen.getByPlaceholderText("0,00"), {
      target: { value: "250.50" },
    });

    // Seleciona uma subcategoria
    fireEvent.click(screen.getByText("Notebooks"));

    fireEvent.click(screen.getByRole("button", { name: /Salvar/i }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Teclado Mecânico",
          price: 250.5,
          categoryIds: [11],
        }),
      );
    });
  });

  it("deve chamar onClose após um salvamento bem-sucedido", async () => {
    // 1. Garantimos que o mock resolve como TRUE
    const onSave = vi.fn().mockResolvedValue(true);
    const onClose = vi.fn();

    render(<ProductForm {...defaultProps} onSave={onSave} onClose={onClose} />);

    // 2. Preenchimento completo para evitar qualquer erro do Zod
    // Use valores que você tem certeza que o seu CreateProductSchema aceita
    fireEvent.change(screen.getByPlaceholderText(/Monitor UltraWide/i), {
      target: { value: "Produto de Teste Valido" },
    });

    fireEvent.change(screen.getByPlaceholderText("0,00"), {
      target: { value: "100" },
    });

    // 3. Importante: Se o seu schema exigir ao menos uma categoria, selecione uma:
    const subButton = screen.queryByText("Smartphones");
    if (subButton) fireEvent.click(subButton);

    const saveButton = screen.getByRole("button", { name: /Salvar/i });

    // 4. Disparamos o evento e aguardamos
    await act(async () => {
      fireEvent.click(saveButton);
    });

    await waitFor(
      () => {
        expect(onSave).toHaveBeenCalled();
        expect(onClose).toHaveBeenCalled();
      },
      { timeout: 3000 },
    );
  });
});
