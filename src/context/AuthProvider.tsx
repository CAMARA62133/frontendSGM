import {
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import * as userService from "../services/userService";
import { AuthContext } from "./AuthContext";
import Toast from "../components/ui/Toast";
import type { AxiosError } from "axios";
import type { User } from "../models/User";

interface AuthProviderProps {
  children: ReactNode;
}

const INACTIVITY_LIMIT = 15 * 60 * 1000;
const WARNING_BEFORE = 1 * 60 * 1000;

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "warning" | "info";
    duration: number;
  } | null>(null);

  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopTimers = useCallback(() => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
  }, []);

  const logout = useCallback(async () => {
    stopTimers();
    setToast(null);
    try {
      await userService.logout();
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      setUser(null);
      navigate("/login", { replace: true });
    }
  }, [navigate, stopTimers]);

  const resetInactivityTimer = useCallback(() => {
    stopTimers();
    if (user) {
      warningTimerRef.current = setTimeout(() => {
        setToast({
          message: "Session expirée bientôt. Rester connecté ?",
          type: "warning",
          duration: WARNING_BEFORE,
        });
      }, INACTIVITY_LIMIT - WARNING_BEFORE);

      inactivityTimerRef.current = setTimeout(() => {
        logout();
      }, INACTIVITY_LIMIT);
    }
  }, [user, logout, stopTimers]);

  const handleStayConnected = async () => {
    setToast(null);
    stopTimers();
    try {
      await userService.getProfil();
      resetInactivityTimer();
    } catch {
      logout();
    }
  };

  const resetRef = useRef(resetInactivityTimer);
  useEffect(() => {
    resetRef.current = resetInactivityTimer;
  }, [resetInactivityTimer]);

  useEffect(() => {
    if (!user) return;
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
    ];
    const handleActivity = () => {
      setToast((curr) => {
        if (!curr || curr.type !== "warning") resetRef.current();
        return curr;
      });
    };
    events.forEach((e) => window.addEventListener(e, handleActivity));
    resetRef.current();
    return () => {
      events.forEach((e) => window.removeEventListener(e, handleActivity));
      stopTimers();
    };
  }, [user, stopTimers]);

  const fetchUser = useCallback(async () => {
    try {
      const res = await userService.getProfil();
      const userData = res.data.user || res.data;
      if (userData && (userData as User).email) setUser(userData as User);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    setToast(null);

    try {
      const res = await userService.login({ email, password });

      // 🔹 Cas normal : utilisateur connecté
      if (res.data?.user) {
        setUser(res.data.user);
        const role = res.data.user.type.toLowerCase();
        navigate(
          role === "admin" || role === "directeur" ? "/admin" : "/vitrine",
          { replace: true },
        );

        setToast({
          message: "Connexion réussie !",
          type: "success",
          duration: 3000,
        });
      }
    } catch (err) {
      const axiosError = err as AxiosError<{
        message: string;
        userId?: string;
      }>;
      const status = axiosError.response?.status;
      let msg = "";

      if (status === 401 || status === 400) {
        msg =
          "Email ou mot de passe incorrect. Veuillez vérifier vos identifiants.";
      } else if (status === 403 && axiosError.response?.data?.userId) {
        // 🔹 L'utilisateur doit changer son mot de passe
        msg =
          axiosError.response.data.message ||
          "Vous devez changer votre mot de passe avant de continuer.";

        setToast({
          message: msg,
          type: "error",
          duration: 5000,
        });

        // 🔹 Redirection vers le formulaire de changement de mot de passe
        navigate(`/change-password?userId=${axiosError.response.data.userId}`, {
          replace: true,
        });

        return; // Stoppe le flux ici
      } else if (status === 500) {
        msg =
          "Notre service rencontre actuellement une difficulté technique. Veuillez réessayer dans quelques instants.";
      } else if (!navigator.onLine) {
        msg =
          "Il semble que vous soyez déconnecté. Vérifiez votre connexion internet.";
      } else {
        msg =
          axiosError.response?.data?.message ||
          "Une erreur inattendue est survenue.";
      }

      setError(msg);
      setToast({ message: msg, type: "error", duration: 5000 });

      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, error, login, logout, setUser }}
    >
      {children}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          position="top-center"
          showProgress={true}
          onClose={(isConfirm) => {
            if (toast.type === "warning" && isConfirm !== true) {
              logout();
            }
            setToast(null);
          }}
          onConfirm={handleStayConnected}
        />
      )}
    </AuthContext.Provider>
  );
};
