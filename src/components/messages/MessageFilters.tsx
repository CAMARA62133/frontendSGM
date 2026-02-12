"use client";

import type { FC } from "react";
import { User, Calendar, X, Paperclip, Filter } from "lucide-react";

/**
 * 🔹 Interface des props du composant MessageFilters
 */
interface MessageFiltersProps {
  show: boolean;
  filterRecipient: string;
  setFilterRecipient: (value: string) => void;
  filterHasAttachment: boolean;
  setFilterHasAttachment: (value: boolean) => void;
  filterDateFrom: string;
  setFilterDateFrom: (value: string) => void;
  filterDateTo: string;
  setFilterDateTo: (value: string) => void;
  clearFilters: () => void;
}

/**
 * 🔹 Composant MessageFilters
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
  if (!show) return null;

  return (
    <div className="p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-cyan-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Filtres avancés
          </h3>
        </div>
        <button
          onClick={clearFilters}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
          Effacer tout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Filtre Expéditeur / Destinataire */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <User className="w-4 h-4 text-cyan-600" />
            Expéditeur / Destinataire
          </label>
          <input
            type="text"
            placeholder="Nom ou email"
            value={filterRecipient}
            onChange={(e) => setFilterRecipient(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 bg-white/80 transition-all duration-200"
          />
        </div>

        {/* Filtre Pièce Jointe */}
        <div className="flex items-center gap-3 p-2">
          <div className="flex items-center gap-2">
            <Paperclip className="w-4 h-4 text-cyan-600" />
            <span className="text-sm font-medium text-gray-700">
              Pièce jointe
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={filterHasAttachment}
              onChange={(e) => setFilterHasAttachment(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
          </label>
        </div>

        {/* Filtre Date de Début */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Calendar className="w-4 h-4 text-cyan-600" />
            Date de début
          </label>
          <input
            type="date"
            value={filterDateFrom}
            onChange={(e) => setFilterDateFrom(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 bg-white/80 transition-all duration-200"
          />
        </div>

        {/* Filtre Date de Fin */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Calendar className="w-4 h-4 text-cyan-600" />
            Date de fin
          </label>
          <input
            type="date"
            value={filterDateTo}
            onChange={(e) => setFilterDateTo(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 bg-white/80 transition-all duration-200"
          />
        </div>
      </div>
    </div>
  );
};

export default MessageFilters;
