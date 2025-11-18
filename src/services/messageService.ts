import api from "../../api/axios.config";
import {
  type ApiResponse,
  type Message,
  type MessagesResponse,
  type MessageResponse,
  type MessageFilters,
  type CountResponse,
  type ConversationResponse,
} from "../models/Message";

/**
 * ===============================================
 * 📧 ENVOI ET RÉCEPTION DES MESSAGES
 * ===============================================
 */

// 🔹 Envoyer un message avec éventuellement des pièces jointes
export const envoyerMessage = async (data: FormData) => {
  const response = await api.post<ApiResponse<Message>>("/messages", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// 🔹 Récupérer les messages 
export const getAllMessages = async (params?: MessageFilters) =>
  (await api.get<MessagesResponse>("/messages/", { params })).data;
// 🔹 Récupérer les messages selon différents états
export const getMessagesRecus = async (params?: MessageFilters) =>
  (await api.get<MessagesResponse>("/messages/recus", { params })).data;

export const getMessagesEnvoyes = async (params?: MessageFilters) =>
  (await api.get<MessagesResponse>("/messages/envoyes", { params })).data;


export const getBrouillons = async (params?: MessageFilters) =>
  (await api.get<MessagesResponse>("/messages/brouillons", { params })).data;

export const getFavoris = async (params?: MessageFilters) =>
  (await api.get<MessagesResponse>("/messages/favoris", { params })).data;

export const getMessagesArchives = async (params?: MessageFilters) =>
  (await api.get<MessagesResponse>("/messages/archives", { params })).data;

// 🔹 Récupérer un message spécifique par son ID
export const getMessageById = async (id: string) =>
  (await api.get<MessageResponse>(`/messages/${id}`)).data;

// 🔹 Récupérer toute une conversation
export const getConversation = async (threadId: string) =>
  (
    await api.get<ApiResponse<ConversationResponse>>(
      `/messages/conversation/${threadId}`
    )
  ).data;

/**
 * ===============================================
 * 🗂️ GESTION DES MESSAGES
 * ===============================================
 */
export const toggleArchiveMessage = async (id: string) =>
  (await api.put<ApiResponse<Message>>(`/messages/${id}/archive`)).data;

export const toggleFavori = async (id: string) =>
  (await api.put<ApiResponse<Message>>(`/messages/${id}/favori`)).data;

export const marquerCommeLu = async (id: string) =>
  (await api.put<ApiResponse>(`/messages/${id}/lu`)).data;

export const marquerTousLus = async () =>
  (await api.put<ApiResponse>("/messages/marquer-lus")).data;

/**
 * ===============================================
 * 🗑️ CORBEILLE
 * ===============================================
 */
export const getCorbeille = async (params?: MessageFilters) =>
  (await api.get<MessagesResponse>("/messages/corbeille", { params })).data;

export const supprimerMessage = async (id: string) =>
  (await api.put<ApiResponse>(`/messages/${id}/supprimer`)).data;

export const restaurerMessage = async (id: string) =>
  (await api.put<ApiResponse<Message>>(`/messages/${id}/restaurer`)).data;

export const supprimerDefinitivement = async (id: string) =>
  (await api.delete<ApiResponse>(`/messages/${id}`)).data;

export const viderCorbeille = async () =>
  (await api.delete<ApiResponse>("/messages/corbeille")).data;

/**
 * ===============================================
 * 📊 STATISTIQUES DES MESSAGES
 * ===============================================
 */
export const nombreMessagesNonLus = async () =>
  (await api.get<CountResponse>("/messages/count/unread")).data;

export const nombreBrouillons = async () =>
  (await api.get<CountResponse>("/messages/count/drafts")).data;

export const nombreMessagesArchives = async () =>
  (await api.get<CountResponse>("/messages/count/archived")).data;

export const nombreMessagesCorbeille = async () =>
  (await api.get<CountResponse>("/messages/count/trash")).data;

export const nombreMessagesFavoris = async () =>
  (await api.get<CountResponse>("/messages/count/favori")).data;

/**
 * ===============================================
 * 🔄 AUTO-REFRESH (POLLING)
 * ===============================================
 */

/**
 * Permet de mettre à jour automatiquement les données toutes les X secondes
 * Exemple :
 *    useEffect(() => {
 *      const stop = autoRefresh(() => refreshInbox(), 10000);
 *      return () => stop();
 *    }, []);
 */
export const autoRefresh = (
  callback: () => Promise<void>,
  intervalMs = 10000
) => {
  let isRunning = false;

  const run = async () => {
    if (isRunning) return; // empêche les appels concurrents
    isRunning = true;
    try {
      await callback();
    } catch (error) {
      console.error("Erreur auto-refresh:", error);
    } finally {
      isRunning = false;
    }
  };

  // Lancer la première fois immédiatement
  run();

  // Intervalle régulier
  const intervalId = setInterval(run, intervalMs);

  // Retourner fonction pour stopper
  return () => clearInterval(intervalId);
};
