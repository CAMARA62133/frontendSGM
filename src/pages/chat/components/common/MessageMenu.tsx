import React from "react";
import {
  MoreVertical,
  Pencil,
  Pin,
  CheckSquare,
  Trash2,
  PinOff,
} from "lucide-react";
import type { MessageMenuProps } from "../../types/communication.type";

const MessageMenu: React.FC<MessageMenuProps> = ({
  isMe,
  isPinned, 
  onEdit,
  onDelete,
  onPin,
  onSelect,
  onClose,
}) => {
  return (
    <div className="relative">
      <button
        onClick={onClose}
        className="p-1 rounded-full hover:bg-gray-200 transition"
      >
        <MoreVertical size={16} className="text-gray-500" />
      </button>

      <div className="absolute z-50 mt-2 w-44 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden">
        {isMe && (
          <button
            onClick={onEdit}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs hover:bg-gray-100 transition"
          >
            <Pencil size={14} />
            Modifier
          </button>
        )}

        <button
          onClick={onPin}
          className={`flex items-center gap-2 w-full px-3 py-2 text-xs transition ${
            isPinned
              ? "text-amber-600 bg-amber-50 hover:bg-amber-100"
              : "hover:bg-gray-100"
          }`}
        >
          {isPinned ? <PinOff size={14} /> : <Pin size={14} />}
          {isPinned ? "Détacher" : "Épingler"}
        </button>

        <button
          onClick={onSelect}
          className="flex items-center gap-2 w-full px-3 py-2 text-xs hover:bg-gray-100 transition"
        >
          <CheckSquare size={14} />
          Sélectionner
        </button>

        <button
          onClick={onDelete}
          className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition"
        >
          <Trash2 size={14} />
          Supprimer
        </button>
      </div>
    </div>
  );
};

export default MessageMenu;
