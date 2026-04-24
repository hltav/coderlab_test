import { ChevronRight, Edit3, Trash2 } from "lucide-react";
import { IconButton } from "../../components/ui/IconButton";
import type { Product } from "../../types";

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
}

export function ProductTable({
  products,
  onEdit,
  onDelete,
}: ProductTableProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {["Produto", "Categorias", "Descrição", "Preço", "Ações"].map(
                (col, i) => (
                  <th
                    key={col}
                    className={`px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 ${
                      i === 3 ? "text-right" : i === 4 ? "text-center" : ""
                    }`}
                  >
                    {col}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.length > 0 ? (
              products.map((product) => {
                // Extrai os objetos Category da tabela pivot
                const cats = product.categories.map((pc) => pc.category);
                return (
                  <tr
                    key={product.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-800">
                        {product.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        {cats.map((c) => (
                          <div key={c.id} className="flex items-center gap-1.5">
                            {/* Pai */}
                            {c.parent && (
                              <>
                                <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600">
                                  {c.parent.name}
                                </span>
                                <ChevronRight
                                  size={14}
                                  className="text-slate-300"
                                />
                              </>
                            )}

                            {/* Filho */}
                            <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700">
                              {c.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p
                        className="text-sm text-slate-500 max-w-xs truncate"
                        title={product.description}
                      >
                        {product.description || "—"}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-mono font-bold text-slate-700">
                        R${" "}
                        {product.price.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <IconButton
                          onClick={() => onEdit(product)}
                          title="Editar"
                        >
                          <Edit3 size={18} />
                        </IconButton>
                        <IconButton
                          variant="danger"
                          onClick={() => onDelete(product.id)}
                          title="Remover"
                        >
                          <Trash2 size={18} />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-slate-400"
                >
                  Nenhum produto encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
