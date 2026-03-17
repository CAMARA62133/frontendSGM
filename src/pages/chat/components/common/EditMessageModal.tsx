import React, { useState } from "react";
import { X } from "lucide-react";

interface EditMessageModalProps {
  initialContent: string;
  onSave: (content: string) => void;
  onClose: () => void;
}

const EditMessageModal: React.FC<EditMessageModalProps> = ({
  initialContent,
  onSave,
  onClose,
}) => {
  const [content, setContent] = useState(initialContent);

  const handleSave = () => {
    if (content.trim()) {
      onSave(content.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white w-full sm:w-[450px] rounded-2xl shadow-2xl p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800">
            Modifier le message
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="w-full border border-gray-200 rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none transition"
          placeholder="Modifier votre message..."
          autoFocus
        />

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 transition"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 transition shadow-md"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditMessageModal;
