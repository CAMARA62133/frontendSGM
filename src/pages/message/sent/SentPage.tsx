// pages/messages/sent/SentPage.tsx
"use client";

import { useNavigate } from "react-router-dom";
import { Send } from "lucide-react";

// Composants
import MessageList from "../../../components/messages/MessageList";

/**
 * Page des messages envoyés.
 * Affiche tous les messages que l'utilisateur a envoyés
 * et permet de réaliser des actions sur chaque message.
 */
export default function SentPage() {
  const navigate = useNavigate(); // Hook pour naviguer vers la page détail d'un message

  // -----------------------------
  // Rendu
  // -----------------------------
  return (
    <MessageList
      statut="envoyes" // Filtrer les messages ayant le statut "envoyés"
      title="Messages envoyés" // Titre affiché dans l'en-tête
      icon={<Send className="w-6 h-6 text-green-600" />} // Icône représentant les messages envoyés
      mainColor="green-500" // Couleur principale utilisée pour les badges, hover, etc.
      /**
       * Actions flottantes disponibles sur chaque message :
       * - archive: déplacer vers les archives
       * - delete: supprimer le message
       */
      floatingActions={["archive", "delete"]}
      /**
       * Callback lorsque l'utilisateur clique sur un message.
       * Redirige vers la page détail du message sélectionné.
       */
      onMessageClick={(msg) => navigate(`/messaging/message/${msg.id}`)}
    />
  );
}
