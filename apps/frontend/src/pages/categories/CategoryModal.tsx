import { Settings, Trash2, X } from "lucide-react";
import { useState } from "react";
import type { CategoryTree } from "../../types";

interface CategoryModalProps {
  isOpen: boolean;
  categoryTree: CategoryTree;
  onAddCategory: (name: string) => void;
  onAddSubcategory: (mainCat: string, subName: string) => void;
  onDeleteCategory: (cat: string) => void;
  onClose: () => void;
}

export function CategoryModal({
  isOpen,
  categoryTree,
  onAddCategory,
  onAddSubcategory,
  onDeleteCategory,
  onClose,
}: CategoryModalProps) {
  const [newCatName, setNewCatName] = useState("");
  const [subInputs, setSubInputs] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleAddCategory = () => {
    onAddCategory(newCatName);
    setNewCatName("");
  };

  const handleAddSub = (cat: string) => {
    onAddSubcategory(cat, subInputs[cat] ?? "");
    setSubInputs((prev) => ({ ...prev, [cat]: "" }));
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[80vh]">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Settings className="text-indigo-600" /> Configurar Categorias
          </h2>
          <button
            aria-label="close"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-8">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Nova Categoria Principal
            </label>
            <div className="flex gap-2">
              <input
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                placeholder="Ex: Brinquedos"
                className="flex-1 px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleAddCategory}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                Adicionar
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {Object.entries(categoryTree).map(([cat, subs]) => (
              <div key={cat} className="border border-slate-200 rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-slate-800 uppercase tracking-wide text-sm">
                    {cat}
                  </h3>
                  <button
                    aria-label="Delete"
                    onClick={() => onDeleteCategory(cat)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {subs.map((sub) => (
                    <span
                      key={sub.id}
                      className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md text-xs font-medium"
                    >
                      {sub.name} {/* ✅ string, não o objeto */}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={subInputs[cat] ?? ""}
                    placeholder="Nova subcategoria..."
                    onChange={(e) =>
                      setSubInputs((prev) => ({
                        ...prev,
                        [cat]: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => e.key === "Enter" && handleAddSub(cat)}
                    className="flex-1 text-sm px-3 py-1.5 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={() => handleAddSub(cat)}
                    className="text-indigo-600 text-sm font-bold hover:text-indigo-800"
                  >
                    + Add Sub
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
