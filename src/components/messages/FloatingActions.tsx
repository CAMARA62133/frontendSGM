"use client";

import { useState, useEffect } from "react";
import { MailOpen, Archive, Trash2, RotateCcw, Star } from "lucide-react";
import {
  restaurerMessage,
  supprimerMessage,
  supprimerDefinitivement,
  viderCorbeille,
  toggleArchiveMessage,
  toggleFavori,
  marquerCommeLu,
  marquerTousLus,
} from "../../services/messageService";

/**
 * 🔹 Type des actions possibles sur les messages
 */
export type ActionType =
  | "markAsRead"
  | "markAllAsRead"
  | "archive"
  | "dearchive"
  | "delete"
  | "deletePermanent"
  | "restore"
  | "favorite"
  | "defavorite"
  | "emptyTrash";

/**
 * 🔹 Props du composant FloatingActions
 *
 * - selectedMessages : tableau des IDs des messages sélectionnés
 * - actions : tableau des actions disponibles pour ces messages
 * - onUpdateMessages : callback après qu'une action soit exécutée
 * - position : position du floating panel ("center" ou "left")
 */
type FloatingActionsProps = {
  selectedMessages: string[];
  actions: ActionType[];
  onUpdateMessages: (updatedIds: string[], action: ActionType) => void;
  position?: "center" | "left";
};

/**
 * 🔹 Composant FloatingActions
 * Affiche un panel flottant avec les actions possibles sur les messages sélectionnés.
 */
