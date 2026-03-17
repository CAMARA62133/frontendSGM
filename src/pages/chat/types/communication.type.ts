// -------------------------
// TYPES

import type { FileData } from "./file.type";
import type { Poll } from "./poll.type";

// -------------------------
export interface Communication {
  id: number;
  content: string;
  channel?: string;
  userId: number;
  recipientId?: number | null;
  groupId?: number | null;
  fileId?: number | null;
  pollId?: number | null;
  isRead: boolean;
  isDeleted: boolean;
  isEdited: boolean;
  hiddenBy?: number[];
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    nom: string;
    prenom: string;
    photo?: string;
  };
  file?: FileData;
  poll?: Poll;
}

export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  photo?: string;
  secteur_activite?: string;
  entreprise: string;

}
export interface Group {
  id: number;
  name: string;
  isPrivate: boolean;
  creatorId: number;
  members?: {
    id: number;
    nom: string;
    prenom: string;
    photo?: string;
    role: string;
  }[];
  creator?: { id: number; nom: string; prenom: string; photo?: string };
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success?: boolean;
  data: T;
  message?: string;
}

export interface CountResponse {
  success: boolean;
  count: number;
}

export interface UnreadByConversationResponse {
  data: Record<string, number>;
}

export interface CommunicationParams {
  groupId?: number;
  recipientId?: number;
  page?: number;
  limit?: number;
}

// -------------------------
// TYPES IA
// -------------------------
export interface AIResponse {
  success: true;
  answer: string;
}

export interface AIResponseInput {
  success: true;
  suggestions: string[];
}

export interface AIParams {
  question: string;
}

export interface AIParamsInput {
  inputText: string;
}




export interface MessageMenuProps {
  message: Communication;
  isMe: boolean;
  isPinned: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onPin: () => void;
  onSelect: () => void;
  onClose: () => void;
}