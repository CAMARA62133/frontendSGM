// pages/messages/trash/TrashPage.tsx
"use client";

import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";

// Composants
import MessageList from "../../../components/messages/MessageList";

/**
 * Page de la corbeille.
 * Affiche tous les messages supprimés et permet :
 * - de restaurer un message
 * - de supprimer définitivement un message
 * - de vider entièrement la corbeille
 */
export default function TrashPage() {
  const navigate = useNavigate(); // Hook pour naviguer vers la page détail d'un message

  // -----------------------------
  // Rendu
  // -----------------------------
  return (
    <MessageList
      statut="corbeille" // Filtrer les messages ayant le statut "corbeille"
      title="Corbeille" // Titre affiché dans l'en-tête
      icon={<Trash2 className="w-6 h-6 text-gray-600" />} // Icône représentant la corbeille
      mainColor="gray-500" // Couleur principale pour badges, hover, etc.
      /**
       * Actions flottantes disponibles sur chaque message :
       * - restore: récupérer le message dans la boîte de réception ou son dossier initial
       * - deletePermanent: supprimer définitivement le message
       * - emptyTrash: vider complètement la corbeille
       */
      floatingActions={["restore", "deletePermanent", "emptyTrash"]}
      /**
       * Callback lorsque l'utilisateur clique sur un message.
       * Redirige vers la page détail du message sélectionné.
       */
      onMessageClick={(msg) => navigate(`/messaging/message/${msg.id}`)}
    />
  );
}
