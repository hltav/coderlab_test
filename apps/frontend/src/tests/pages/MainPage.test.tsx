import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Page from "../../pages/MainPage";

// ── Mocks Estáveis ───────────────────────────────────────────────────────────

const mockUseProducts = {
  filteredProducts: [
    {
      id: 1,
      name: "Produto Mockado",
      price: 10,
      categories: [],
      description: "Desc",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  filter: "",
  setFilter: vi.fn(),
  saveProduct: vi.fn(),
  deleteProduct: vi.fn(),
  loading: false,
};

const mockUseCategories = {
  categoryTree: { Eletronicos: [] },
  addCategory: vi.fn(),
  addSubcategory: vi.fn(),
  deleteCategory: vi.fn(),
};

vi.mock("../../hooks/useProducts", () => ({
  useProducts: () => mockUseProducts,
}));

vi.mock("../../hooks/useCategories", () => ({
  useCategories: () => mockUseCategories,
}));

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("Página Principal (Page)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve renderizar os componentes base (Header, Toolbar e Table)", () => {
    render(<Page />);

    // 1. Testa o Header usando uma função matcher para lidar com o <span>
    expect(
      screen.getByText((content, element) => {
        return (
          element?.tagName.toLowerCase() === "h1" &&
          content.includes("Mercatto")
        );
      }),
    ).toBeInTheDocument();

    // 2. Testa a Toolbar procurando pelo placeholder exato
    expect(
      screen.getByPlaceholderText(/Pesquisar por nome ou categoria/i),
    ).toBeInTheDocument();

    // 3. Testa o contador da Toolbar
    expect(screen.getByText(/Produtos em Estoque:/i)).toBeInTheDocument();

    // 4. Testa a Table verificando se o produto do mock está lá
    expect(screen.getByText("Produto Mockado")).toBeInTheDocument();
  });

  it("deve abrir o ProductModal através do Header", () => {
    render(<Page />);

    const btnNew = screen.getByRole("button", { name: /Novo Produto/i });
    fireEvent.click(btnNew);

    expect(
      screen.getByRole("heading", { level: 2, name: /Novo Produto/i }),
    ).toBeInTheDocument();
  });

  it("deve fechar o modal corretamente", () => {
    render(<Page />);

    fireEvent.click(screen.getByRole("button", { name: /Novo Produto/i }));

    const closeBtn = screen.getByLabelText("close");
    fireEvent.click(closeBtn);

    expect(
      screen.queryByRole("heading", { name: /Novo Produto/i }),
    ).not.toBeInTheDocument();
  });

  it("deve abrir o CategoryModal através do botão de configuração", () => {
    render(<Page />);

    // O Header usa title="Gerir Categorias" no botão de Settings
    const btnConfig = screen.getByTitle(/Gerir Categorias/i);
    fireEvent.click(btnConfig);

    expect(screen.getByText(/Configurar Categorias/i)).toBeInTheDocument();
  });
});
