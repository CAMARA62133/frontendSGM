import React from "react";
import type { Poll, PollOption } from "../../types/poll.type";
import { Vote, Users, Clock } from "lucide-react";

interface PollDisplayProps {
  poll: Poll;
  onVote: (optionId: number) => void;
}

const PollDisplay: React.FC<PollDisplayProps> = ({ poll, onVote }) => {
  const options: PollOption[] = poll.options || [];
  const totalVotes = options.reduce((sum, opt) => sum + opt.votes, 0);

  return (
    <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group">
      {/* En-tête du Sondage */}
      <div className="p-4 bg-gradient-to-r from-cyan-50 to-pink-50 border-b border-gray-100">
        <div className="flex items-start gap-3">
          <div className="bg-white p-2 rounded-lg shadow-sm text-cyan-600">
            <Vote size={20} />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-gray-800 leading-tight">
              {poll.question}
            </h4>
            <div className="flex items-center gap-3 mt-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              <span className="flex items-center gap-1">
                <Users size={12} /> {totalVotes} participants
              </span>
              {!poll.isActive && (
                <span className="flex items-center gap-1 text-pink-500">
                  <Clock size={12} /> Terminé
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Options de vote */}
      <div className="p-4 space-y-3">
        {options.map((option) => {
          const percentage =
            totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;

          return (
            <button
              key={option.id}
              onClick={() => onVote(option.id)}
              disabled={!poll.isActive}
              className="w-full group/option relative h-12 rounded-xl border border-gray-100 bg-gray-50/50 hover:border-cyan-200 transition-all overflow-hidden disabled:cursor-default"
            >
              {/* Barre de progression (Pink) */}
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-pink-100 to-pink-200 transition-all duration-1000 ease-out"
                style={{ width: `${percentage}%` }}
              />

              {/* Contenu de l'option */}
              <div className="absolute inset-0 px-4 flex justify-between items-center">
                <span
                  className={`text-sm font-semibold transition-colors ${
                    percentage > 50 ? "text-pink-900" : "text-gray-700"
                  }`}
                >
                  {option.text}
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-gray-400">
                    {option.votes}
                  </span>
                  <span className="text-sm font-black text-cyan-600">
                    {Math.round(percentage)}%
                  </span>
                </div>
              </div>

              {/* Effet de bordure au survol (Cyan) */}
              <div className="absolute inset-0 border-2 border-transparent group-hover/option:border-cyan-500/10 rounded-xl pointer-events-none" />
            </button>
          );
        })}

        {options.length === 0 && (
          <div className="text-center py-6">
            <p className="text-sm text-gray-400 italic">
              Aucune option disponible
            </p>
          </div>
        )}
      </div>

      {/* Footer discret */}
      <div className="px-4 py-3 bg-gray-50/50 border-t border-gray-50 flex justify-between items-center">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Sondage en temps réel
        </span>
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <div className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse delay-75" />
        </div>
      </div>
    </div>
  );
};

export default PollDisplay;
