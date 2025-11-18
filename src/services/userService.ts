import api from "../../api/axios.config";
import type { ApiResponse, ChangePasswordByEmail, ChangePasswordByUserId, User } from "../models/User";

/* -------------------------------------------------------------------------- */
/*                                  AUTHENTIFICATION                           */
/* -------------------------------------------------------------------------- */

/**
 * 📝 Créer un nouvel utilisateur
 * @param data Données partielles de l'utilisateur
 */
export const register = (data: Partial<User>) =>
  api.post<ApiResponse>("/users/", data);

/**
 * 🔑 Connexion utilisateur
 * @param data { email, password }
 */
export const login = (data: { email: string; password: string }) =>
  api.post<ApiResponse>("/auth/login", data);

/**
 * 🚪 Déconnexion utilisateur
 */
export const logout = () => api.get<ApiResponse>("/auth/logout");

/**
 * 🔄 Réinitialiser le mot de passe
 * @param data { email, newPassword? }
 */
export const changePassword = async (
  payload: ChangePasswordByEmail | ChangePasswordByUserId
) => {
  return api.post("/users/change-password", payload);
};
/**
 * 👤 Récupérer l'utilisateur connecté
 */
export const getCurrentUser = () => api.get<ApiResponse>("/users/me");

/* -------------------------------------------------------------------------- */
/*                                   UTILISATEURS                              */
/* -------------------------------------------------------------------------- */

/**
 * 📋 Récupérer tous les utilisateurs
 */
export const getAllUsers = () => api.get<ApiResponse>("/users");

/**
 * 📌 Récupérer un utilisateur par ID
 * @param id ID de l'utilisateur
 */
export const getUserById = (id: string) => api.get<ApiResponse>(`/users/${id}`);

/**
 * ✏️ Mettre à jour un utilisateur
 * @param id ID de l'utilisateur
 * @param data Données à mettre à jour (partielles)
 */
export const updateUser = (id: string, data: Partial<User>) =>
  api.put<ApiResponse>(`/users/${id}`, data);

/**
 * 🔄 Activer / désactiver un utilisateur
 * @param id ID de l'utilisateur
 */
export const toggleUser = (id: string) =>
  api.patch<ApiResponse>(`/users/toggle/${id}`);

/* -------------------------------------------------------------------------- */
/*                       IMPORTATION UTILISATEURS EXCEL/CSV                     */
/* -------------------------------------------------------------------------- */

/**
 * 📥 Importer plusieurs utilisateurs depuis un fichier Excel ou CSV
 * @param file Fichier à importer (xlsx ou csv)
 * @returns ApiResponse avec le nombre d’utilisateurs importés et message de succès
 *
 * 💡 Fonctionne avec le backend configuré sur la route POST /users/import
 * 💡 Le fichier doit contenir les colonnes :
 *     type, nom, prenom, password, telephone, adresse, pays, region, etablissement
 */
export const importUsers = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  return api.post<ApiResponse>("/users/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
