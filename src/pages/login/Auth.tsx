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
    // Conteneur principal avec fond moderne et dynamique
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-cyan-50/20 to-blue-50/30 px-4 py-6 relative overflow-hidden">
      {/* Éléments décoratifs modernes - plus subtils */}
      <div className="absolute top-10 -left-20 w-56 h-56 bg-cyan-400/8 rounded-full blur-2xl" />
      <div className="absolute bottom-10 -right-20 w-64 h-64 bg-blue-400/8 rounded-full blur-2xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-cyan-300/3 rounded-full blur-xl" />

      {/* Motif géométrique très subtil */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.02)_0%,transparent_70%)]" />

      {/* Conteneur principal compact et élégant */}
      <div className="relative w-full max-w-sm bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/60">
        {/* Header épuré */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl shadow-md mb-3">
            <div className="w-5 h-5 bg-white/95 rounded-sm transform rotate-45 shadow-inner" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight mb-2">
            {title}
          </h1>
          <div className="w-14 h-0.5 bg-gradient-to-r from-cyan-500 to-cyan-400 mx-auto rounded-full shadow-sm" />
        </div>

        {/* Contenu interne compact */}
        <div className="space-y-4">{children}</div>
      </div>

      {/* Effet de lumière très subtil */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/3 to-transparent pointer-events-none" />
    </div>
  );
}
