import api from "../../../../api/axios.config";
import type { DNDSettingsData, DNDSettingsResponse } from "../types/dnd.type";

// 🔹 Mettre à jour les paramètres DND (globaux ou par conversation)
const updateDNDSettings = async (
  conversationId: string | null,
  data: DNDSettingsData,
): Promise<DNDSettingsResponse | undefined> => {
  const response = await api.post<{
    success: boolean;
    data?: DNDSettingsResponse;
  }>(
    "/dnd/settings",
    {
      conversationId,
      ...data,
    },
    {
      headers: { "Content-Type": "application/json" },
    },
  );

  return response.data.data; // renvoie directement DNDSettingsResponse
};

// 🔹 Récupérer les paramètres DND
const getDNDSettings = async (
  conversationId: string | null,
): Promise<DNDSettingsResponse> => {
  const id = conversationId ?? "global";
  const response = await api.get<{ data: DNDSettingsResponse }>(
    `/dnd/settings/${id}`,
  );
  return response.data.data;
};

// ✅ Exporter les fonctions sous un objet dndService
export const dndService = {
  updateDNDSettings,
  getDNDSettings,
};
