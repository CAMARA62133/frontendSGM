export type UserRole = "admin" | "user";

/**
 * 🔹 User
 * Interface représentant un utilisateur dans le système (React / Flutter).
 */
export interface User {
  id?: number; // Sequelize utilise souvent des entiers par défaut
  type: UserRole;
  isOnline?: boolean;
  // Identité
  nom: string;
  prenom: string;
  email: string;
  password?: string;
  telephone?: string;
  photo?: string;

  // Cœur du projet (Adaptation métier)
  secteur_activite: string;
  entreprise: string;

  // État du compte
  isActif?: boolean;
  doitChangerPassword?: boolean;

  // Localisation Internationale
  adresse?: string;
  pays: string;
  pays_code: string; // Ex: "GN", "FR"
  region: string;

  // Timestamps
  createdAt?: string | Date;
  updatedAt?: string | Date;
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
