import React, { useState } from "react";
import { useAuth } from "../../context/useAuth";
import AuthLayout from "./Auth";
import { Eye, EyeOff, LogIn, Mail, Lock, ArrowRight } from "lucide-react";
import type { AxiosError } from "axios";
import Toast from "../../components/ui/Toast";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "error" } | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setToast(null);
    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      const msg =
        axiosError?.response?.data?.message ||
        (err instanceof Error
          ? err.message
          : "Email ou mot de passe incorrect");
      setToast({ message: msg, type: "error" });
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
        {/* Email Input */}
        <div className="space-y-1">
          <div className="relative group">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-colors group-focus-within:text-cyan-500" />
            <input
              type="email"
              name="email"
              placeholder="Adresse email"
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition-all duration-200 text-sm placeholder-gray-400 shadow-sm hover:shadow-md hover:border-cyan-200"
              required
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="space-y-1">
          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-colors group-focus-within:text-cyan-500" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Mot de passe"
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition-all duration-200 text-sm placeholder-gray-400 shadow-sm hover:shadow-md hover:border-cyan-200"
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
        </div>

        {/* Forgot Password Link */}
        <div className="flex justify-end pt-1">
          <a
            href="/change-password"
            className="text-cyan-600 text-xs hover:text-cyan-700 transition-colors px-2 py-1.5 rounded-lg hover:bg-cyan-50/50"
          >
            Mot de passe oublié ?
          </a>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 disabled:from-cyan-400 disabled:to-cyan-400 text-white py-2.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-sm shadow-md hover:shadow-lg disabled:shadow group"
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
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
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
    </AuthLayout>
  );
}
