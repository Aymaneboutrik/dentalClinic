import { Input } from "@components/ui/input";
import { Search, X } from "lucide-react";
import { useSearchStore } from "@stores/use-search-store";
import { useTranslation } from "react-i18next";

function SearchInput() {
  const { searchTerm, setSearchTerm } = useSearchStore();
  const { t } = useTranslation();

  return (
    <div className="relative flex-1 max-w-[500px] group ml-2">
      <div className="absolute left-5 top-1/2 -translate-y-1/2 z-10 transition-transform duration-300 group-focus-within:scale-110">
        <Search className="h-4 w-4 text-slate-500 transition-colors duration-300 group-focus-within:text-blue-400" />
      </div>
      <Input
        type="text"
        placeholder={t("search.placeholder")}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full organic-pill bg-white/5 border-white/10 !pl-14 pr-12 h-11 md:h-12 focus:bg-white/[0.08] focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 font-bold text-sm text-white placeholder:text-slate-500 shadow-2xl backdrop-blur-md"
      />
      {searchTerm && (
        <button 
          onClick={() => setSearchTerm("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/10 organic-pill transition-all duration-300 group-hover:opacity-100"
          title="Clear search"
        >
          <X className="h-3.5 w-3.5 text-slate-400 hover:text-white" />
        </button>
      )}
      <div className="absolute inset-0 organic-pill -z-10 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 opacity-0 group-focus-within:opacity-10 blur-xl transition-opacity duration-500" />
    </div>
  );
}

export default SearchInput;
