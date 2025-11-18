// 📦 Importation de la librairie axios pour effectuer des requêtes HTTP
import axios from "axios";

/**
 * 🔹 Création d'une instance Axios personnalisée
 *
 * Cette instance est préconfigurée avec :
 * 1️⃣ baseURL : l'URL de base de votre API backend
 * 2️⃣ withCredentials : permet d'envoyer automatiquement les cookies (utile pour les JWT ou sessions)
 *
 * Avantages d'utiliser une instance :
 * - Évite de répéter l'URL de base dans toutes les requêtes
 * - Permet de configurer des headers ou interceptors globaux
 */
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  withCredentials: true,
});

/**
 * 💡 Exemple d'utilisation :
 *
 * import api from './api';
 *
 * // Récupérer la liste des utilisateurs
 * const fetchUsers = async () => {
 *   try {
 *     const response = await api.get('/users');
 *     console.log(response.data);
 *   } catch (error) {
 *     console.error(error);
 *   }
 * };
 */

export default api; // Export de l'instance pour être utilisée dans toute l'application
