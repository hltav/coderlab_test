import { useEffect, useState } from "react";
import { api } from "../services/api";
import type { Category, CategoryTree, NotificationState } from "../types";

export function useCategories(
  showNotification: (msg: string, type?: NotificationState["type"]) => void,
) {
  const [categoryTree, setCategoryTree] = useState<CategoryTree>({});
  const [flatCategories, setFlatCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    return api
      .getCategories()
      .then((all) => {
        setFlatCategories(all);
        const parents = all.filter((c) => c.parentId === null);
        const tree: CategoryTree = {};
        for (const p of parents) {
          tree[p.id] = all.filter((c) => c.parentId === p.id);
        }
        setCategoryTree(tree);
      })
      .catch(() => showNotification("Erro ao carregar categorias", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  // Adiciona categoria pai
  const addCategory = async (name: string) => {
    if (!name.trim()) return;
    try {
      await api.createCategory({ name });
      await load();
      showNotification("Categoria adicionada!");
    } catch {
      showNotification("Erro ao adicionar categoria", "error");
    }
  };

  // Adiciona subcategoria passando o parentId correto
  const addSubcategory = async (parentName: string, subName: string) => {
    if (!subName.trim()) return;
    const parent = flatCategories.find(
      (c) => c.name === parentName && c.parentId === null,
    );
    if (!parent) return;
    try {
      await api.createCategory({ name: subName, parentId: parent.id });
      await load();
      showNotification("Subcategoria adicionada!");
    } catch {
      showNotification("Erro ao adicionar subcategoria", "error");
    }
  };

  const deleteCategory = async (id: number) => {
    try {
      await api.deleteCategory(id);
      await load();
      showNotification("Categoria removida!", "info");
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? "Erro ao remover categoria";
      showNotification(message, "error");
    }
  };

  return {
    categoryTree,
    flatCategories,
    addCategory,
    addSubcategory,
    deleteCategory,
    loading,
  };
}
