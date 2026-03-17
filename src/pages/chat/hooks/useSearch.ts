import { useState, useEffect, useCallback } from "react";
import { useDebounce } from "./useDebounce";
import { searchService } from "../services/searchService";
import type {
  CommunicationSearchResult,
  GlobalSearchParams,
  GlobalSearchResponse,
} from "../types/search.type";

export const useSearch = () => {
  // -------------------------
  // États
  // -------------------------
  const [query, setQuery] = useState<string>(""); // texte de recherche
  const [results, setResults] = useState<CommunicationSearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [filters, setFilters] = useState<GlobalSearchParams>({
    q: "", // texte vide au départ
    type: undefined, // undefined = tous les types
    from: "",
    to: "",
    page: 1,
    limit: 20,
  });

  const debouncedQuery = useDebounce(query, 500);

  // -------------------------
  // Fonction de recherche
  // -------------------------
  const performSearch = useCallback(async () => {
    if (debouncedQuery.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);

    try {
      // Construction des paramètres de recherche
      const params: GlobalSearchParams = {
        ...filters,
        q: debouncedQuery,
        type: filters.type, // n'envoie que si défini (private | group)
      };

      const data: GlobalSearchResponse =
        await searchService.globalSearch(params);
      setResults(data.data);
    } catch (error) {
      console.error("Erreur recherche:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, filters]);

  // -------------------------
  // Effet pour lancer la recherche
  // -------------------------
  useEffect(() => {
    performSearch();
  }, [performSearch]);

  // -------------------------
  // Retour du hook
  // -------------------------
  return {
    query,
    setQuery,
    results,
    loading,
    filters,
    setFilters,
    search: performSearch,
  };
};
