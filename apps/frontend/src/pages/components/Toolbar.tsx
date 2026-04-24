import { Search } from "lucide-react";

interface ToolbarProps {
  filter: string;
  onFilterChange: (value: string) => void;
  totalCount: number;
}

export function Toolbar({ filter, onFilterChange, totalCount }: ToolbarProps) {
  return (
    <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
      <div className="relative w-full md:w-96">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          size={18}
        />
        <input
          type="text"
          placeholder="Pesquisar por nome ou categoria..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          value={filter}
          onChange={(e) => onFilterChange(e.target.value)}
        />
      </div>
      <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 shadow-sm">
        Produtos em Estoque:{" "}
        <span className="text-indigo-600 font-bold">{totalCount}</span>
      </div>
    </div>
  );
}
