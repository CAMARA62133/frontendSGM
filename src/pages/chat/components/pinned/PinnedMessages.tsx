import React, { useState } from "react";
import { Pin, ChevronDown, ChevronRight, ExternalLink, X } from "lucide-react";
import type { PinnedMessage } from "../../types/pin.type";

interface PinnedMessagesProps {
  pinnedMessages: PinnedMessage[];
  onUnpin: (messageId: number) => void;
  onJumpToMessage: (messageId: number) => void;
}

const PinnedMessages: React.FC<PinnedMessagesProps> = ({
  pinnedMessages,
  onUnpin,
  onJumpToMessage,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (pinnedMessages.length === 0) return null;

  return (
    <div className="border-b border-zinc-200/60 bg-white/95 backdrop-blur-sm sticky top-0 z-10 w-full">
      {/* Header Compact */}
      <div
        className="px-4 py-2 flex items-center justify-between cursor-pointer hover:bg-zinc-50 transition-colors group select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center">
            <Pin
              size={14}
              className="text-cyan-500 -rotate-45 fill-cyan-500/10"
            />
            <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 bg-cyan-500 rounded-full border border-white"></span>
          </div>
          <span className="text-[13px] font-bold text-zinc-700">
            Épinglés
            <span className="ml-2 text-[12px] text-pink-500 font-normal">
              {pinnedMessages.length}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {!isExpanded && (
            <p className="text-[12px] text-zinc-400 truncate max-w-[180px] sm:max-w-[300px] hidden xs:block font-medium">
              {pinnedMessages[0].message?.content}
            </p>
          )}
          <div className="text-zinc-400 group-hover:text-zinc-600 transition-colors">
            {isExpanded ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </div>
        </div>
      </div>

      {/* Liste à HAUTEUR LIMITÉE (max-h-48 ~ 192px) */}
      {isExpanded && (
        <div className="max-h-30 overflow-y-auto bg-zinc-50/50 border-t border-zinc-100 scrollbar-thin scrollbar-thumb-zinc-300">
          {pinnedMessages.map((pinned) => {
            const user = pinned.message?.user;
            const userName = `${user?.prenom || ""} ${user?.nom || ""}`.trim();

            return (
              <div
                key={pinned.id}
                className="group relative px-4 py-2.5 flex items-center gap-3 hover:bg-white transition-all border-b border-zinc-100/50 last:border-0"
              >
                {/* Avatar plus petit pour gagner de la place */}
                <div className="w-7 h-7 bg-pink-500 rounded-lg flex items-center justify-center text-white text-[10px] font-bold shadow-sm flex-shrink-0">
                  {user?.prenom?.[0] || "U"}
                </div>

                {/* Contenu sur une seule ligne par défaut */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[11px] font-bold text-zinc-800 truncate">
                      {userName || "Utilisateur"}
                    </span>
                  </div>
                  <p className="text-[12px] text-zinc-500 truncate group-hover:text-zinc-700 transition-colors">
                    {pinned.message?.content}
                  </p>
                </div>

                {/* Actions minimalistes */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onJumpToMessage(pinned.messageId);
                    }}
                    className="p-1.5 text-zinc-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-md transition-all"
                  >
                    <ExternalLink size={13} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUnpin(pinned.messageId);
                    }}
                    className="p-1.5 text-zinc-400 hover:text-pink-600 hover:bg-pink-50 rounded-md transition-all"
                  >
                    <X size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PinnedMessages;
