import { Input } from "@components/ui/input";
import { Search, X } from "lucide-react";
import { useSearchStore } from "@stores/use-search-store";

function SearchInput() {
  const { searchTerm, setSearchTerm } = useSearchStore();

  return (
    <div className="relative flex-1 max-w-[500px]">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
      <Input
        type="text"
        placeholder="Rechercher par CIN, nom ou prénom..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full rounded-2xl bg-white/5 border-white/10 pl-10 pr-10 md:h-11 focus:ring-primary/20 transition-all font-medium"
      />
      {searchTerm && (
        <button 
          onClick={() => setSearchTerm("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-all"
        >
          <X className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}

export default SearchInput;
