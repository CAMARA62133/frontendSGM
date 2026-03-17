
// -------------------------
// TYPES

import api from "../../../../api/axios.config";
import type { CommunicationSearchResult, GlobalSearchParams, GlobalSearchResponse } from "../types/search.type";



// -------------------------
// SERVICE
// -------------------------
export const searchService = {
  /**
   * Recherche globale de messages
   */
  async globalSearch(
    params: GlobalSearchParams,
  ): Promise<GlobalSearchResponse> {
    const response = await api.get<{
      success: boolean;
      data: CommunicationSearchResult[];
      total: number;
      page: number;
      totalPages: number;
    }>("/search", { params });

    return response.data;
  },
};
