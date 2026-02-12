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
 */
type FloatingActionsProps = {
  selectedMessages: string[];
  actions: ActionType[];
  onUpdateMessages: (updatedIds: string[], action: ActionType) => void;
  position?: "center" | "left";
};

/**
 * 🔹 Composant FloatingActions
 */
export default function FloatingActions({
  selectedMessages,
  actions,
  onUpdateMessages,
  position = "center",
}: FloatingActionsProps) {
  const [action, setAction] = useState<ActionType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!action || selectedMessages.length === 0) return;

    const executeAction = async () => {
      setIsLoading(true);
      try {
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

        await Promise.all(promises);
        onUpdateMessages(selectedMessages, action);
      } catch (error) {
        console.error("Erreur lors de l'exécution de l'action :", error);
      } finally {
        setIsLoading(false);
        setAction(null);
      }
    };

    executeAction();
  }, [action, selectedMessages, onUpdateMessages]);

  if (selectedMessages.length === 0) return null;

  const getActionConfig = (actionType: ActionType) => {
    const configs = {
      markAsRead: {
        icon: MailOpen,
        label: "Marquer comme lu",
        color: "text-blue-600",
        bgColor: "hover:bg-blue-50",
      },
      markAllAsRead: {
        icon: MailOpen,
        label: "Tout marquer comme lu",
        color: "text-blue-600",
        bgColor: "hover:bg-blue-50",
      },
      archive: {
        icon: Archive,
        label: "Archiver",
        color: "text-green-600",
        bgColor: "hover:bg-green-50",
      },
      dearchive: {
        icon: Archive,
        label: "Désarchiver",
        color: "text-green-600",
        bgColor: "hover:bg-green-50",
      },
      restore: {
        icon: RotateCcw,
        label: "Restaurer",
        color: "text-cyan-600",
        bgColor: "hover:bg-cyan-50",
      },
      favorite: {
        icon: Star,
        label: "Ajouter aux favoris",
        color: "text-yellow-600",
        bgColor: "hover:bg-yellow-50",
      },
      defavorite: {
        icon: Star,
        label: "Retirer des favoris",
        color: "text-yellow-400",
        bgColor: "hover:bg-yellow-50",
      },
      delete: {
        icon: Trash2,
        label: "Déplacer vers la corbeille",
        color: "text-red-600",
        bgColor: "hover:bg-red-50",
      },
      deletePermanent: {
        icon: Trash2,
        label: "Supprimer définitivement",
        color: "text-red-700",
        bgColor: "hover:bg-red-100",
      },
      emptyTrash: {
        icon: Trash2,
        label: "Vider la corbeille",
        color: "text-red-700",
        bgColor: "hover:bg-red-100",
      },
    };
    return configs[actionType];
  };

  const renderIconButton = (actionType: ActionType) => {
    const config = getActionConfig(actionType);
    const Icon = config.icon;

    return (
      <button
        key={actionType}
        onClick={() => setAction(actionType)}
        disabled={isLoading}
        title={config.label}
        className={`
          p-2 bg-white rounded-lg transition-all duration-200 flex items-center justify-center
          border border-gray-200
          ${config.color} ${config.bgColor}
          disabled:opacity-50 disabled:cursor-not-allowed
          hover:scale-105 active:scale-95
          min-w-[36px] min-h-[36px]
        `}
      >
        {isLoading && action === actionType ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <Icon className="w-4 h-4" />
        )}
      </button>
    );
  };

  return (
    <div
      className={`
        fixed top-20 z-50 p-4 rounded-xl 
        border border-gray-200 bg-white
        flex items-center gap-3 transition-all duration-300
        animate-in slide-in-from-top-5
        ${
          position === "center"
            ? "left-1/2 transform -translate-x-1/2"
            : "left-8"
        }
      `}
    >
      {/* 🔹 Badge indiquant le nombre de messages sélectionnés */}
      <div className="flex items-center gap-2">
        <div className="bg-cyan-500 text-white px-2 py-1 rounded text-sm font-medium">
          {selectedMessages.length}
        </div>
        <span className="text-sm text-gray-700 font-medium whitespace-nowrap">
          message{selectedMessages.length > 1 ? "s" : ""} sélectionné
          {selectedMessages.length > 1 ? "s" : ""}
        </span>
      </div>

      {/* 🔹 Séparateur */}
      <div className="h-5 w-px bg-gray-200"></div>

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
