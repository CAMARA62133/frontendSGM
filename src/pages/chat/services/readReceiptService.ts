
// -------------------------
// TYPES

import api from "../../../../api/axios.config";
import type { ReadReceipt } from "../types/read.receipt.type";



// -------------------------
// SERVICE
// -------------------------
export const readReceiptService = {
  // 🔹 Marquer un message comme lu
  async markAsRead(messageId: number): Promise<ReadReceipt[]> {
    const response = await api.post<{ success: boolean; data: ReadReceipt[] }>(
      `/read-receipts/${messageId}`,
    );
    return response.data.data;
  },

  // 🔹 Récupérer les accusés de lecture d’un message
  async getMessageReadReceipts(messageId: number): Promise<ReadReceipt[]> {
    const response = await api.get<{ success: boolean; data: ReadReceipt[] }>(
      `/read-receipts/${messageId}`,
    );
    return response.data.data;
  },
};
