// src/context/ProtectedRoute.tsx
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./useAuth";

interface ProtectedRouteProps {
  children: ReactNode;
  types?: Array<"admin" | "directeur" | "user">;
  redirectTo?: string;
}

export const ProtectedRoute = ({
  children,
  types,
  redirectTo = "/login",
}: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen text-lg">
        Chargement...
      </div>
    );
  }

  // Si utilisateur non connecté
  if (!user) return <Navigate to={redirectTo} replace />;

  // Si rôle non autorisé
  if (types && !types.includes(user.type))
    return <Navigate to="/non-autorise" replace />;

  return <>{children}</>;
};
