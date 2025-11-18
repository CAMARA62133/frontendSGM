import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "./Auth";
import type { AxiosError } from "axios";
import { Eye, EyeOff, ArrowLeft, Mail, Lock } from "lucide-react";
import Toast from "../../components/ui/Toast";
import { changePassword } from "../../services/userService";

type ChangePasswordPayload =
  | { userId: string; newPassword: string }
  | { email: string; newPassword?: string };

export default function ChangePassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const userIdFromUrl = query.get("userId") || undefined;

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<1 | 2>(userIdFromUrl ? 2 : 1);
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
        const payload: ChangePasswordPayload = { email };
        const response = await changePassword(payload);
        setToast({ message: response.data.message!, type: "success" });
        setStep(2);
      } else {
        const payload: ChangePasswordPayload = userIdFromUrl
          ? { userId: userIdFromUrl, newPassword }
          : { email, newPassword };

        const response = await changePassword(payload);
        setToast({ message: response.data.message!, type: "success" });

        setEmail("");
        setNewPassword("");
        if (!userIdFromUrl) setStep(1);

        setTimeout(() => {
          navigate("/login");
        }, 1500);
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
      title={
        step === 1
          ? "Réinitialisation du mot de passe"
          : userIdFromUrl
          ? "Définir un nouveau mot de passe"
          : "Nouveau mot de passe"
      }
    >
      {/* Bouton retour */}
      {!userIdFromUrl && step === 2 && (
        <button
          onClick={() => setStep(1)}
          className="flex items-center gap-2 text-cyan-600 hover:text-cyan-700 text-sm mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              placeholder="Votre email"
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-cyan-200 focus:outline-none focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 transition-all text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        )}

        {step === 2 && (
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Nouveau mot de passe"
              className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-cyan-200 focus:outline-none focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 transition-all text-sm"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
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
        )}

        <button
          type="submit"
          className={`w-full bg-cyan-500 text-white py-2.5 rounded-lg font-medium hover:bg-cyan-600 transition-all flex items-center justify-center gap-2 text-sm ${
            isLoading ? "opacity-70 cursor-not-allowed" : ""
          }`}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {step === 1 ? "Vérification..." : "Réinitialisation..."}
            </>
          ) : step === 1 ? (
            "Envoyer le lien de réinitialisation"
          ) : (
            "Changer le mot de passe"
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
        <div className="text-center mt-4 pt-4 border-t border-gray-100">
          <a
            href="/login"
            className="text-cyan-600 text-xs hover:text-cyan-700 hover:underline transition-colors"
          >
            Retour à la connexion
          </a>
        </div>
      )}
    </AuthLayout>
  );
}
