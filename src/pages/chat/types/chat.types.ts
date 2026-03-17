// import type { Communication } from "../../../models/Communication";
// import type { User } from "../../../models/User";

// export type UserWithStatus = User & { isOnline: boolean };

// export interface PinnedMessage {
//   id: number;
//   messageId: number;
//   conversationId: string;
//   pinnedBy: number;
//   pinnedAt: string;
//   message: {
//     id: number;
//     content: string;
//     createdAt: string;
//     user: {
//       id: number;
//       nom: string;
//       prenom: string;
//       photo?: string;
//     };
//   };
//   pinner: {
//     id: number;
//     nom: string;
//     prenom: string;
//   };
// }

// export interface FileItem {
//   id: number;
//   filename: string;
//   size: number;
//   mimetype: string;
//   createdAt: string;
//   uploader: { nom: string; prenom: string };
// }

// export interface Poll {
//   id: number;
//   question: string;
//   options: PollOption[];
//   expiresAt: string;
//   createdBy: number;
// }

// export interface PollOption {
//   id: number;
//   text: string;
//   votes: number;
// }

// export interface DNDSettings {
//   enabled: boolean;
//   schedule?: string;
//   keywords?: string[];
//   autoReply?: string;
// }

// export interface ReadReceipt {
//   userId: number;
//   readAt: string;
//   user: {
//     id: number;
//     nom: string;
//     prenom: string;
//     photo?: string;
//   };
// }



// export interface SearchFilters {
//   type: "all" | "private" | "group";
//   from: string;
//   to: string;
// }




// // Dans types/chat.types.ts, ajoutez :

// // Types pour les paramètres de recherche
// export interface SearchParams {
//   q: string;
//   type?: "all" | "private" | "group";
//   from?: string;
//   to?: string;
//   page?: number;
//   limit?: number;
// }

// // Type pour les résultats de recherche
// export interface SearchResultItem {
//   id: number;
//   content: string;
//   createdAt: string;
//   userId: number;
//   groupId?: number;
//   recipientId?: number;
//   user?: {
//     id: number;
//     nom: string;
//     prenom: string;
//     photo?: string;
//   };
//   group?: {
//     id: number;
//     name: string;
//   };
// }

// export interface SearchResponse {
//   data: SearchResultItem[];
//   total: number;
//   page: number;
//   totalPages: number;
// }