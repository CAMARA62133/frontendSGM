// // src/context/AuthProvider.tsx
// import { useState, useCallback, useEffect, type ReactNode } from "react";
// import { useNavigate } from "react-router-dom";
// import * as userService from "../services/userService";
// import { AuthContext } from "./AuthContext";
// import type { User } from "../models/User";
// import type { AxiosError } from "axios";

// interface AuthProviderProps {
//   children: ReactNode;
// }

// export const AuthProvider = ({ children }: AuthProviderProps) => {
//   const navigate = useNavigate();

//   const [user, setUser] = useState<User | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   // -------------------- Vérification initiale + rafraîchissement --------------------
//   const fetchUser = useCallback(async () => {
//     try {
//       const res = await userService.getCurrentUser(); // backend doit renvoyer { user }
//       if (res.data.user) setUser(res.data.user);
//       else setUser(null);
//     } catch {
//       setUser(null);
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchUser();
//     // Rafraîchir toutes les 4 minutes pour token 5 min d'inactivité
//     const interval = setInterval(fetchUser, 2 * 60 * 1000);
//     return () => clearInterval(interval);
//   }, [fetchUser]);

//   // -------------------- Redirection selon type --------------------
//   const redirectBasedOnType = useCallback(
//     (type: User["type"]) => {
//       const routes: Record<User["type"], string> = {
//         admin: "/admin",
//         directeur: "/admin",
//         user: "/messaging",
//       };
//       navigate(routes[type] || "/login", { replace: true });
//     },
//     [navigate]
//   );

//   // -------------------- Connexion --------------------
//   const login = async (email: string, password: string) => {
//     setIsLoading(true);
//     setError(null);

//     try {
//       const res = await userService.login({ email, password });
//       const loggedUser = res.data.user as User;

//       setUser(loggedUser);
//       redirectBasedOnType(loggedUser.type);
//     } catch (err) {
//       const axiosError = err as AxiosError<{ message: string }>;
//       setError(
//         axiosError?.response?.data.message || "Email ou mot de passe incorrect"
//       );
//       setUser(null);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // -------------------- Déconnexion --------------------
// const logout = async () => {
//   setIsLoading(true);
//   try {
//     await userService.logout();
//   } catch {
//     // on ignore volontairement l'erreur
//   }
//   setUser(null);
//   setIsLoading(false);
//   navigate("/login", { replace: true });
// };


//   return (
//     <AuthContext.Provider
//       value={{ user, isLoading, error, login, logout, setUser }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };






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
import type { User } from "../models/User";
import type { AxiosError } from "axios";
import Toast from "../components/ui/Toast";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "warning";
  } | null>(null);

  const userRef = useRef<User | null>(null);
  userRef.current = user;

  // -------------------- Déconnexion --------------------
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await userService.logout();
    } catch {
      //
    }
    setUser(null);
    setIsLoading(false);
    navigate("/login", { replace: true });
  }, [navigate]);

  // -------------------- Vérification initiale + rafraîchissement --------------------
  const fetchUser = useCallback(async () => {
    try {
      const res = await userService.getCurrentUser();
      if (res.data.user) setUser(res.data.user);
      else setUser(null);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

useEffect(() => {
  fetchUser();

  const warningTimer = setInterval(async () => {
    if (userRef.current) {
      // 1️⃣ Affiche le toast warning avant expiration
      setToast({
        message: "Votre session expire dans 1 minute !",
        type: "warning",
      });

      // 2️⃣ Timer pour déconnexion après 1 minute
      const logoutTimer = setTimeout(() => {
        logout();
      }, 60 * 1000); // 1 minute après le toast

      return () => clearTimeout(logoutTimer);
    }

    await fetchUser();
  }, 14* 60 * 1000); // vérifier toutes les 14 minutes (ou selon la durée du token)

  return () => clearInterval(warningTimer);
}, [fetchUser, logout]);


  // -------------------- Redirection selon type --------------------
  const redirectBasedOnType = useCallback(
    (type: User["type"]) => {
      const routes: Record<User["type"], string> = {
        admin: "/admin",
        directeur: "/admin",
        user: "/vitrine",
      };
      navigate(routes[type] || "/login", { replace: true });
    },
    [navigate]
  );

  // -------------------- Connexion --------------------
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await userService.login({ email, password });
      const loggedUser = res.data.user as User;
      setUser(loggedUser);
      redirectBasedOnType(loggedUser.type);
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      setError(
        axiosError?.response?.data.message || "Email ou mot de passe incorrect"
      );
      setUser(null);
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
          onClose={() => setToast(null)}
        />
      )}
    </AuthContext.Provider>
  );
};
