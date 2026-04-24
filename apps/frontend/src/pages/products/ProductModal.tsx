import { X } from "lucide-react";
import type { CategoryTree, Product, ProductFormData } from "../../types";
import { ProductForm } from "./ProductForm";

interface ProductModalProps {
  isOpen: boolean;
  editingProduct: Product | null;
  categoryTree: CategoryTree;
  onSave: (data: ProductFormData) => Promise<boolean>;
  onClose: () => void;
}

export function ProductModal({
  isOpen,
  editingProduct,
  categoryTree,
  onSave,
  onClose,
}: ProductModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-bold">
            {editingProduct ? "Editar Produto" : "Novo Produto"}
          </h2>
          <button
            aria-label="close"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X size={24} />
          </button>
        </div>
        <ProductForm
          editingProduct={editingProduct}
          categoryTree={categoryTree}
          onSave={onSave}
          onClose={onClose}
        />
      </div>
    </div>
  );
}
