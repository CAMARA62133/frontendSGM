import React, { useState } from "react";
import { useAuth } from "../../context/useAuth";
import AuthLayout from "./Auth";

import { Eye, EyeOff, LogIn } from "lucide-react";
import type { AxiosError } from "axios";
import Toast from "../../components/ui/Toast";

/**
 * 🔹 Login
 * Composant pour la page de connexion des utilisateurs
 */
export default function Login() {
  // 🔹 État pour les champs du formulaire
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // 🔹 État pour afficher ou masquer le mot de passe
  const [showPassword, setShowPassword] = useState(false);

  // 🔹 État pour afficher les messages d'erreur
  const [toast, setToast] = useState<{ message: string; type: "error" } | null>(
    null
  );

  // 🔹 Récupération de la fonction login depuis le contexte Auth
  const { login } = useAuth();

  /**
   * 🔹 handleSubmit
   * Gestionnaire de soumission du formulaire
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setToast(null); // Réinitialisation du toast

    try {
      // Appel de la fonction login du contexte
      await login(formData.email, formData.password);
      // Succès → redirection automatique gérée par le contexte Auth
    } catch (err) {
      // Gestion des erreurs venant d'Axios ou autres
      const axiosError = err as AxiosError<{ message: string }>;
      const msg =
        axiosError?.response?.data?.message ||
        (err instanceof Error
          ? err.message
          : "Email ou mot de passe incorrect");
      setToast({ message: msg, type: "error" });
    }
  };

  /**
   * 🔹 handleChange
   * Met à jour l'état du formulaire en fonction de l'input
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <AuthLayout title="Connexion">
      {/* Formulaire de connexion avec design minimaliste */}
      <form className="space-y-5" onSubmit={handleSubmit}>
        {/* Champ Email avec label flottant */}
        <div className="relative">
          <input
            type="email"
            name="email"
            placeholder=" "
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-white rounded-lg border border-cyan-200 focus:outline-none focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 transition-all peer text-sm"
            required
          />
          <label className="absolute left-3  transition-all pointer-events-none peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:top-[-10px] peer-focus:text-xs peer-focus:text-cyan-600 peer-focus:bg-white peer-focus:px-1 bg-white px-1 top-[-10px] text-xs text-cyan-600">
            Email
          </label>
        </div>

        {/* Champ Mot de passe avec toggle visibilité et label flottant */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder=" "
            className="w-full px-4 py-2.5 bg-white rounded-lg border border-cyan-200 focus:outline-none focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 transition-all peer text-sm"
          />
          <label className="absolute left-3  transition-all pointer-events-none peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:top-[-10px] peer-focus:text-xs peer-focus:text-cyan-600 peer-focus:bg-white peer-focus:px-1 bg-white px-1 top-[-10px] text-xs text-cyan-600">
            Mot de passe
          </label>
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cyan-600 transition-colors"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Lien Mot de passe oublié */}
        <div className="flex justify-end pt-1">
          <a
            href="/change-password"
            className="text-cyan-600 text-xs hover:text-cyan-700 hover:underline transition-colors"
          >
            Mot de passe oublié ?
          </a>
        </div>

        {/* Bouton de connexion avec icône */}
        <button
          type="submit"
          className="w-full bg-cyan-500 text-white py-2.5 rounded-lg font-medium hover:bg-cyan-600 transition-all flex items-center justify-center gap-2 group text-sm"
        >
          <LogIn className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          Se connecter
        </button>
      </form>

      {/* Affichage du toast en cas d'erreur */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </AuthLayout>
  );
}
