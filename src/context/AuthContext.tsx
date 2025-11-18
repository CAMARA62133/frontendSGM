import { createContext } from "react";
import type { User } from "../models/User";

/**
 * 🔹 Type du contexte d'authentification
 * Décrit les données et fonctions disponibles dans le contexte
 */
export interface AuthContextType {
  /** Utilisateur connecté (null si non connecté) */
  user: User | null;

  /** Indique si une action de connexion/déconnexion est en cours */
  isLoading: boolean;

  /** Message d'erreur lié à l'authentification */
  error: string | null;

  /**
   * Fonction pour connecter un utilisateur
   * @param email - Email de l'utilisateur
   * @param password - Mot de passe de l'utilisateur
   */
  login: (email: string, password: string) => Promise<void>;

  /** Fonction pour déconnecter l'utilisateur */
  logout: () => Promise<void>;

  /** Setter pour modifier l'utilisateur dans le contexte */
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

/**
 * 🔹 Création du contexte d'authentification
 * Fournit des valeurs par défaut pour éviter les erreurs lors de l'utilisation
 */
export const AuthContext = createContext<AuthContextType>({
  user: null, // Pas d'utilisateur par défaut
  isLoading: false, // Pas de chargement par défaut
  error: null, // Pas d'erreur par défaut
  login: async () => {}, // Fonction login vide par défaut
  logout: async () => {}, // Fonction logout vide par défaut
  setUser: () => {}, // Setter vide par défaut
});
