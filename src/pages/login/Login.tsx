import React, { useState } from "react";
import { useAuth } from "../../context/useAuth";
import AuthLayout from "./Auth";
import { Eye, EyeOff, LogIn, Mail, Lock, ArrowRight } from "lucide-react";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth(); // On récupère la fonction login du contexte

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Le AuthProvider va gérer lui-même l'affichage du Toast d'erreur
      await login(formData.email, formData.password);
    } catch  {

      console.error("Erreur attrapée par le composant Login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <AuthLayout title="Connexion">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1">
          <div className="relative group">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="email"
              name="email"
              placeholder="Adresse email"
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 outline-none text-sm transition-all"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Mot de passe"
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 outline-none text-sm transition-all"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-600 p-1"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <a
            href="/change-password"
            className="text-cyan-600 text-xs hover:underline"
          >
            Mot de passe oublié ?
          </a>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 text-white py-2.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-sm shadow-md disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Connexion...
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              Se connecter
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      {/* 🚩 On a supprimé le composant Toast ici car il est déjà présent dans AuthProvider */}
    </AuthLayout>
  );
}
