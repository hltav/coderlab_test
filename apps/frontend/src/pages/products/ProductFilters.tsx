import { useEffect, useMemo, useState } from "react";
import type { Category } from "../../types";

export interface ProductFiltersState {
  name?: string;
  description?: string;
  categoryIds?: number[];
}

interface ProductFiltersProps {
  categories: Category[];
  value: ProductFiltersState;
  onChange: (filters: ProductFiltersState) => void;
  onClear: () => void;
}

export function ProductFilters({
  categories,
  value,
  onChange,
  onClear,
}: ProductFiltersProps) {
  const [name, setName] = useState(value.name ?? "");
  const [description, setDescription] = useState(value.description ?? "");
  const [selectedCategories, setSelectedCategories] = useState<number[]>(
    value.categoryIds ?? [],
  );

  // mantém sync com estado externo
  useEffect(() => {
    setName(value.name ?? "");
    setDescription(value.description ?? "");
    setSelectedCategories(value.categoryIds ?? []);
  }, [value]);

  const parentCategories = useMemo(
    () => categories.filter((c) => c.parentId === null),
    [categories],
  );

  const toggleCategory = (id: number) => {
    const childIds = categories
      .filter((c) => c.parentId === id)
      .map((c) => c.id);

    const idsToToggle = childIds.length > 0 ? childIds : [id];

    const alreadySelected = idsToToggle.some((i) =>
      selectedCategories.includes(i),
    );
    const updated = alreadySelected
      ? selectedCategories.filter((x) => !idsToToggle.includes(x))
      : [...selectedCategories, ...idsToToggle];

    setSelectedCategories(updated);

    onChange({
      name,
      description,
      categoryIds: updated.length > 0 ? updated : undefined,
    });
  };

  const handleNameChange = (v: string) => {
    setName(v);
    onChange({
      name: v || undefined,
      description,
      categoryIds: selectedCategories,
    });
  };

  const handleDescriptionChange = (v: string) => {
    setDescription(v);
    onChange({
      name,
      description: v || undefined,
      categoryIds: selectedCategories,
    });
  };

  const handleClear = () => {
    setName("");
    setDescription("");
    setSelectedCategories([]);
    onClear();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4">
      {/* Nome */}
      <div>
        <label className="text-xs font-semibold text-slate-600">
          Nome do produto
        </label>
        <input
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="Buscar por nome..."
          className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg bg-slate-50"
        />
      </div>

      {/* Descrição */}
      <div>
        <label className="text-xs font-semibold text-slate-600">
          Descrição
        </label>
        <input
          value={description}
          onChange={(e) => handleDescriptionChange(e.target.value)}
          placeholder="Buscar por descrição..."
          className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg bg-slate-50"
        />
      </div>

      {/* Categorias */}
      <div>
        <label className="text-xs font-semibold text-slate-600">
          Categorias
        </label>

        <div className="flex flex-wrap gap-2 mt-2">
          {parentCategories.map((cat) => {
            const childIds = categories
              .filter((c) => c.parentId === cat.id)
              .map((c) => c.id);
            const idsToCheck = childIds.length > 0 ? childIds : [cat.id];
            const isActive = idsToCheck.some((id) =>
              selectedCategories.includes(id),
            );

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition cursor-pointer ${
                  isActive
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:border-indigo-400"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Ações */}
      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={handleClear}
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          Limpar filtros
        </button>

        <span className="text-xs text-slate-400">
          {selectedCategories.length > 0 &&
            `${selectedCategories.length} categoria(s) selecionada(s)`}
        </span>
      </div>
    </div>
  );
}
