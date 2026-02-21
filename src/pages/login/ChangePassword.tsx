import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "./Auth";
import type { AxiosError } from "axios";
import { Eye, EyeOff, ArrowLeft, Mail, Lock, Shield } from "lucide-react";
import Toast from "../../components/ui/Toast";
import { changePassword } from "../../services/userService";

export default function ChangePassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const userIdFromUrl = query.get("userId") || undefined;

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<1 | 2>(userIdFromUrl ? 2 : 1);
  const [userId, setUserId] = useState<string | null>(userIdFromUrl || null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setToast(null);
    setIsLoading(true);

    try {
      if (step === 1) {
        // Étape 1 : Vérifier l'email
        const response = await changePassword({ email });
        setToast({ message: response.data.message, type: "success" });
        setUserId(response.data.userId); // récupère l'ID pour étape 2
        setStep(2);
      } else {
        // Étape 2 : Modifier le mot de passe
        if (!userId)
          throw new Error(
            "ID utilisateur manquant pour modifier le mot de passe",
          );

        const response = await changePassword({ userId, newPassword });
        setToast({ message: response.data.message, type: "success" });

        setEmail("");
        setNewPassword("");
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      setToast({
        message:
          error.response?.data?.message || "Erreur lors de la réinitialisation",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title={step === 1 ? "Réinitialisation" : "Nouveau mot de passe"}
    >
      {/* Back Button */}
      {step === 2 && !userIdFromUrl && (
        <button
          onClick={() => setStep(1)}
          className="flex items-center gap-2 text-cyan-600 hover:text-cyan-700 text-sm mb-4 px-2 py-1.5 rounded-lg transition-all hover:bg-cyan-50/50 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          Retour
        </button>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="space-y-1">
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-colors group-focus-within:text-cyan-500" />
              <input
                type="email"
                placeholder="Adresse email"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition-all duration-200 text-sm placeholder-gray-400 shadow-sm hover:shadow-md hover:border-cyan-200"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <p className="text-xs text-gray-500 px-1">
              Vérification de l'adresse email...
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-1">
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-colors group-focus-within:text-cyan-500" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Nouveau mot de passe"
                className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition-all duration-200 text-sm placeholder-gray-400 shadow-sm hover:shadow-md hover:border-cyan-200"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-600 transition-colors p-1 rounded-lg hover:bg-cyan-50/50"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 px-1">
              Choisissez un mot de passe sécurisé
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 disabled:from-cyan-400 disabled:to-cyan-400 text-white py-2.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-sm shadow-md hover:shadow-lg disabled:shadow mt-1"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {step === 1 ? "Envoi..." : "Modification..."}
            </>
          ) : (
            <>
              <Shield className="w-4 h-4" />
              {step === 1 ? "Envoyer le lien" : "Modifier"}
            </>
          )}
        </button>
      </form>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {!userIdFromUrl && (
        <div className="text-center mt-5 pt-4 border-t border-gray-100/80">
          <a
            href="/login"
            className="text-cyan-600 text-xs hover:text-cyan-700 transition-colors inline-flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-cyan-50/50"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Retour à la connexion
          </a>
        </div>
      )}
    </AuthLayout>
  );
}
