// -------------------------
export interface UserSummary {
  id: number;
  nom: string;
  prenom: string;
  photo?: string;
}

export interface GroupSummary {
  id: number;
  name: string;
}

export interface CommunicationSearchResult {
  id: number;
  content: string;
  userId: number;
  recipientId?: number | null;
  groupId?: number | null;
  createdAt: string;
  updatedAt: string;
  user: UserSummary;
  group?: GroupSummary | null;
  pollId?: number | null;
  fileId?: number | null;
}

export interface GlobalSearchResponse {
  data: CommunicationSearchResult[];
  total: number;
  page: number;
  totalPages: number;
}
// -------------------------
// TYPES DE PARAMÈTRES DE RECHERCHE
// -------------------------
export interface GlobalSearchParams {
  q: string;                     // texte de recherche
  type?: "private" | "group";    // type de conversation
  from?: string;                 // filtrer par expéditeur
  to?: string;                   // filtrer par destinataire
  conversationId?: string;       // filtrer par conversation spécifique
  page?: number;                 // pagination : page
  limit?: number;                // pagination : nombre de résultats
}