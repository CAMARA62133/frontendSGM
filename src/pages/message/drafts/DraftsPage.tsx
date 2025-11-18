// pages/messages/drafts/DraftsPage.tsx
"use client";

import { useState } from "react";
import { FileText } from "lucide-react";

// Composants
import MessageList from "../../../components/messages/MessageList";
import EmailComposerModal from "../MessageForm";

// Services
import { getMessageById } from "../../../services/messageService";

// Types
import type { Message } from "../../../models/Message";

/**
 * Page des brouillons.
 * Affiche la liste des messages brouillons et permet d'ouvrir un message
 * dans un modal pour le modifier.
 */
export default function DraftsPage() {
  // -----------------------------
  // États locaux
  // -----------------------------
  const [selectedDraft, setSelectedDraft] = useState<Message | null>(null); // Brouillon sélectionné
  const [isModalOpen, setIsModalOpen] = useState(false); // État du modal d'édition

  // -----------------------------
  // Gestion de la sélection d'un brouillon
  // -----------------------------
  const handleMessageClick = async (msg: Message) => {
    try {
      // Récupère les données complètes du brouillon depuis le backend
      const res = await getMessageById(msg.id);
      setSelectedDraft(res.data); // Stocke le brouillon sélectionné
      setIsModalOpen(true); // Ouvre le modal pour modification
    } catch (err) {
      console.error("Erreur lors de la récupération du brouillon:", err);
    }
  };

  // -----------------------------
  // Fermeture du modal
  // -----------------------------
  const handleCloseModal = () => {
    setIsModalOpen(false); // Ferme le modal
    setSelectedDraft(null); // Réinitialise le brouillon sélectionné
  };

  // -----------------------------
  // Rendu
  // -----------------------------
  return (
    <>
      {/* Liste des brouillons */}
      <MessageList
        statut="brouillons" // Filtrage par statut 'brouillons'
        title="Brouillons" // Titre affiché dans l'en-tête
        icon={<FileText className="w-6 h-6 text-orange-600" />} // Icône du titre
        mainColor="orange-500" // Couleur principale pour les badges, etc.
        floatingActions={["delete"]} // Actions flottantes disponibles pour chaque message
        onMessageClick={handleMessageClick} // Callback quand un message est cliqué
      />

      {/* Modal d'édition du brouillon */}
      {isModalOpen && selectedDraft && (
        <EmailComposerModal
          isOpen={isModalOpen} // État d'ouverture du modal
          onClose={handleCloseModal} // Callback pour fermer le modal
          initialMessage={selectedDraft} // Message initial à modifier
          mode="draft" // Mode 'draft' pour ajuster le comportement
        />
      )}
    </>
  );
}
