import api from "../../../../api/axios.config";
import type { UserStatsResponse } from "../types/stats.type";

// -------------------------
// SERVICE
// -------------------------
export const statsService = {
  /**
   * Récupérer les statistiques utilisateur
   * @param period "week" | "month" | "year"
   */
  async getUserStats(
    period: "week" | "month" | "year" = "week",
  ): Promise<UserStatsResponse> {
    const response = await api.get<{
      success: boolean;
      data: UserStatsResponse;
    }>("/stats", {
      params: { period },
    });
    return response.data.data;
  },
};
