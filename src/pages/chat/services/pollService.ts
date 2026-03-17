
// -------------------------
// TYPES

import api from "../../../../api/axios.config";
import type { Poll } from "../types/poll.type";



// -------------------------
// SERVICE
// -------------------------
export const pollService = {
  // 🔹 Créer un sondage
  async createPoll(data: {
    question: string;
    options: string[];
    groupId: number;
    expiresIn: number; // en heures
  }) {
    const response = await api.post<Poll>("/polls", data, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  },

  // 🔹 Voter pour une option
  async votePoll(pollId: number, optionId: number) {
    const response = await api.post<Poll>(`/polls/${pollId}/vote`, {
      optionId,
    });
    return response.data;
  },

  // 🔹 Récupérer les résultats d’un sondage
  async getPollResults(pollId: number) {
    const response = await api.get<Poll>(`/polls/${pollId}`);
    return response.data;
  },
};
