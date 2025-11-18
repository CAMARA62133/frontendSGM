import api from "../../api/axios.config";
import type { ApiResponse, Communication } from "../models/Communication";
import type { Group } from "../models/Group";

type CommunicationParams = {
  channel?: string;
  groupId?: number;
  recipientId?: number;
  userId?: number;
};

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
    }
  );

  return response.data; // type: ApiResponse<Communication>
};

// 🔹 Création d'un groupe
export const createGroup = async (data: {
  name: string;
  userIds: number[];
}) => {
  const response = await api.post<ApiResponse<Group>>(
    "/communications/groups", // endpoint backend
    data,
    {
      headers: { "Content-Type": "application/json" },
    }
  );

  return response.data; // type ApiResponse<Group>
};

// 🔹 Récupérer tous les messages
export const getCommunication = async (params?: CommunicationParams) => {
  const response = await api.get<ApiResponse<Communication[]>>(
    "/communications",
    { params }
  );

  return response.data; // type: ApiResponse<Communication[]>
};

// 🔹 Récupérer tous les groupes d'un utilisateur
export const getUserGroups = async () => {
  const response = await api.get<ApiResponse<Group[]>>(
    "/communications/groups"
  );
  return response.data; // type ApiResponse<Group[]>
};

// 🔹 Supprimer un groupe
export const deleteGroup = async (groupId: number) => {
  const response = await api.delete(`/communications/groups/${groupId}`);
  return response.data;
};
