// ========================================
// EmailDetailPage.tsx - Design Compact & Pro
// ========================================

import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Reply,
  Forward,
  User,

  ChevronRight,
  MoreHorizontal,
  Download,

  Clock,
} from "lucide-react";
import type { Message } from "../../models/Message";
import { useState, useEffect } from "react";
import { getConversation, marquerCommeLu } from "../../services/messageService";
import { useAuth } from "../../context/useAuth";
import MessageFormModalProps from "./MessageForm";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

// --- Composant : En-tête Compact ---
const EmailHeader: React.FC<{ email: Message }> = ({ email }) => {
  return (
    <div className="border-b border-slate-100 pb-5 mb-5">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-100 shrink-0">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-slate-900 truncate tracking-tight">
              {email.sujet || "Sans sujet"}
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
              <span className="font-bold text-cyan-600">Expéditeur</span>
              <ChevronRight className="w-3 h-3 text-slate-300" />
              <span className="truncate">{email.expediteur?.email}</span>
            </div>
          </div>
        </div>

        {/* --- Grille d'infos resserrée --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="flex items-center gap-2.5 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
            <User className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-[9px] uppercase tracking-tighter text-slate-400 font-bold leading-none mb-1">
                À l'attention de
              </p>
              <p className="text-xs font-semibold text-slate-700 truncate">
                {email.destinataires?.map((d) => d.email).join(", ")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <p className="text-[9px] uppercase tracking-tighter text-slate-400 font-bold leading-none mb-1">
                Date d'envoi
              </p>
              <p className="text-xs font-semibold text-slate-700">
                {email.dateEnvoi
                  ? new Date(email.dateEnvoi).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "--"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Composant : Bulle de Message Compacte ---
const EmailBubble: React.FC<{
  email: Message;
  isSent: boolean;
  isMain?: boolean;
  onReply: () => void;
  onForward: () => void;
}> = ({ email, isSent, isMain = false, onReply, onForward }) => {
  const formattedDate = email.dateEnvoi
    ? new Date(email.dateEnvoi).toLocaleString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const hasAttachment = (email.piecesJointes?.length || 0) > 0;
  const getFullUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const cleanBase = API_BASE_URL.endsWith("/")
      ? API_BASE_URL.slice(0, -1)
      : API_BASE_URL;
    return `${cleanBase}${path.startsWith("/") ? path : `/${path}`}`;
  };

  return (
    <div
      className={`flex gap-3 ${isSent ? "flex-row-reverse" : "flex-row"} ${isMain ? "mb-0" : "mb-6"}`}
    >
      {!isMain && (
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] text-white font-bold shrink-0 mt-1
          ${isSent ? "bg-slate-700" : "bg-indigo-500"}`}
        >
          {isSent ? "M" : email.expediteur?.email.charAt(0).toUpperCase()}
        </div>
      )}

      <div
        className={`flex flex-col w-full max-w-[92%] md:max-w-[85%] ${isSent ? "items-end" : "items-start"}`}
      >
        {!isMain && (
          <div className="flex items-center gap-2 mb-1 px-1">
            <span className="text-xs font-bold text-slate-800">
              {isSent ? "Moi" : email.expediteur?.email}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              {formattedDate}
            </span>
          </div>
        )}

        <div
          className={`relative w-full p-4 rounded-2xl border transition-all ${
            isMain
              ? "border-transparent !p-0"
              : isSent
                ? "bg-slate-800 text-slate-100 border-slate-700 rounded-tr-none shadow-sm"
                : "bg-white border-slate-200 rounded-tl-none shadow-sm text-slate-700"
          }`}
        >
          <div
            className="text-[14px] leading-snug whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: email.contenu || "" }}
          />

          {hasAttachment && (
            <div
              className={`mt-4 pt-3 border-t grid grid-cols-1 sm:grid-cols-2 gap-2 ${isSent ? "border-white/10" : "border-slate-100"}`}
            >
              {email.piecesJointes?.map((pj, i) => (
                <a
                  key={i}
                  href={getFullUrl(pj.chemin)}
                  target="_blank"
                  rel="noreferrer"
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-[11px] font-bold ${isSent ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"}`}
                >
                  <span className="truncate pr-2">{pj.nom}</span>
                  <Download className="w-3.5 h-3.5 shrink-0 opacity-50" />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Boutons d'action resserrés */}
        <div
          className={`flex gap-2 mt-3 ${isSent ? "flex-row-reverse" : "flex-row"}`}
        >
          <button
            onClick={onReply}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-all font-bold text-[12px] shadow-sm active:scale-95"
          >
            <Reply className="w-3.5 h-3.5" /> Répondre
          </button>
          <button
            onClick={onForward}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-white text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all font-bold text-[12px] shadow-sm active:scale-95"
          >
            <Forward className="w-3.5 h-3.5" /> Transférer
          </button>
        </div>
      </div>
    </div>
  );
};

export default function EmailDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversation, setConversation] = useState<Message[]>([]);
  const [mainMessage, setMainMessage] = useState<Message | null>(null);
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [isForwardOpen, setIsForwardOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchConversation = async () => {
      setIsLoading(true);
      try {
        const res = await getConversation(id);
        const data = res.data?.conversation || [];
        setConversation(data);
        setMainMessage(data[0] || null);
        if (
          data[0] &&
          !data[0].estLu &&
          data[0].destinataires?.some((d) => d.email === user?.email)
        ) {
          await marquerCommeLu(data[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchConversation();
  }, [id, user?.email]);

  if (isLoading)
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-2 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  if (!mainMessage)
    return (
      <div className="p-10 text-center text-slate-500 font-medium">
        Message introuvable
      </div>
    );

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      <header className="flex-none bg-white border-b border-slate-200 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-bold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs uppercase tracking-tighter">Retour</span>
          </button>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Conversation
          </span>
          <MoreHorizontal className="w-5 h-5 text-slate-300 cursor-pointer" />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto">
          {/* Section principale resserrée */}
          <section className="bg-white rounded-2xl border border-slate-200 p-5 md:p-7 shadow-sm mb-8">
            <EmailHeader email={mainMessage} />
            <EmailBubble
              email={mainMessage}
              isSent={mainMessage.expediteur?.email === user?.email}
              isMain
              onReply={() => setIsReplyOpen(true)}
              onForward={() => setIsForwardOpen(true)}
            />
          </section>

          {/* Réponses avec moins d'écart */}
          <div className="space-y-4">
            {conversation.slice(1).map((reply) => (
              <EmailBubble
                key={reply.id}
                email={reply}
                isSent={reply.expediteur?.email === user?.email}
                onReply={() => setIsReplyOpen(true)}
                onForward={() => setIsForwardOpen(true)}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Formulaires (Modals) */}
      {isReplyOpen && mainMessage && (
        <MessageFormModalProps
          isOpen={isReplyOpen}
          onClose={() => setIsReplyOpen(false)}
          initialRecipient={mainMessage.expediteur?.email}
          initialSubject={`Re: ${mainMessage.sujet}`}
          initialMessage={mainMessage}
          threadId={mainMessage.id}
          mode="reply"
        />
      )}
      {isForwardOpen && mainMessage && (
        <MessageFormModalProps
          isOpen={isForwardOpen}
          onClose={() => setIsForwardOpen(false)}
          initialSubject={`Tr: ${mainMessage.sujet}`}
          initialMessage={mainMessage}
          mode="forward"
        />
      )}
    </div>
  );
}
