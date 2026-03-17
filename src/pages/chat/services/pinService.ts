// -------------------------
// SERVICE PIN
// -------------------------
import api from "../../../../api/axios.config";
import type { PinnedMessage } from "../types/pin.type";

export const pinService = {
  // 🔹 Épingler un message
  async pinMessage(
    messageId: number,
    conversationId: string,
  ): Promise<PinnedMessage> {
    // Toujours envoyer conversationId en string
    const response = await api.post(`/pins/${messageId}`, { conversationId });
    return response.data.data;
  },

  // 🔹 Retirer un épingle
  async unpinMessage(
    messageId: number,
    conversationId: string,
  ): Promise<PinnedMessage> {
    // DELETE avec body (Axios supporte { data: { ... } })
    const response = await api.delete(`/pins/${messageId}`, {
      data: { conversationId },
    });
    return response.data.data;
  },

  // 🔹 Récupérer les messages épinglés d’une conversation
  async getPinnedMessages(conversationId: string): Promise<PinnedMessage[]> {
    const response = await api.get(`/pins/conversation/${conversationId}`);
    return response.data.data;
  },
};
