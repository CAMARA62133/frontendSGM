import React, { useState, useEffect, useCallback } from "react";
import {
  Bell,
  BellOff,
  Clock,
  Hash,
  MessageSquare,
  X,
  Plus,
} from "lucide-react";
import type { DNDSettingsResponse } from "../../types/dnd.type";
import { dndService } from "../../services/dndService";
import { useAuth } from "../../../../context/useAuth";
import { useSocket } from "../../contexts/useSocket";


interface DNDSettingsProps {
  conversationId?: string | null;
  onClose: () => void;
  onSave: () => void;
}

interface ScheduleState {
  enabled: boolean;
  start: string;
  end: string;
}

const DNDSettings: React.FC<DNDSettingsProps> = ({
  conversationId,
  onClose,
  onSave,
}) => {
  const [enabled, setEnabled] = useState<boolean>(false);
  const [schedule, setSchedule] = useState<ScheduleState>({
    enabled: false,
    start: "22",
    end: "08",
  });
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState<string>("");
  const [autoReply, setAutoReply] = useState<string>("");

  const { user } = useAuth(); // récupère l'utilisateur courant
  const { socket } = useSocket(); // récupère le socket depuis le context

  // 🔹 Charger les paramètres DND existants
  const loadSettings = useCallback(async () => {
    try {
      const settings: DNDSettingsResponse = await dndService.getDNDSettings(
        conversationId || null,
      );
      setEnabled(settings.enabled);
      if (settings.schedule) {
        const [start, end] = settings.schedule.split("-");
        setSchedule({ enabled: true, start: start || "22", end: end || "08" });
      }
      setKeywords(settings.keywords || []);
      setAutoReply(settings.autoReply || "");
    } catch (error) {
      console.error("Erreur chargement paramètres:", error);
    }
  }, [conversationId]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const addKeyword = useCallback(() => {
    const trimmed = newKeyword.trim();
    if (trimmed && !keywords.includes(trimmed)) {
      setKeywords((prev) => [...prev, trimmed]);
      setNewKeyword("");
    }
  }, [newKeyword, keywords]);

  const removeKeyword = (k: string) =>
    setKeywords((prev) => prev.filter((item) => item !== k));

const handleSave = async () => {
  try {
    const updated = await dndService.updateDNDSettings(conversationId || null, {
      enabled,
      schedule: schedule.enabled ? `${schedule.start}-${schedule.end}` : null,
      keywords,
      autoReply: autoReply.trim() || null,
    });

    // 🔹 Vérifier que updated est défini avant d'utiliser
    if (updated && socket && socket.connected && user) {
      socket.emit("updateDNDStatus", {
        userId: user.id,
        enabled: updated.enabled,
      });
    }

    onSave();
    onClose();
  } catch (error) {
    console.error(error);
  }
};

  const hourOptions = Array.from({ length: 24 }, (_, i) => {
    const v = i.toString().padStart(2, "0");
    return (
      <option key={v} value={v}>
        {v}h
      </option>
    );
  });

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-[400px] shadow-2xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500 to-pink-500 p-4 flex justify-between items-center text-white">
          <h3 className="font-bold tracking-tight">
            {conversationId ? "Focus Conversation" : "Focus Global"}
          </h3>
          <button
            onClick={onClose}
            className="hover:bg-white/20 p-1 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Main Toggle */}
          <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  enabled
                    ? "bg-pink-100 text-pink-600"
                    : "bg-cyan-100 text-cyan-600"
                }`}
              >
                {enabled ? <BellOff size={18} /> : <Bell size={18} />}
              </div>
              <span className="font-semibold text-gray-700 text-sm">
                Mode Ne pas déranger
              </span>
            </div>
            <button
              onClick={() => setEnabled(!enabled)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
                enabled ? "bg-pink-500" : "bg-gray-300"
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                  enabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {enabled && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              {/* Schedule */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <Clock size={14} className="text-cyan-500" /> Plage horaire
                </label>
                <div className="flex items-center gap-3 p-2 bg-white border border-gray-200 rounded-lg">
                  <input
                    type="checkbox"
                    checked={schedule.enabled}
                    onChange={(e) =>
                      setSchedule({ ...schedule, enabled: e.target.checked })
                    }
                    className="accent-pink-500 h-4 w-4"
                  />
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <select
                      disabled={!schedule.enabled}
                      value={schedule.start}
                      onChange={(e) =>
                        setSchedule({ ...schedule, start: e.target.value })
                      }
                      className="bg-transparent font-medium focus:outline-none disabled:opacity-40"
                    >
                      {hourOptions}
                    </select>
                    <span className="text-gray-300">→</span>
                    <select
                      disabled={!schedule.enabled}
                      value={schedule.end}
                      onChange={(e) =>
                        setSchedule({ ...schedule, end: e.target.value })
                      }
                      className="bg-transparent font-medium focus:outline-none disabled:opacity-40"
                    >
                      {hourOptions}
                    </select>
                  </div>
                </div>
              </div>

              {/* Keywords */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <Hash size={14} className="text-cyan-500" /> Exceptions
                  urgentes
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addKeyword()}
                    placeholder="Ex: urgent..."
                    className="flex-1 text-sm p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all"
                  />
                  <button
                    onClick={addKeyword}
                    className="bg-cyan-500 text-white p-2 rounded-lg hover:bg-cyan-600 transition-colors"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {keywords.map((k) => (
                    <span
                      key={k}
                      className="px-2 py-1 bg-pink-50 text-pink-700 text-[10px] font-bold rounded-md border border-pink-100 flex items-center gap-1"
                    >
                      {k}
                      <X
                        size={10}
                        className="cursor-pointer hover:text-pink-900"
                        onClick={() => removeKeyword(k)}
                      />
                    </span>
                  ))}
                </div>
              </div>

              {/* Auto Reply */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <MessageSquare size={14} className="text-cyan-500" /> Réponse
                  auto
                </label>
                <textarea
                  value={autoReply}
                  onChange={(e) => setAutoReply(e.target.value)}
                  rows={2}
                  className="w-full text-sm p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none resize-none transition-all"
                  placeholder="Je reviens bientôt..."
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              className="flex-1 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-cyan-200 hover:shadow-cyan-300 transform hover:-translate-y-0.5 transition-all"
            >
              Enregistrer
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 border border-gray-200 text-gray-500 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DNDSettings;
