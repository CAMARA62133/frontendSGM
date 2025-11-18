import { useContext } from "react";
import { AuthContext } from "./AuthContext";

/**
 * 🔹 useAuth
 * Hook personnalisé pour accéder facilement au contexte d'authentification
 *
 * Fournit :
 * - user : l'utilisateur connecté (ou null)
 * - isLoading : état de chargement lors de la vérification de la session
 * - error : message d'erreur d'authentification
 * - login(email, password) : fonction pour se connecter
 * - logout() : fonction pour se déconnecter
 * - setUser : setter pour mettre à jour l'utilisateur
 *
 * Usage :
 * const { user, login, logout } = useAuth();
 */
export const useAuth = () => {
  return useContext(AuthContext);
};
