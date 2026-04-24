import type { CreateCategoryInput } from "../components/dtos/category.dto";
import type {
  CreateProductInput,
  UpdateProductInput,
} from "../components/dtos/product.dto";
import type {
  Category,
  CategoryTree,
  Product,
  ProductFormData,
} from "../types";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function http<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  // ── Products ───────────────────────────────────────────────────────────────
  getProducts: (name?: string): Promise<Product[]> => {
    const query = name ? `?name=${encodeURIComponent(name)}` : "";
    return http<Product[]>(`/products${query}`);
  },

  getProduct: (id: number): Promise<Product> =>
    http<Product>(`/products/${id}`),

  createProduct: (data: CreateProductInput): Promise<Product> =>
    http<Product>("/products", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateProduct: (id: number, data: UpdateProductInput): Promise<Product> =>
    http<Product>(`/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteProduct: (id: number): Promise<void> =>
    http<void>(`/products/${id}`, { method: "DELETE" }),

  saveProduct: (product: ProductFormData): Promise<Product> => {
    if (product.id) {
      const { id, ...data } = product;
      return api.updateProduct(id, data);
    }
    return api.createProduct(product);
  },

  // ── Categories ─────────────────────────────────────────────────────────────
  // O backend retorna lista plana com duplicatas (pai + filho).
  // Filtramos só os pais (parentId === null) e usamos children já populados.
  getCategories: (): Promise<Category[]> => http<Category[]>("/category"),

  getCategoryTree: async (): Promise<CategoryTree> => {
    const all = await api.getCategories();

    const parents = all.filter(
      (c: Category): c is Category => c.parentId === null,
    );

    const tree: CategoryTree = {};

    for (const parent of parents) {
      tree[parent.name] = parent.children ?? [];
    }

    return tree;
  },
  createCategory: (data: CreateCategoryInput): Promise<Category> =>
    http<Category>("/category", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
