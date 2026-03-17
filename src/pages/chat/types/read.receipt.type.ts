// -------------------------
export interface UserSummary {
  id: number;
  nom: string;
  prenom: string;
  photo?: string;
}

export interface ReadReceipt {
  id: number;
  messageId: number;
  userId: number;
  readAt: string;
  user: UserSummary;
}
