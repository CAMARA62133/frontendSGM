// pages/messages/inbox/InboxPage.tsx
"use client";

import { useNavigate } from "react-router-dom";
import { Inbox } from "lucide-react";

// Composants
import MessageList from "../../../components/messages/MessageList";

/**
 * Page de la boîte de réception.
 * Affiche tous les messages reçus et permet de réaliser des actions sur chaque message.
 */
export default function InboxPage() {
  const navigate = useNavigate(); // Hook pour naviguer vers la page détail d'un message

  // -----------------------------
  // Rendu
  // -----------------------------
  return (
    <MessageList
      statut="recus" // Filtrer les messages ayant le statut "reçus"
      title="Boîte de réception" // Titre affiché dans l'en-tête
      icon={<Inbox className="w-6 h-6 text-cyan-600" />} // Icône de la page
      mainColor="cyan-500" // Couleur principale utilisée pour les badges, hover, etc.
      showStar={true} // Affiche l'icône étoile pour pouvoir mettre un message en favori
      /**
       * Actions flottantes disponibles sur chaque message :
       * - archive: déplacer vers les archives
       * - delete: supprimer le message
       * - markAsRead: marquer comme lu
       * - favorite: ajouter aux favoris
       */
      floatingActions={["archive", "delete", "markAsRead", "favorite"]}
      /**
       * Callback lorsque l'utilisateur clique sur un message.
       * Redirige vers la page détail du message sélectionné.
       */
      onMessageClick={(msg) => navigate(`/messaging/message/${msg.id}`)}

      // unreadCount peut être ajouté ici si la donnée est disponible pour afficher le nombre de messages non lus
    />
  );
}
