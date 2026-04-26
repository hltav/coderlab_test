import { useEffect, useState } from "react";
import { api } from "../services/api";
import type { NotificationState, Product, ProductFormData } from "../types";

export function useProducts(
  showNotification: (msg: string, type?: NotificationState["type"]) => void,
) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    name: "",
    description: "",
    categoryIds: [] as number[],
    page: 1,
    limit: 10,
  });

  const [meta, setMeta] = useState({
    total: 0,
    lastPage: 1,
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const res = await api.getProducts(filters);

      setProducts(res.data);
      setMeta(res.meta);
    } catch {
      showNotification("Erro ao carregar produtos", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [filters]);

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
    loading,
    filters,
    setFilters,
    meta,
    saveProduct,
    deleteProduct,
    refetch: fetchProducts,
  };
}
