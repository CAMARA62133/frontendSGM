import React, { useState } from "react";
import {
  Calendar,
  Clock,
  X,
  Send,
  ChevronRight,
  MessageCircle,
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface ScheduleMessageModalProps {
  onClose: () => void;
  onSchedule: (date: Date, content: string) => void;
  initialContent?: string;
}

const ScheduleMessageModal: React.FC<ScheduleMessageModalProps> = ({
  onClose,
  onSchedule,
  initialContent = "",
}) => {
  const [content, setContent] = useState(initialContent);
  const [scheduledDate, setScheduledDate] = useState(
    new Date(Date.now() + 3600000),
  );
  const [step, setStep] = useState<"content" | "datetime">("content");

  const handleNext = () => {
    if (content.trim()) setStep("datetime");
  };

  const handleSchedule = () => {
    onSchedule(scheduledDate, content);
    onClose();
  };

  const handleDateChange = (date: Date | null) => {
    if (date) setScheduledDate(date);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-[400px] shadow-2xl overflow-hidden border border-gray-100 transition-all">
        {/* Header avec indicateur de progression */}
        <div className="bg-gradient-to-r from-cyan-500 to-pink-500 p-4 text-white relative">
          <div className="flex justify-between items-center relative z-10">
            <h3 className="font-bold tracking-tight flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-lg">
                <Send size={18} />
              </div>
              Programmer
            </h3>
            <button
              onClick={onClose}
              className="hover:bg-white/20 p-1 rounded-full transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Barre de progression d'étape */}
          <div className="absolute bottom-0 left-0 h-1 bg-white/30 w-full">
            <div
              className="h-full bg-white transition-all duration-300"
              style={{ width: step === "content" ? "50%" : "100%" }}
            />
          </div>
        </div>

        <div className="p-5">
          {step === "content" ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
                  Message à envoyer
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Écrivez votre message ici..."
                  rows={5}
                  className="w-full text-sm p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none resize-none transition-all"
                  autoFocus
                />
              </div>

              <button
                onClick={handleNext}
                disabled={!content.trim()}
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-cyan-200 hover:shadow-cyan-300 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:shadow-none"
              >
                Choisir l'heure <ChevronRight size={18} />
              </button>
            </div>
          ) : (
            <div className="space-y-5 animate-in fade-in slide-in-from-left-4 duration-300">
              {/* Rappel du message (petit format) */}
              <div className="flex gap-3 p-3 bg-pink-50/50 rounded-xl border border-pink-100/50">
                <MessageCircle
                  size={16}
                  className="text-pink-500 shrink-0 mt-0.5"
                />
                <p className="text-xs text-pink-900/70 italic line-clamp-2">
                  {content}
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Calendar size={12} className="text-cyan-500" /> Date
                    d'envoi
                  </label>
                  <DatePicker
                    selected={scheduledDate}
                    onChange={handleDateChange}
                    minDate={new Date()}
                    dateFormat="dd MMMM yyyy"
                    className="w-full text-sm p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all cursor-pointer font-medium text-gray-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Clock size={12} className="text-pink-500" /> Heure précise
                  </label>
                  <input
                    type="time"
                    value={scheduledDate.toTimeString().slice(0, 5)}
                    onChange={(e) => {
                      const [hours, minutes] = e.target.value.split(":");
                      const newDate = new Date(scheduledDate);
                      newDate.setHours(parseInt(hours), parseInt(minutes));
                      setScheduledDate(newDate);
                    }}
                    className="w-full text-sm p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all font-medium text-gray-700"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSchedule}
                  className="flex-[2] py-2.5 bg-gradient-to-r from-pink-600 to-pink-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-pink-200 hover:shadow-pink-300 transition-all"
                >
                  Confirmer l'envoi
                </button>
                <button
                  onClick={() => setStep("content")}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-500 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors"
                >
                  Retour
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleMessageModal;
