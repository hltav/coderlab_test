import { Package, Plus, Settings } from "lucide-react";
import { IconButton } from "../../components/ui/IconButton";

interface HeaderProps {
  onNewProduct: () => void;
  onOpenConfig: () => void;
}

export function Header({ onNewProduct, onOpenConfig }: HeaderProps) {
  return (
    <header className="bg-white border-b sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Package className="text-white w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">
            Mercatto <span className="text-indigo-600">Pro</span>
          </h1>
        </div>
        <div className="flex gap-2">
          <IconButton
            onClick={onOpenConfig}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 cursor-pointer"
            title="Gerir Categorias"
          >
            <Settings size={20} />
          </IconButton>
          <IconButton
            onClick={onNewProduct}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 shadow-sm cursor-pointer "
          >
            <Plus size={18} /> Novo Produto
          </IconButton>
        </div>
      </div>
    </header>
  );
}
