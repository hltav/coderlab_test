import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Page from "../../pages/MainPage";

// ── Mocks ───────────────────────────────────────────────────────────

const mockUseProducts = {
  products: [
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
  filters: {
    name: "",
    description: "",
    categoryIds: [],
    page: 1,
    limit: 10,
  },
  setFilters: vi.fn(),
  meta: {
    total: 1,
    lastPage: 1,
  },
  saveProduct: vi.fn(),
  deleteProduct: vi.fn(),
  loading: false,
};

const mockUseCategories = {
  categoryTree: { 1: [] },
  flatCategories: [],
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

// ── Tests ───────────────────────────────────────────────────────────

describe("Página Principal (Page)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve renderizar os componentes base", () => {
    render(<Page />);

    // Header
    expect(screen.getByText(/Mercatto/i)).toBeInTheDocument();

    // Produto mockado na tabela
    expect(screen.getByText("Produto Mockado")).toBeInTheDocument();

    // filtro REAL do código (corrigido conforme DOM)
    expect(screen.getByPlaceholderText(/Buscar por nome/i)).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(/Buscar por descrição/i),
    ).toBeInTheDocument();

    // botão de novo produto
    expect(
      screen.getByRole("button", { name: /Novo Produto/i }),
    ).toBeInTheDocument();

    // contador
    expect(
      screen.getByText(/1 produto\(s\) encontrado\(s\)/i),
    ).toBeInTheDocument();
  });

  it("deve abrir o ProductModal através do Header", () => {
    render(<Page />);

    fireEvent.click(screen.getByRole("button", { name: /Novo Produto/i }));

    expect(
      screen.getByRole("heading", { name: /Novo Produto/i }),
    ).toBeInTheDocument();
  });

  it("deve fechar o modal corretamente", () => {
    render(<Page />);

    fireEvent.click(screen.getByRole("button", { name: /Novo Produto/i }));

    fireEvent.click(screen.getByLabelText("close"));

    expect(
      screen.queryByRole("heading", { name: /Novo Produto/i }),
    ).not.toBeInTheDocument();
  });

  it("deve abrir o CategoryModal através do botão de configuração", () => {
    render(<Page />);

    fireEvent.click(screen.getByTitle(/Gerir Categorias/i));

    expect(screen.getByText(/Configurar Categorias/i)).toBeInTheDocument();
  });
});
