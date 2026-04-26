import { useCallback, useState } from "react";
import { useCategories } from "../hooks/useCategories";
import { useProducts } from "../hooks/useProducts";
import type { NotificationState, Product } from "../types";
import { CategoryModal } from "./categories/CategoryModal";
import { Header } from "./components/Header";
import { Notification } from "./components/Notification";
import { ProductFilters } from "./products/ProductFilters";
import { ProductModal } from "./products/ProductModal";
import { ProductTable } from "./products/ProductTable";

export default function Page() {
  const [notification, setNotification] = useState<NotificationState | null>(
    null,
  );
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const showNotification = useCallback(
    (message: string, type: NotificationState["type"] = "success") => {
      setNotification({ message, type });
      setTimeout(() => setNotification(null), 3000);
    },
    [],
  );

  const {
    products,
    loading,
    filters,
    setFilters,
    meta,
    saveProduct,
    deleteProduct,
  } = useProducts(showNotification);
  const {
    categoryTree,
    flatCategories,
    addCategory,
    addSubcategory,
    deleteCategory,
  } = useCategories(showNotification);

  const handleOpenNew = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const handleClose = () => {
    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  // confirmação de exclusão
  const handleDelete = (id: number) => {
    if (!window.confirm("Tem certeza que deseja remover este produto?")) return;
    deleteProduct(id);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Header
        onNewProduct={handleOpenNew}
        onOpenConfig={() => setIsConfigOpen(true)}
      />

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-4">
        <ProductFilters
          categories={flatCategories}
          value={{
            name: filters.name,
            description: filters.description,
            categoryIds: filters.categoryIds,
          }}
          onChange={(f) => setFilters((prev) => ({ ...prev, ...f, page: 1 }))}
          onClear={() =>
            setFilters({
              name: "",
              description: "",
              categoryIds: [],
              page: 1,
              limit: 10,
            })
          }
        />

        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>
            {loading
              ? "Carregando..."
              : `${meta.total} produto(s) encontrado(s)`}
          </span>
          {/* paginação simples */}
          <div className="flex gap-2">
            <button
              disabled={filters.page <= 1}
              onClick={() => setFilters((p) => ({ ...p, page: p.page - 1 }))}
              className="px-3 py-1 border rounded-lg disabled:opacity-40"
            >
              ←
            </button>
            <span className="px-3 py-1">
              {filters.page} / {meta.lastPage}
            </span>
            <button
              disabled={filters.page >= meta.lastPage}
              onClick={() => setFilters((p) => ({ ...p, page: p.page + 1 }))}
              className="px-3 py-1 border rounded-lg disabled:opacity-40"
            >
              →
            </button>
          </div>
        </div>

        <ProductTable
          products={products}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </main>

      <ProductModal
        isOpen={isProductModalOpen}
        editingProduct={editingProduct}
        categoryTree={categoryTree}
        onSave={saveProduct}
        onClose={handleClose}
      />

      <CategoryModal
        isOpen={isConfigOpen}
        categoryTree={categoryTree}
        onAddCategory={addCategory}
        onAddSubcategory={addSubcategory}
        onDeleteCategory={deleteCategory}
        onClose={() => setIsConfigOpen(false)}
      />

      <Notification notification={notification} />
    </div>
  );
}
