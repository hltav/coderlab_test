import { useCallback, useState } from "react";
import { useCategories } from "../hooks/useCategories";
import { useProducts } from "../hooks/useProducts";
import type { NotificationState, Product } from "../types";
import { CategoryModal } from "./categories/CategoryModal";
import { Header } from "./components/Header";
import { Notification } from "./components/Notification";
import { Toolbar } from "./components/Toolbar";
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

  const { filteredProducts, filter, setFilter, saveProduct, deleteProduct } =
    useProducts(showNotification);
  const { categoryTree, addCategory, addSubcategory, deleteCategory } =
    useCategories(showNotification);

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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Header
        onNewProduct={handleOpenNew}
        onOpenConfig={() => setIsConfigOpen(true)}
      />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <Toolbar
          filter={filter}
          onFilterChange={setFilter}
          totalCount={filteredProducts.length}
        />
        <ProductTable
          products={filteredProducts}
          onEdit={handleEdit}
          onDelete={deleteProduct}
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
