// types/User.ts

/**
 * 🔹 Type
 * Définit les rôles possibles pour un utilisateur.
 */
export type Type = "admin" | "directeur" | "user";

/**
 * 🔹 User
 * Interface représentant un utilisateur dans le système.
 */
export interface User {
  id?: string; // ID unique généré par la base de données
  nom: string; // Nom de famille de l'utilisateur
  prenom: string; // Prénom de l'utilisateur
  email: string; // Email utilisé pour la connexion
  password?: string; // Mot de passe (optionnel côté frontend)
  telephone?: string; // Numéro de téléphone (optionnel)
  type: Type; // Rôle de l'utilisateur (admin, directeur, user)
  isActif?: boolean; // Indique si l'utilisateur est actif
  adresse?: string; // Adresse complète (optionnel)
  pays: string; // Pays de l'utilisateur (obligatoire côté modèle)
  region: string; // Région de l'utilisateur (obligatoire côté modèle)
  etablissement: string; // Établissement lié à l'utilisateur (obligatoire côté modèle)
  photo?: string; // URL ou chemin vers la photo de profil (optionnel)
  createdAt?: Date; // Date de création du compte
  updatedAt?: Date; // Date de dernière mise à jour
}

/**
 * 🔹 ApiResponse
 * Typage générique pour les réponses API concernant les utilisateurs.
 */
export interface ApiResponse {
  user?: User; // Utilisateur unique (ex: après login ou création)
  users?: User[]; // Liste des utilisateurs (ex: pour affichage d'une table)
  total?: number; // Nombre total d'utilisateurs (utile pour pagination)
  page?: number; // Page actuelle (utile pour pagination)
  pages?: number; // Nombre total de pages (utile pour pagination)
  message?: string; // Message optionnel renvoyé par le backend (succès/erreur)
  count?: number; // Nombre d'éléments importés ou affectés (optionnel)
}

/**
 * 🔹 ChangePasswordByEmail
 * Payload pour réinitialiser le mot de passe via email
 */
export interface ChangePasswordByEmail {
  email: string;
  newPassword?: string;
}

/**
 * 🔹 ChangePasswordByUserId
 * Payload pour réinitialiser le mot de passe via l'ID utilisateur
 */
export interface ChangePasswordByUserId {
  userId: string;
  newPassword: string;
}
