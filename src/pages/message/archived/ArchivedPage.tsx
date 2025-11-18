import { Archive } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MessageList from "../../../components/messages/MessageList";

/**
 * 🔹 ArchivedPage
 * Page pour afficher tous les messages archivés.
 * Utilise le composant générique MessageList avec le statut "archives".
 */
export default function ArchivedPage() {
  const navigate = useNavigate(); // Hook pour la navigation programmatique

  return (
    <MessageList
      // Statut filtrant les messages à afficher
      statut="archives"
      // Titre affiché en haut de la liste
      title="Archives"
      // Icône affichée à côté du titre
      icon={<Archive className="w-6 h-6 text-purple-600" />}
      // Couleur principale pour les éléments UI liés à cette page
      mainColor="purple-500"
      // Actions flottantes disponibles pour chaque message
      // "dearchive" → restaurer depuis les archives
      // "delete" → supprimer définitivement
      floatingActions={["dearchive", "delete"]}
      // Gestion du clic sur un message : navigation vers la page détail
      onMessageClick={(msg) => navigate(`/messaging/message/${msg.id}`)}
    />
  );
}
