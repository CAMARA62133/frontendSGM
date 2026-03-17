import React from "react";
import { Pin } from "lucide-react";

interface PinButtonProps {
  onPin: () => void;
  isPinned?: boolean;
}

const PinButton: React.FC<PinButtonProps> = ({ onPin, isPinned }) => {
  return (
    <button
      onClick={onPin}
      className={`p-1 rounded-lg transition ${
        isPinned
          ? "text-amber-600 bg-amber-100"
          : "text-gray-400 hover:bg-gray-100"
      }`}
      title={isPinned ? "Détacher" : "Épingler"}
    >
      <Pin size={14} />
    </button>
  );
};

export default PinButton;
