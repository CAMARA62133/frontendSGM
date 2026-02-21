import api from "../../api/axios.config";
import type {
  ApiResponse,
  ChangePasswordByEmail,
  ChangePasswordByUserId,
} from "../models/User";

/* -------------------------------------------------------------------------- */
/*                                  AUTHENTIFICATION                           */
/* -------------------------------------------------------------------------- */



/**
 * 📝 Créer un nouvel utilisateur
 * @param data FormData contenant tous les champs (y compris photo si besoin)
 */
export const register = (data: FormData) => {
  return api.post<ApiResponse>("/users/", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

/**
 * ✏️ Mettre à jour un utilisateur
 * @param id ID de l'utilisateur
 * @param data FormData contenant tous les champs à mettre à jour (y compris photo)
 */
export const updateUser = (id: string, data: FormData) => {
  return api.put<ApiResponse>(`/users/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};



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
  payload: ChangePasswordByEmail | ChangePasswordByUserId,
) => api.post("/users/change-password", payload);

/**
 * 👤 Récupérer l'utilisateur connecté
 */
export const getProfil = () => api.get<ApiResponse>("/auth/profil");


export const getAllUsers = () => api.get<ApiResponse>("/users");

export const getUserById = (id: string) => api.get<ApiResponse>(`/users/${id}`);



/**
 * 🔄 Activer / désactiver un utilisateur
 * @param id ID de l'utilisateur
 */
export const toggleUser = (id: string) =>
  api.patch<ApiResponse>(`/auth/toggle/${id}`);

/* -------------------------------------------------------------------------- */
/*                       IMPORTATION UTILISATEURS EXCEL/CSV                     */
/* -------------------------------------------------------------------------- */

/**
 * 📥 Importer plusieurs utilisateurs depuis un fichier Excel ou CSV
 * @param file Fichier à importer (xlsx ou csv)
 * @returns ApiResponse
 */
export const importUsers = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  return api.post<ApiResponse>("/users/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
