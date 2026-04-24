import React, { useEffect, useState } from "react";
import { CreateProductSchema } from "../../components/dtos/product.dto";
import type {
  CategoryTree,
  Product,
  ProductFormData,
  ProductFormErrors,
} from "../../types";

interface ProductFormProps {
  editingProduct: Product | null;
  categoryTree: CategoryTree;
  onSave: (data: ProductFormData) => Promise<boolean>;
  onClose: () => void;
}

export function ProductForm({
  editingProduct,
  categoryTree,
  onSave,
  onClose,
}: ProductFormProps) {
  const parentNames = Object.keys(categoryTree);

  const [selectedParent, setSelectedParent] = useState(parentNames[0] ?? "");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<ProductFormErrors>({});

  useEffect(() => {
    if (editingProduct) {
      // Extrai IDs da tabela pivot
      const ids = editingProduct.categories.map((pc) => pc.categoryId);
      setSelectedIds(ids);

      // Descobre a categoria pai do produto para pre-selecionar o select
      const childCat = editingProduct.categories[0]?.category;
      if (childCat?.parentId !== null && childCat?.parentId !== undefined) {
        const parent = Object.entries(categoryTree).find(([, subs]) =>
          subs.some((s) => s.id === childCat.parentId),
        );
        if (parent) setSelectedParent(parent[0]);
      } else if (childCat) {
        setSelectedParent(childCat.name);
      }
    } else {
      setSelectedIds([]);
      setSelectedParent(parentNames[0] ?? "");
    }
  }, [editingProduct]);

  const subcategories = categoryTree[selectedParent] ?? [];

  const toggleId = (id: number) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    const raw = {
      name: form.get("name") as string,
      description: (form.get("description") as string) || undefined,
      price: parseFloat(form.get("price") as string),
      categoryIds: selectedIds,
    };

    const result = CreateProductSchema.safeParse(raw);
    if (!result.success) {
      const fieldErrors: ProductFormErrors = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0] as keyof ProductFormData;
        if (field) {
          fieldErrors[field] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    const ok = await onSave({ id: editingProduct?.id, ...raw });
    setSubmitting(false);
    if (ok) onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <div>
        <label className="block text-sm font-semibold mb-1.5 text-slate-700">
          Nome do Produto
        </label>
        <input
          name="name"
          required
          defaultValue={editingProduct?.name}
          placeholder="Ex: Monitor UltraWide"
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
        />
        {errors.name && (
          <p className="text-red-500 text-xs mt-1">{errors.name}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1.5 text-slate-700">
          Categoria
        </label>
        <select
          aria-label="Categoria"
          value={selectedParent}
          onChange={(e) => {
            setSelectedParent(e.target.value);
            setSelectedIds([]);
          }}
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
        >
          {parentNames.length > 0 ? (
            parentNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))
          ) : (
            <option disabled>Crie uma categoria primeiro</option>
          )}
        </select>
      </div>

      {subcategories.length > 0 && (
        <div>
          <label className="block text-sm font-semibold mb-2 text-slate-700">
            Subcategorias
          </label>
          <div className="flex flex-wrap gap-2">
            {subcategories.map((sub) => (
              <button
                key={sub.id}
                type="button"
                onClick={() => toggleId(sub.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                  selectedIds.includes(sub.id)
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:border-indigo-400"
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>
          {errors.categoryIds && (
            <p className="text-red-500 text-xs mt-1">{errors.categoryIds}</p>
          )}
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold mb-1.5 text-slate-700">
          Preço (R$)
        </label>
        <input
          name="price"
          type="number"
          step="0.01"
          required
          defaultValue={editingProduct?.price}
          placeholder="0,00"
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
        />
        {errors.price && (
          <p className="text-red-500 text-xs mt-1">{errors.price}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1.5 text-slate-700">
          Descrição
        </label>
        <textarea
          name="description"
          rows={3}
          defaultValue={editingProduct?.description}
          placeholder="Detalhes técnicos..."
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
        />
      </div>

      <div className="pt-4 flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={parentNames.length === 0 || submitting}
          className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50"
        >
          {submitting ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
}
