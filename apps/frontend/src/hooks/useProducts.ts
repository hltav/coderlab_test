import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import type { NotificationState, Product, ProductFormData } from "../types";

export function useProducts(
  showNotification: (msg: string, type?: NotificationState["type"]) => void,
) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getProducts()
      .then(setProducts)
      .catch(() => showNotification("Erro ao carregar produtos", "error"))
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = useMemo(() => {
    if (!filter) return products;
    const q = filter.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.categories.some((c) => c.category.name.toLowerCase().includes(q)),
    );
  }, [products, filter]);

  const saveProduct = async (data: ProductFormData): Promise<boolean> => {
    if (data.price <= 0) {
      showNotification("O preço deve ser superior a zero", "error");
      return false;
    }
    try {
      const saved = await api.saveProduct(data);
      setProducts((prev) =>
        data.id
          ? prev.map((p) => (p.id === data.id ? saved : p))
          : [...prev, saved],
      );
      showNotification(data.id ? "Produto atualizado!" : "Produto criado!");
      return true;
    } catch {
      showNotification("Erro ao salvar produto", "error");
      return false;
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      await api.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showNotification("Produto removido", "info");
    } catch {
      showNotification("Erro ao remover produto", "error");
    }
  };

  return {
    products,
    filteredProducts,
    filter,
    setFilter,
    saveProduct,
    deleteProduct,
    loading,
  };
}
