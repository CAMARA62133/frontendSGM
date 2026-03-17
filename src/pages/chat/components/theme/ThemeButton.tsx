import React from "react";
import { Palette } from "lucide-react";

interface ThemeButtonProps {
  onClick: () => void;
  className?: string; // Ajout pour corriger l'erreur TypeScript
}

const ThemeButton: React.FC<ThemeButtonProps> = ({ onClick, className }) => {
  return (
    <button
      onClick={onClick}

      className={`p-2 text-gray-500 hover:bg-pink-50 hover:text-pink-600 rounded-xl transition-all duration-200 ${className || ""}`}
      title="Personnaliser le thème"
    >
      <Palette size={20} />
    </button>
  );
};

export default ThemeButton;
