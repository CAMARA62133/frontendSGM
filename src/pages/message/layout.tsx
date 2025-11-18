// components/messaging/MessagingLayout.tsx
"use client";

import MessagingMenu from "./MessagingMenu";

/**
 * Layout principal pour le module de messagerie.
 *
 * Structure :
 * - Sidebar de navigation (MessagingMenu) sur la gauche
 * - Contenu principal des pages/messages sur la droite
 *
 * Props :
 * - children : le contenu à afficher dans le corps du layout
 */
export default function MessagingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar de navigation pour la messagerie */}
      <MessagingMenu />

      {/* Contenu principal */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
