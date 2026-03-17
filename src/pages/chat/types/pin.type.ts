// -------------------------
// TYPES
// -------------------------
export interface UserSummary {
  id: number;
  nom: string;
  prenom: string;
  photo?: string;
}

export interface CommunicationSummary {
  id: number;
  content: string;
  userId: number;
  groupId?: number | null;
  recipientId?: number | null;
  fileId?: number | null;
  createdAt: string;
  updatedAt: string;
  user?: UserSummary;
}

export interface PinnedMessage {
  id: number;
  messageId: number;
  conversationId: string;
  pinnedBy: number;
  pinnedAt: string;
  message?: CommunicationSummary;
  pinner?: UserSummary;
}
