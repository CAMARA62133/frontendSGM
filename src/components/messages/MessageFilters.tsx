"use client";

import type { FC } from "react";
import { User, Calendar, X, Paperclip } from "lucide-react";

/**
 * 🔹 Interface des props du composant MessageFilters
 *
 * Ce composant gère un panneau de filtres pour les messages.
 */
interface MessageFiltersProps {
  /** Indique si le panneau de filtres doit être affiché */
  show: boolean;

  /** Filtre par nom ou email de l'expéditeur ou destinataire */
  filterRecipient: string;
  setFilterRecipient: (value: string) => void;

  /** Filtre pour afficher uniquement les messages avec pièce jointe */
  filterHasAttachment: boolean;
  setFilterHasAttachment: (value: boolean) => void;

  /** Date de début pour filtrer les messages */
  filterDateFrom: string;
  setFilterDateFrom: (value: string) => void;

  /** Date de fin pour filtrer les messages */
  filterDateTo: string;
  setFilterDateTo: (value: string) => void;

  /** Fonction pour réinitialiser tous les filtres */
  clearFilters: () => void;
}

/**
 * 🔹 Composant MessageFilters
 *
 * Affiche un panneau de filtres comprenant :
 * - Filtre par expéditeur/destinataire
 * - Filtre par messages avec pièce jointe
 * - Filtre par plage de dates
 * - Bouton pour réinitialiser tous les filtres
 */
const MessageFilters: FC<MessageFiltersProps> = ({
  show,
  filterRecipient,
  setFilterRecipient,
  filterHasAttachment,
  setFilterHasAttachment,
  filterDateFrom,
  setFilterDateFrom,
  filterDateTo,
  setFilterDateTo,
  clearFilters,
}) => {
  // 🔹 Si le panneau de filtres n'est pas visible, ne rien afficher
  if (!show) return null;

  return (
    <div className="p-4 bg-gray-50 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* -------------------- Filtre Expéditeur / Destinataire -------------------- */}
      <div className="flex flex-col">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <User className="w-4 h-4 inline mr-1" /> Expéditeur / Destinataire
        </label>
        <input
          type="text"
          placeholder="Nom ou email"
          value={filterRecipient}
          onChange={(e) => setFilterRecipient(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>

      {/* -------------------- Filtre Pièce Jointe -------------------- */}
      <div className="flex items-center gap-2 mt-2 sm:mt-0">
        <Paperclip className="w-4 h-4" />
        <input
          type="checkbox"
          checked={filterHasAttachment}
          onChange={(e) => setFilterHasAttachment(e.target.checked)}
          className="h-4 w-4 text-cyan-600 rounded border-gray-300 focus:ring-cyan-500"
        />
        <span className="text-sm text-gray-700">Avec pièce jointe</span>
      </div>

      {/* -------------------- Filtre Date de Début -------------------- */}
      <div className="flex flex-col">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <Calendar className="w-4 h-4 inline mr-1" /> Date de début
        </label>
        <input
          type="date"
          value={filterDateFrom}
          onChange={(e) => setFilterDateFrom(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>

      {/* -------------------- Filtre Date de Fin -------------------- */}
      <div className="flex flex-col">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <Calendar className="w-4 h-4 inline mr-1" /> Date de fin
        </label>
        <input
          type="date"
          value={filterDateTo}
          onChange={(e) => setFilterDateTo(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>

      {/* -------------------- Bouton Réinitialiser tous les filtres -------------------- */}
      <div className="col-span-full flex justify-end mt-2">
        <button
          onClick={clearFilters}
          className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 flex items-center gap-2"
        >
          <X className="w-4 h-4" /> Effacer les filtres
        </button>
      </div>
    </div>
  );
};

export default MessageFilters;
