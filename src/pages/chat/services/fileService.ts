
// -------------------------
// TYPES

import api from "../../../../api/axios.config";
import type { FileData, GetFilesResponse, UploadFileResponse } from "../types/file.type";


// -------------------------
// SERVICE
// -------------------------
export const fileService = {
  // 🔹 Upload d’un fichier
  async uploadFile(
    file: File,
    conversationId: string,
    type: "private" | "group",
  ): Promise<UploadFileResponse> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("conversationId", conversationId);
    formData.append("type", type);

    const response = await api.post<UploadFileResponse>(
      "/files/upload",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },

  // 🔹 Récupérer les fichiers d’une conversation
  async getConversationFiles(conversationId: string): Promise<FileData[]> {
    const response = await api.get<GetFilesResponse>(
      `/files/conversation/${conversationId}`,
    );
    return response.data.data;
  },

  // 🔹 Télécharger un fichier (ouvre dans un nouvel onglet)
  async downloadFile(fileId: number) {
    window.open(`${api.defaults.baseURL}/files/download/${fileId}`);
  },
};
