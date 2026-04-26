import React, { useEffect, useState } from "react";
import { CreateProductSchema } from "../../components/dtos/product.dto";
import { IconButton } from "../../components/ui/IconButton";
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
  const parentIds = Object.keys(categoryTree).map(Number);

  const [selectedParentId, setSelectedParentId] = useState<number>(
    parentIds[0] ?? 0,
  );
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [priceDisplay, setPriceDisplay] = useState(
    editingProduct ? editingProduct.price.toFixed(2).replace(".", ",") : "",
  );
  const [priceValue, setPriceValue] = useState(editingProduct?.price ?? 0);

  useEffect(() => {
    if (editingProduct) {
      const ids = editingProduct.categories.map((pc) => pc.categoryId);
      setSelectedIds(ids);

      const parentEntry = Object.entries(categoryTree).find(([, subs]) =>
        subs.some((s) => ids.includes(s.id)),
      );
      setSelectedParentId(Number(parentEntry?.[0]) || parentIds[0] || 0);
    } else {
      setSelectedIds([]);
      setSelectedParentId(parentIds[0] ?? 0);
    }
  }, [editingProduct]);

  const subcategories = categoryTree[selectedParentId] ?? [];

  const toggleId = (id: number) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "");
    const numeric = parseFloat(digits) / 100;
    setPriceValue(isNaN(numeric) ? 0 : numeric);
    setPriceDisplay(
      digits
        ? (parseFloat(digits) / 100).toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          })
        : "",
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    const raw = {
      name: form.get("name") as string,
      description: (form.get("description") as string) || undefined,
      price: priceValue,
      stock: parseInt(form.get("stock") as string) || 0,
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
          value={selectedParentId}
          onChange={(e) => {
            setSelectedParentId(Number(e.target.value));
            setSelectedIds([]);
          }}
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
        >
          {parentIds.length > 0 ? (
            parentIds.map((id) => {
              const children = categoryTree[id];
              const parentName = children?.[0]?.parent?.name;

              return (
                <option key={id} value={id}>
                  {parentName}
                </option>
              );
            })
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
          <div className="flex flex-wrap gap-2 cursor-pointer">
            {subcategories.map((sub) => (
              <IconButton
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
              </IconButton>
            ))}
          </div>
          {errors.categoryIds && (
            <p className="text-red-500 text-xs mt-1">{errors.categoryIds}</p>
          )}
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold mb-1.5 text-slate-700">
          Preço
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 font-medium text-sm pointer-events-none">
            R$
          </span>
          <input
            name="price"
            inputMode="numeric"
            value={priceDisplay}
            onChange={handlePriceChange}
            placeholder="0,00"
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>
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
      <div>
        <label className="block text-sm font-semibold mb-1.5 text-slate-700">
          Estoque
        </label>
        <input
          name="stock"
          type="number"
          min={0}
          defaultValue={editingProduct?.stock ?? 0}
          placeholder="0"
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
        />
      </div>

      <div className="pt-4 flex gap-3">
        <IconButton
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50"
        >
          Cancelar
        </IconButton>
        <IconButton
          type="submit"
          disabled={parentIds.length === 0 || submitting}
          className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
        >
          {submitting ? "Salvando..." : "Salvar"}
        </IconButton>
      </div>
    </form>
  );
}
