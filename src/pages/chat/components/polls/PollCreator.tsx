import React, { useState } from "react";
import { Plus, X, Clock, List, Vote } from "lucide-react";

interface PollCreatorProps {
  onCreatePoll: (
    question: string,
    options: string[],
    expiresIn: number,
  ) => void;
  onClose: () => void;
}

const PollCreator: React.FC<PollCreatorProps> = ({ onCreatePoll, onClose }) => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [expiresIn, setExpiresIn] = useState(24);

  const addOption = () => {
    if (options.length < 10) setOptions([...options, ""]);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) setOptions(options.filter((_, i) => i !== index));
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = () => {
    if (question.trim() && options.every((opt) => opt.trim())) {
      onCreatePoll(
        question.trim(),
        options.filter((opt) => opt.trim()),
        expiresIn,
      );
      onClose();
    }
  };

  const isInvalid = !question.trim() || options.some((opt) => !opt.trim());

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-[400px] shadow-2xl overflow-hidden border border-gray-100 transition-all">
        {/* Header Dégradé */}
        <div className="bg-gradient-to-r from-cyan-500 to-pink-500 p-4 flex justify-between items-center text-white">
          <div className="bg-white/20 p-1.5 rounded-lg flex items-center justify-center">
            <Vote size={20} className="text-white" />
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white/20 p-1 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Section Question */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
              Votre Question
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ex: On mange quoi ce midi ?"
              rows={2}
              className="w-full text-sm p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none resize-none transition-all placeholder:text-gray-400 font-medium"
            />
          </div>

          {/* Section Options */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-1">
              <List size={12} /> Choix possibles
            </label>
            <div className="max-h-[180px] overflow-y-auto pr-1 space-y-2 custom-scrollbar">
              {options.map((option, index) => (
                <div
                  key={index}
                  className="group flex gap-2 animate-in fade-in slide-in-from-left-2 duration-200"
                >
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1 text-sm p-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all"
                  />
                  {options.length > 2 && (
                    <button
                      onClick={() => removeOption(index)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {options.length < 10 && (
              <button
                onClick={addOption}
                className="w-full py-2 border-2 border-dashed border-gray-100 rounded-lg text-xs font-bold text-cyan-600 hover:bg-cyan-50 hover:border-cyan-100 transition-all flex items-center justify-center gap-1"
              >
                <Plus size={14} /> Ajouter un choix
              </button>
            )}
          </div>

          {/* Section Durée */}
          <div className="pt-2">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
              <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase">
                <Clock size={14} className="text-pink-500" /> Durée
              </label>
              <select
                value={expiresIn}
                onChange={(e) => setExpiresIn(parseInt(e.target.value))}
                className="bg-transparent text-sm font-bold text-gray-700 outline-none cursor-pointer"
              >
                <option value="1">1h</option>
                <option value="6">6h</option>
                <option value="24">24h</option>
                <option value="72">3 jours</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSubmit}
              disabled={isInvalid}
              className="flex-[2] py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-cyan-200 hover:shadow-cyan-300 transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none disabled:shadow-none"
            >
              Lancer le sondage
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 text-gray-500 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PollCreator;
