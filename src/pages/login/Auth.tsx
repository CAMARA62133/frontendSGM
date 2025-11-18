import type { ReactNode } from "react";

/**
 * 🔹 Props pour AuthLayout
 * - title : Le titre affiché en haut du formulaire (ex: "Connexion", "Inscription")
 * - children : Contenu du formulaire ou composants à afficher à l'intérieur du layout
 */
interface AuthLayoutProps {
  title: string;
  children: ReactNode;
}

/**
 * 🔹 AuthLayout
 * Composant réutilisable pour les pages d'authentification.
 * Fournit un conteneur centré avec un style moderne et épuré.
 */
export default function AuthLayout({ title, children }: AuthLayoutProps) {
  return (
    // Conteneur principal qui centre le contenu verticalement et horizontalement
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      {/* Conteneur du formulaire / contenu d'authentification - design épuré */}
      <div className="relative w-full max-w-sm bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        {/* Titre du formulaire - discret mais clair */}
        <h1 className="text-xl font-semibold text-gray-800 mb-6 text-center">
          {title}
        </h1>

        {/* Contenu interne injecté (ex: formulaire de connexion) */}
        {children}
      </div>
    </div>
  );
}