export default function FloatingActions({
  selectedMessages,
  actions,
  onUpdateMessages,
  position = "center",
}: FloatingActionsProps) {
  const [action, setAction] = useState<ActionType | null>(null); // Action en cours
  const [isLoading, setIsLoading] = useState(false); // Indique si une action est en cours

  /**
   * 🔹 useEffect pour exécuter l'action sélectionnée
   */
  useEffect(() => {
    if (!action || selectedMessages.length === 0) return;

    const executeAction = async () => {
      setIsLoading(true); // Début du chargement
      try {
        // Exécuter l'action sur chaque message sélectionné
        const promises = selectedMessages.map(async (id) => {
          switch (action) {
            case "markAsRead":
              return marquerCommeLu(id);
            case "markAllAsRead":
              return marquerTousLus();
            case "archive":
            case "dearchive":
              return toggleArchiveMessage(id);
            case "delete":
              return supprimerMessage(id);
            case "deletePermanent":
              return supprimerDefinitivement(id);
            case "restore":
              return restaurerMessage(id);
            case "favorite":
            case "defavorite":
              return toggleFavori(id);
            case "emptyTrash":
              return viderCorbeille();
            default:
              return Promise.resolve();
          }
        });

        await Promise.all(promises); // Attendre que toutes les actions soient terminées
        onUpdateMessages(selectedMessages, action); // Callback pour mettre à jour la liste
      } catch (error) {
        console.error("Erreur lors de l'exécution de l'action :", error);
      } finally {
        setIsLoading(false); // Fin du chargement
        setAction(null); // Reset de l'action
      }
    };

    executeAction();
  }, [action, selectedMessages, onUpdateMessages]);

  // Ne pas afficher le panel si aucun message n'est sélectionné
  if (selectedMessages.length === 0) return null;

  /**
   * 🔹 Configuration des boutons pour chaque action
   */
  const getActionConfig = (actionType: ActionType) => {
    const configs = {
      markAsRead: {
        icon: MailOpen,
        label: "Marquer comme lu",
        color: "text-blue-600",
        bgColor: "hover:bg-blue-50",
        borderColor: "border-blue-200",
      },
      markAllAsRead: {
        icon: MailOpen,
        label: "Tout marquer comme lu",
        color: "text-blue-600",
        bgColor: "hover:bg-blue-50",
        borderColor: "border-blue-200",
      },
      archive: {
        icon: Archive,
        label: "Archiver",
        color: "text-green-600",
        bgColor: "hover:bg-green-50",
        borderColor: "border-green-200",
      },
      dearchive: {
        icon: Archive,
        label: "Désarchiver",
        color: "text-green-600",
        bgColor: "hover:bg-green-50",
        borderColor: "border-green-200",
      },
      restore: {
        icon: RotateCcw,
        label: "Restaurer",
        color: "text-cyan-600",
        bgColor: "hover:bg-cyan-50",
        borderColor: "border-cyan-200",
      },
      favorite: {
        icon: Star,
        label: "Ajouter aux favoris",
        color: "text-yellow-600",
        bgColor: "hover:bg-yellow-50",
        borderColor: "border-yellow-200",
      },
      defavorite: {
        icon: Star,
        label: "Retirer des favoris",
        color: "text-yellow-400",
        bgColor: "hover:bg-yellow-50",
        borderColor: "border-yellow-200",
      },
      delete: {
        icon: Trash2,
        label: "Déplacer vers la corbeille",
        color: "text-red-600",
        bgColor: "hover:bg-red-50",
        borderColor: "border-red-200",
      },
      deletePermanent: {
        icon: Trash2,
        label: "Supprimer définitivement",
        color: "text-red-700",
        bgColor: "hover:bg-red-100",
        borderColor: "border-red-300",
      },
      emptyTrash: {
        icon: Trash2,
        label: "Vider la corbeille",
        color: "text-red-700",
        bgColor: "hover:bg-red-100",
        borderColor: "border-red-300",
      },
    };
    return configs[actionType];
  };

  /**
   * 🔹 Fonction pour créer un bouton d'action
   */
  const renderIconButton = (actionType: ActionType) => {
    const config = getActionConfig(actionType);
    const Icon = config.icon;

    return (
      <button
        key={actionType}
        onClick={() => setAction(actionType)}
        disabled={isLoading} // Désactive le bouton si une action est en cours
        title={config.label} // Tooltip
        className={`
          p-3 bg-white rounded-xl transition-all duration-200 flex items-center justify-center
          shadow-sm border ${config.borderColor}
          ${config.color} ${config.bgColor}
          disabled:opacity-50 disabled:cursor-not-allowed
          hover:shadow-md hover:scale-105 active:scale-95
          min-w-[44px] min-h-[44px]
        `}
      >
        {isLoading && action === actionType ? (
          // Affiche un loader si l'action est en cours
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <Icon className="w-5 h-5" />
        )}
      </button>
    );
  };

  return (
    <div
      className={`
        fixed top-24 z-50 p-4 rounded-2xl shadow-2xl 
        border border-gray-100 backdrop-blur-sm bg-white/95
        flex items-center gap-3 flex-wrap transition-all duration-300
        animate-in slide-in-from-top-5
        ${
          position === "center"
            ? "left-1/2 transform -translate-x-1/2"
            : "left-8"
        }
      `}
    >
      {/* 🔹 Badge indiquant le nombre de messages sélectionnés */}
      <div className="flex items-center gap-3 mr-2">
        <div className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm">
          {selectedMessages.length}
        </div>
        <span className="text-sm text-gray-700 font-medium whitespace-nowrap">
          message{selectedMessages.length > 1 ? "s" : ""} sélectionné
          {selectedMessages.length > 1 ? "s" : ""}
        </span>
      </div>

      {/* 🔹 Séparateur */}
      <div className="h-6 w-px bg-gray-300"></div>

      {/* 🔹 Boutons d'action */}
      <div className="flex items-center gap-2">
        {actions.includes("markAsRead") && renderIconButton("markAsRead")}
        {actions.includes("markAllAsRead") && renderIconButton("markAllAsRead")}
        {actions.includes("archive") && renderIconButton("archive")}
        {actions.includes("dearchive") && renderIconButton("dearchive")}
        {actions.includes("restore") && renderIconButton("restore")}
        {actions.includes("favorite") && renderIconButton("favorite")}
        {actions.includes("defavorite") && renderIconButton("defavorite")}
        {actions.includes("delete") && renderIconButton("delete")}
        {actions.includes("deletePermanent") &&
          renderIconButton("deletePermanent")}
        {actions.includes("emptyTrash") && renderIconButton("emptyTrash")}
      </div>
    </div>
  );
}
