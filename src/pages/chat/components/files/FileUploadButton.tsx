import React, { useRef } from "react";
import { Paperclip } from "lucide-react";

interface FileUploadButtonProps {
  onFileSelect: (file: File) => void;
  className?: string; // Ajout pour la flexibilité et éviter les erreurs TS
}

const FileUploadButton: React.FC<FileUploadButtonProps> = ({
  onFileSelect,
  className,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
      // On réinitialise la valeur pour pouvoir sélectionner le même fichier deux fois de suite
      e.target.value = "";
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleChange}
        className="hidden"
      />
      <button
        type="button" // Précision du type pour éviter les soumissions de formulaires
        onClick={handleClick}
        className={`p-2 text-gray-500 hover:bg-cyan-50 hover:text-cyan-600 rounded-lg transition-all duration-200 group ${className || ""}`}
        title="Joindre un fichier"
      >
        <Paperclip
          size={18}
          className="group-hover:-rotate-12 transition-transform"
        />
      </button>
    </>
  );
};

export default FileUploadButton;
