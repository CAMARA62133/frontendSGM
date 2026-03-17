import api from "../../../../api/axios.config";
import type { AIParams, AIParamsInput, AIResponse, AIResponseInput, ApiResponse, Communication, CommunicationParams, CountResponse, Group, UnreadByConversationResponse, User } from "../types/communication.type";



// -------------------------
// SERVICE UNIQUE
// -------------------------
export const communicationService = {
  // -------------------------
  // MESSAGES
  // -------------------------
  send: async (data: {
    content: string;
    channel?: string;
    groupId?: number;
    recipientId?: number;
  }) => {
    const res = await api.post<ApiResponse<Communication>>(
      "/communications",
      data,
    );
    return res.data.data;
  },

  update: async (id: number, data: { content: string }) => {
    const res = await api.put<ApiResponse<Communication>>(
      `/communications/${id}`,
      data,
    );
    return res.data.data;
  },

  delete: async (id: number) => {
    const res = await api.delete<ApiResponse<void>>(`/communications/${id}`);
    return res.data.data;
  },

  getAll: async (params?: CommunicationParams) => {
    const res = await api.get<ApiResponse<Communication[]>>("/communications", {
      params,
    });
    return res.data.data;
  },

  // -------------------------
  // GROUPES
  // -------------------------
  createGroup: async (data: { name: string; userIds: number[] }) => {
    const res = await api.post<ApiResponse<Group>>(
      "/communications/groups",
      data,
    );
    return res.data.data;
  },

  updateGroup: async (
    groupId: number,
    data: { name?: string; userIds: number[] },
  ) => {
    const res = await api.put<ApiResponse<Group>>(
      `/communications/groups/${groupId}`,
      data,
    );
    return res.data.data;
  },

  deleteGroup: async (groupId: number) => {
    const res = await api.delete<ApiResponse<void>>(
      `/communications/groups/${groupId}`,
    );
    return res.data.data;
  },

  getUserGroups: async () => {
    const res = await api.get<ApiResponse<Group[]>>("/communications/groups");
    return res.data.data;
  },

  // -------------------------
  // NOTIFICATIONS
  // -------------------------
  getUnreadCount: async () => {
    const res = await api.get<CountResponse>("/communications/unread-count");
    return res.data;
  },

  getUnreadByConversation: async () => {
    const res = await api.get<UnreadByConversationResponse>(
      "/communications/unread-by-conversation",
    );
    return res.data;
  },

  // -------------------------
  // COLLÈGUES / ANNUAIRE
  // -------------------------
  // -------------------------
  // COLLÈGUES / ANNUAIRE
  // -------------------------
  getMesCollegues: async () => {
    const res = await api.get<{ users: User[] }>(
      "/communications/mes-collegues",
    );
    return res.data.users;
  },

  // -------------------------
  // IA
  // -------------------------
  askAI: async (data: AIParams) => {
    const res = await api.post<AIResponse>("/ask-ai", data, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data;
  },

  askAIInput: async (data: AIParamsInput) => {
    const res = await api.post<AIResponseInput>("/ask-ai/ask-ai-input", data, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data;
  },
};
