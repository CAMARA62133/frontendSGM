// types/message.ts
import type { User } from "./User";

/**
 * 🔹 PieceJointe
 * Représente une pièce jointe d’un message.
 */
export interface PieceJointe {
  nom: string; // Nom du fichier
  chemin: string; // Chemin ou URL pour accéder au fichier
  typeMime: string; // Type MIME du fichier (ex: 'image/png', 'application/pdf')
  taille: number; // Taille du fichier en octets
}

/**
 * 🔹 Message
 * Représente un message ou une réponse dans le système de messagerie.
 */
export interface Message {
  id: string; // Identifiant unique du message
  sujet: string; // Sujet du message
  contenu: string; // Contenu principal du message
  expediteur: User | null; // Expéditeur, peut être null si supprimé
  destinataires: User[]; // Liste des destinataires, peut être vide
  threadId?: string; // ID du fil de discussion (facultatif)
  piecesJointes?: PieceJointe[]; // Pièces jointes (facultatif)
  estBrouillon: boolean; // Indique si le message est un brouillon
  estLu: boolean; // Indique si le message a été lu
  estFavori: boolean; // Indique si le message est marqué comme favori
  estArchive: boolean; // Indique si le message est archivé
  estSupprime: boolean; // Indique si le message est supprimé
  dateEnvoi: string; // Date d’envoi (ISO string)
  dateEnvoiFormatted: string; // <- nouveau
  dateSuppression?: string; // Date de suppression (facultatif)
  createdAt: string; // Date de création du message
  updatedAt: string; // Date de dernière mise à jour
}

/**
 * 🔹 MessageFormData
 * Typage pour les données envoyées via un formulaire de création ou modification de message.
 */
export interface MessageFormData {
  sujet: string; // Sujet du message
  contenu: string; // Contenu du message
  destinataires: string[]; // IDs des destinataires
  estBrouillon?: boolean; // Indique si le message est un brouillon
  threadId?: string; // ID du fil de discussion pour réponse (facultatif)
}

/**
 * 🔹 ApiResponse
 * Typage générique pour toutes les réponses d’API.
 */
export interface ApiResponse<T = unknown> {
  success: boolean; // Succès ou échec de la requête
  message: string; // Message d’information ou d’erreur
  data?: T; // Données renvoyées (optionnel)
  pagination?: Pagination; // Pagination si applicable
}

/**
 * 🔹 Pagination
 * Informations sur la pagination.
 */
export interface Pagination {
  page: number; // Page actuelle
  pages: number; // Nombre total de pages
  total: number; // Nombre total d’éléments
}

/**
 * 🔹 Réponses spécifiques de l’API
 */
export interface MessagesResponse {
  success: boolean;
  data: Message[];
  pagination?: Pagination;
}

export interface MessageResponse {
  success: boolean;
  data: Message;
}

export interface CountResponse {
  success: boolean;
  count: number;
}

/**
 * 🔹 Filtres côté frontend
 * Pour récupérer des messages selon dossier, page, limite, etc.
 */
export interface MessageFilters {
  page?: number; // Page actuelle (optionnel)
  limit?: number; // Nombre d’éléments par page (optionnel)
  archive?: boolean; // Filtrer les messages archivés (optionnel)
  dossier?: // Filtrer par dossier
  "recus" | "envoyes" | "brouillons" | "archives" | "favoris" | "corbeille";
}

/**
 * 🔹 ConversationResponse
 * Typage pour la réponse de backend avec conversation complète.
 */
export interface ConversationResponse {
  mainMessage: Message; // Message principal du fil
  reponses: Message[]; // Réponses directes
  conversation: Message[]; // Fil complet
}

/**
 * 🔹 BackendMessage
 * Typage brut d’un message côté backend, utile pour transformations.
 */
export interface BackendMessage {
  idEntree: string;
  idMessage: string;
  contenu: {
    expediteur: User;
    destinataires: User[];
    sujet: string;
    corps: string;
    piecesJointes: PieceJointe[];
    createdAt: string;
  };
  statutBoite: {
    estLu: boolean;
    estFavori: boolean;
    estArchive: boolean;
    estSupprime: boolean;
  };
}

/**
 * 🔹 ErrorResponse
 * Typage pour les erreurs renvoyées par le backend
 */
export interface ErrorResponse {
  message: string;
  emailsInvalides?: string[]; // Liste d’emails invalides si applicable
}
