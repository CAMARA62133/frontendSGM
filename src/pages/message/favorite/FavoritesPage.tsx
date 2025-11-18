// pages/messages/favorites/FavoritesPage.tsx
"use client";

import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";

// Composants
import MessageList from "../../../components/messages/MessageList";

/**
 * Page des messages favoris.
 * Affiche tous les messages marqués comme favoris et permet d'accéder
 * aux actions comme archiver, supprimer, marquer comme lu ou retirer des favoris.
 */
export default function FavoritesPage() {
  const navigate = useNavigate(); // Hook pour naviguer vers la page détail

  // -----------------------------
  // Rendu
  // -----------------------------
  return (
    <MessageList
      statut="favoris" // Filtrage des messages avec le statut 'favoris'
      title="Messages favoris" // Titre affiché dans l'en-tête
      icon={<Star className="w-6 h-6 text-yellow-600" />} // Icône de la page
      mainColor="yellow-500" // Couleur principale (pour badges ou survol)
      showStar={true} // Affiche l'icône étoile pour identifier les favoris
      /**
       * Actions flottantes disponibles sur chaque message :
       * - archive: déplacer vers les archives
       * - delete: supprimer le message
       * - markAsRead: marquer comme lu
       * - defavorite: retirer des favoris
       */
      floatingActions={["archive", "delete", "markAsRead", "defavorite"]}
      /**
       * Callback lorsque l'utilisateur clique sur un message.
       * Redirige vers la page détail du message sélectionné.
       */
      onMessageClick={(msg) => navigate(`/messaging/message/${msg.id}`)}
    />
  );
}
