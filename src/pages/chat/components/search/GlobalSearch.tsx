import React, { useEffect, useState } from "react";
import { Search, X, Filter, MessageSquare, Hash, Clock } from "lucide-react";
import { useSearch } from "../../hooks/useSearch";
import type {
  CommunicationSearchResult,
  GlobalSearchParams,
} from "../../types/search.type";

interface GlobalSearchProps {
  onResultClick: (message: CommunicationSearchResult) => void;
  onClose: () => void;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({
  onResultClick,
  onClose,
}) => {
  const { query, setQuery, results, filters, setFilters } = useSearch();
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as GlobalSearchParams["type"] | "all";
    setFilters({ ...filters, type: value === "all" ? undefined : value });
  };

  const handleDateChange =
    (field: "from" | "to") => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilters({ ...filters, [field]: e.target.value });
    };
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm flex items-start justify-center pt-20 z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white shadow-2xl rounded-2xl w-full max-w-[650px] overflow-hidden border border-zinc-200 flex flex-col max-h-[80vh]">
        {/* Header de Recherche */}
        <div className="p-4 border-b border-zinc-100 bg-white">
          <div className="flex items-center gap-3 bg-zinc-100 px-4 py-3 rounded-xl focus-within:ring-2 focus-within:ring-cyan-500/50 focus-within:bg-white border border-transparent focus-within:border-cyan-500 transition-all">
            <Search size={20} className="text-zinc-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un message, un fichier..."
              className="w-full bg-transparent outline-none text-[15px] text-zinc-800 placeholder:text-zinc-400"
              autoFocus
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-1.5 rounded-lg transition-colors ${showFilters ? "bg-cyan-500 text-white" : "text-zinc-400 hover:bg-zinc-200"}`}
            >
              <Filter size={18} />
            </button>
            <div className="h-6 w-[1px] bg-zinc-300 mx-1" />
            <div className="relative group">
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-zinc-200 rounded-lg text-zinc-400 transition-all hover:text-pink-500"
              >
                <X size={20} />
              </button>

              {/* Tooltip */}
              <div className="absolute -top-9 right-0 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200 pointer-events-none">
                <div className="relative bg-zinc-900 text-white text-[11px] px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
                  Fermer (ESC)
                  {/* Petite flèche */}
                  <div className="absolute -bottom-1 right-3 w-2 h-2 bg-zinc-900 rotate-45"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panneau des Filtres (Extensible) */}
        {showFilters && (
          <div className="p-4 bg-zinc-50 border-b border-zinc-100 animate-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-400 uppercase ml-1">
                  Type
                </label>
                <select
                  value={filters.type ?? "all"}
                  onChange={handleFilterChange}
                  className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-sm outline-none focus:border-cyan-500"
                >
                  <option value="all">Tout</option>
                  <option value="private">Privé</option>
                  <option value="group">Groupe</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-400 uppercase ml-1">
                  Du
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={filters.from ?? ""}
                    onChange={handleDateChange("from")}
                    className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-sm outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-400 uppercase ml-1">
                  Au
                </label>
                <input
                  type="date"
                  value={filters.to ?? ""}
                  onChange={handleDateChange("to")}
                  className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-sm outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Zone de Résultats */}
        <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
          {results.length > 0 ? (
            <div className="space-y-1">
              {results.map((result: CommunicationSearchResult) => (
                <div
                  key={result.id}
                  onClick={() => onResultClick(result)}
                  className="group p-3 hover:bg-zinc-50 rounded-xl cursor-pointer transition-all border border-transparent hover:border-zinc-200 flex items-start gap-3"
                >
                  {/* Avatar avec indicateur de type */}
                  <div className="relative flex-shrink-0">
                    {result.user?.photo ? (
                      <img
                        src={`${import.meta.env.VITE_API_URL}${result.user.photo}`}
                        className="w-10 h-10 rounded-full object-cover shadow-sm"
                        alt=""
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                        {result.user?.nom?.[0] || "?"}
                      </div>
                    )}
                    <div
                      className={`absolute -bottom-1 -right-1 p-1 rounded-full shadow-sm border-2 border-white ${result.group ? "bg-pink-500" : "bg-cyan-500"}`}
                    >
                      {result.group ? (
                        <Hash size={8} className="text-white" />
                      ) : (
                        <MessageSquare size={8} className="text-white" />
                      )}
                    </div>
                  </div>

                  {/* Contenu du résultat */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="text-sm font-bold text-zinc-800">
                        {result.user?.prenom} {result.user?.nom}
                      </span>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                        <Clock size={12} />
                        {new Date(result.createdAt).toLocaleDateString(
                          undefined,
                          { day: "numeric", month: "short" },
                        )}
                      </div>
                    </div>
                    <p className="text-[13px] text-zinc-600 line-clamp-2 leading-relaxed">
                      {result.content}
                    </p>

                    {result.group && (
                      <div className="mt-2 flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-md">
                          #{result.group.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : query.length >= 2 ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
              <Search size={40} className="mb-3 opacity-20" />
              <p className="text-sm">
                Aucun message ne correspond à votre recherche
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
              <MessageSquare size={40} className="mb-3 opacity-20" />
              <p className="text-sm font-medium">
                Saisissez au moins 2 caractères...
              </p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 border-t border-zinc-100 bg-zinc-50/50 flex justify-between items-center">
          <span className="text-[10px] text-zinc-400 font-medium">
            ASTUCE : Utilisez les filtres pour affiner par date.
          </span>
          <div className="flex items-center gap-1">
            <span className="text-[10px] bg-white border border-zinc-200 px-1.5 py-0.5 rounded text-zinc-400 shadow-sm font-mono">
              ESC
            </span>
            <span className="text-[10px] text-zinc-400">pour fermer</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;
