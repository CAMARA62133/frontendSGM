import type { User } from "./User";
import type { Group } from "./Group"; // si tu veux inclure info groupe

export interface Communication {
  id: number; // identifiant unique
  content: string; // contenu du message
  user: User; // auteur du message
  recipientId?: number; // id du destinataire pour chat privé
  recipient?: User; // objet User du destinataire (optionnel)
  groupId?: number; // id du groupe pour chat de groupe
  group?: Group; // objet Group si message de groupe (optionnel)
  createdAt?: string; // date de création du message
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T; // toujours défini, pas optionnel
}

export interface CommunicationsResponse {
  success: boolean;
  data: Communication[];
}
