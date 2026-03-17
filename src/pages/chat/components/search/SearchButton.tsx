import React from "react";
import { Search } from "lucide-react";

interface SearchButtonProps {
  onClick: () => void;
  className?: string; // Ajout de la prop optionnelle pour TypeScript
}

const SearchButton: React.FC<SearchButtonProps> = ({ onClick, className }) => {
  return (
    <button
      onClick={onClick}
      // On combine les styles de base avec la className reçue en prop
      className={`p-2 text-gray-500 hover:bg-cyan-50 hover:text-cyan-600 rounded-xl transition-all duration-200 ${className || ""}`}
      title="Rechercher (Ctrl+K)"
    >
      <Search size={20} />
    </button>
  );
};

export default SearchButton;
