import api from "../../api/axios.config";
import type { ApiResponse, Communication, CommunicationParams, CountResponse, UnreadByConversationResponse } from "../models/Communication";
import type { Group } from "../models/Group";


// 🔹 Envoyer un message
export const sendCommunication = async (data: {
  content: string;
  channel?: string;
  groupId?: number;
  recipientId?: number;
}) => {
  const response = await api.post<ApiResponse<Communication>>(
    "/communications",
    data,
    {
      headers: { "Content-Type": "application/json" },
    },
  );

  return response.data;
};

// 🔹 Création d'un groupe
export const createGroup = async (data: {
  name: string;
  userIds: number[];
}) => {
  const response = await api.post<ApiResponse<Group>>(
    "/communications/groups",
    data,
    {
      headers: { "Content-Type": "application/json" },
    },
  );

  return response.data;
};

// 🔄 Mettre à jour les membres et le nom du groupe
export const updateGroup = async (
  groupId: number,
  data: {
    name?: string;     // Ajouté car ton backend traite maintenant le nom
    userIds: number[]; // Liste complète des IDs (nouveaux + anciens à garder)
  },
) => {
  const response = await api.put<ApiResponse<Group>>(
    `/communications/groups/${groupId}`,
    data,
    {
      headers: { "Content-Type": "application/json" },
    },
  );

  return response.data; // Retourne l'objet { data: updatedGroup }
};

// 🔹 Récupérer tous les messages
export const getCommunication = async (params?: CommunicationParams) => {
  const response = await api.get<ApiResponse<Communication[]>>(
    "/communications",
    { params },
  );

  return response.data;
};

// 🔹 Récupérer tous les groupes d'un utilisateur
export const getUserGroups = async () => {
  const response = await api.get<ApiResponse<Group[]>>(
    "/communications/groups",
  );
  return response.data;
};


export const getUnreadCounts = async () => {
  const response = await api.get<CountResponse>("/communications/unread-count");
  return response.data;
};

// 🔥 NOUVEAU
export const getUnreadByConversation = async () => {
  const response = await api.get<UnreadByConversationResponse>(
    "/communications/unread-by-conversation",
  );
  return response.data;
};

// 🔹 Supprimer un groupe
export const deleteGroup = async (groupId: number) => {
  const response = await api.delete(`/communications/groups/${groupId}`);
  return response.data;
};
