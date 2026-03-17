import React, { useState } from "react";
import { X, Palette, Eye } from "lucide-react";
import type { Theme } from "../../types/theme.type";

interface ThemeCustomizerProps {
  currentTheme: Theme;
  onSave: (theme: Partial<Theme>) => void;
  onClose: () => void;
}

const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({
  currentTheme,
  onSave,
  onClose,
}) => {
  const [primary, setPrimary] = useState(currentTheme.primary);
  const [secondary, setSecondary] = useState(currentTheme.secondary);
  const [background, setBackground] = useState(currentTheme.background);
  const [messageBg, setMessageBg] = useState(currentTheme.messageBg);

  const handleSave = () => {
    onSave({ primary, secondary, background, messageBg });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-[400px] max-w-full shadow-2xl border border-zinc-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
          <div className="flex items-center gap-2">
            <Palette size={18} className="text-cyan-600" />
            <h3 className="text-sm font-bold text-zinc-800 uppercase tracking-tight">
              Design du thème
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-pink-50 hover:text-pink-500 text-zinc-400 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          {/* Preview Section - Plus moderne */}
          <div className="mb-6">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Eye size={12} /> Aperçu en temps réel
            </label>
            <div
              className="p-4 rounded-xl border border-zinc-100 shadow-inner flex flex-col gap-3 transition-colors duration-300"
              style={{ backgroundColor: background }}
            >
              <div className="flex gap-2">
                <div
                  className="w-6 h-6 rounded-full shadow-sm border border-white/20"
                  style={{ backgroundColor: primary }}
                />
                <div
                  className="w-6 h-6 rounded-full shadow-sm border border-white/20"
                  style={{ backgroundColor: secondary }}
                />
              </div>
              <div
                className="p-3 rounded-lg shadow-sm max-w-[80%]"
                style={{
                  backgroundColor: messageBg,
                  borderLeft: `3px solid ${primary}`,
                }}
              >
                <p
                  className="text-xs font-medium"
                  style={{ color: `${primary}CC` }}
                >
                  Utilisateur
                </p>
                <p className="text-sm leading-tight text-zinc-800">
                  Ceci est un aperçu de vos messages.
                </p>
              </div>
            </div>
          </div>

          {/* Controls - Grid pour compacité */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <ColorInput
              label="Principal"
              value={primary}
              onChange={setPrimary}
              color={primary}
            />
            <ColorInput
              label="Secondaire"
              value={secondary}
              onChange={setSecondary}
              color={secondary}
            />
            <ColorInput
              label="Fond App"
              value={background}
              onChange={setBackground}
              color={background}
            />
            <ColorInput
              label="Bulles"
              value={messageBg}
              onChange={setMessageBg}
              color={messageBg}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-bold text-zinc-500 hover:bg-zinc-100 rounded-xl transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-2.5 text-sm font-bold bg-zinc-900 text-white rounded-xl shadow-lg shadow-zinc-200 hover:bg-cyan-600 transition-all active:scale-95"
            >
              Sauvegarder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sous-composant pour les inputs de couleur afin de garder le code propre
const ColorInput = ({
  label,
  value,
  onChange,
  color,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  color: string;
}) => (
  <div>
    <label className="block text-[10px] font-black text-zinc-400 uppercase mb-1.5 ml-1">
      {label}
    </label>
    <div className="relative group">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
      />
      <div className="h-9 w-full bg-white border border-zinc-200 rounded-lg p-1 flex items-center gap-2 group-hover:border-zinc-300 transition-colors">
        <div
          className="w-6 h-6 rounded-md border border-zinc-100 shrink-0 shadow-sm"
          style={{ backgroundColor: color }}
        />
        <span className="text-[10px] font-mono font-medium text-zinc-500 uppercase">
          {color}
        </span>
      </div>
    </div>
  </div>
);

export default ThemeCustomizer;
