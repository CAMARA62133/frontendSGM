// ========================================
// EmailDetailPage.tsx - Design Optimisé
// ========================================

import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Reply,
  Forward,
  User,
  Paperclip,
  Clock,
  ChevronRight,
} from "lucide-react";
import type { Message } from "../../models/Message";
import { useState, useEffect } from "react";
import { getConversation, marquerCommeLu } from "../../services/messageService";
import { useAuth } from "../../context/useAuth";
import MessageFormModalProps from "./MessageForm";

// --- EmailHeader Component ---
const EmailHeader: React.FC<{ email: Message }> = ({ email }) => {
  const hasAttachment = (email.piecesJointes?.length || 0) > 0;

  return (
    <div className="border-b border-gray-100 pb-6 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-100">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight leading-tight">
              {email.sujet || "Sans sujet"}
            </h1>
            <div className="flex items-center gap-2 mt-1.5 text-sm text-gray-500">
              <span className="font-medium text-cyan-600 px-2 py-0.5 bg-cyan-50 rounded-md">
                Expéditeur
              </span>
              <ChevronRight className="w-3 h-3" />
              <span>{email.expediteur?.email}</span>
            </div>
          </div>
        </div>

        {hasAttachment && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full border border-blue-100 self-start">
            <Paperclip className="w-4 h-4" />
            <span className="text-xs font-bold">
              {email.piecesJointes?.length} fichier(s)
            </span>
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-gray-200 shadow-sm">
            <User className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">
              À l'attention de
            </span>
            <div className="flex flex-wrap gap-1 mt-0.5">
              {email.destinataires?.map((dest, i) => (
                <span key={i} className="text-xs font-medium text-gray-700">
                  {dest.email}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-gray-200 shadow-sm">
            <Clock className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">
              Date de réception
            </span>
            <span className="text-xs font-medium text-gray-700">
              {email.dateEnvoiFormatted || "Aujourd'hui"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- EmailBubble Component ---
const EmailBubble: React.FC<{
  email: Message;
  isSent: boolean;
  isMain?: boolean;
}> = ({ email, isSent, isMain = false }) => {
  const formattedDate = email.dateEnvoi
    ? new Date(email.dateEnvoi).toLocaleString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";
  const hasAttachment = (email.piecesJointes?.length || 0) > 0;

  return (
    <div
      className={`flex gap-4 mb-6 ${isSent ? "flex-row-reverse" : "flex-row"}`}
    >
      {!isMain && (
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0 ${isSent ? "bg-pink-500 ring-4 ring-pink-50" : "bg-cyan-500 ring-4 ring-cyan-50"}`}
        >
          {isSent ? "M" : email.expediteur?.email.charAt(0).toUpperCase()}
        </div>
      )}

      <div
        className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${isSent ? "items-end" : "items-start"}`}
      >
        {!isMain && (
          <div className="flex items-center gap-2 mb-1.5 px-1">
            <span className="text-xs font-bold text-gray-900">
              {isSent ? "Moi" : email.expediteur?.email}
            </span>
            <span className="text-[10px] text-gray-400 font-medium tracking-wide">
              {formattedDate}
            </span>
          </div>
        )}

        <div
          className={`relative p-4 rounded-2xl shadow-sm border ${
            isSent
              ? "bg-white border-pink-100 rounded-tr-none text-gray-800"
              : "bg-white border-gray-200 rounded-tl-none text-gray-800"
          } ${isMain ? "rounded-tr-2xl rounded-tl-2xl !p-0 !border-0" : ""}`}
        >
          <div
            className={`text-sm leading-relaxed whitespace-pre-wrap ${!isMain ? "py-1" : ""}`}
            dangerouslySetInnerHTML={{ __html: email.contenu || "" }}
          />

          {hasAttachment && !isMain && (
            <div className="mt-4 pt-3 border-t border-gray-100">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
                Documents
              </span>
              <div className="flex flex-wrap gap-2">
                {email.piecesJointes?.map((pj, i) => (
                  <a
                    key={i}
                    href={pj.chemin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-cyan-50 border border-gray-200 rounded-lg transition-colors group"
                  >
                    <Paperclip className="w-3 h-3 text-gray-400 group-hover:text-cyan-500" />
                    <span className="text-[11px] font-medium text-gray-600 group-hover:text-cyan-700 truncate max-w-[150px]">
                      {pj.nom}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Page Principale ---
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
          data[0]?.estLu === false &&
          data[0]?.destinataires?.some((d) => d.email === user?.email)
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

  const replies = conversation.length > 1 ? conversation.slice(1) : [];

  if (isLoading)
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-cyan-100 border-t-cyan-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 font-medium animate-pulse">
          Initialisation de la conversation...
        </p>
      </div>
    );

  if (!mainMessage)
    return (
      <div className="h-screen flex items-center justify-center p-6 text-center">
        <div>
          <div className="text-4xl mb-4">✉️</div>
          <h2 className="text-xl font-bold text-gray-900">
            Message introuvable
          </h2>
          <p className="text-gray-500 mb-6 mt-2">
            Ce message a peut-être été supprimé ou est inaccessible.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-gray-900 text-white rounded-full font-medium"
          >
            Retour
          </button>
        </div>
      </div>
    );

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {/* Header Sticky */}
      <header className="shrink-0 bg-white border-b border-gray-100 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-full transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="h-6 w-px bg-gray-100"></div>
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">
                Conversation
              </span>
              <span className="text-sm font-semibold text-gray-700">
                {replies.length + 1} messages
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Zone de Scroll */}
      <main className="flex-1 overflow-y-auto bg-gray-50/50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Bloc Message Principal */}
          <section className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm mb-10 transition-shadow hover:shadow-md">
            <EmailHeader email={mainMessage} />
            <EmailBubble
              email={mainMessage}
              isSent={mainMessage?.expediteur?.email === user?.email}
              isMain
            />
          </section>

          {/* Liste des Réponses */}
          {replies.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                  Réponses ({replies.length})
                </span>
                <div className="h-px w-full bg-gray-200"></div>
              </div>

              <div className="space-y-6">
                {replies.map((reply) => (
                  <EmailBubble
                    key={reply.id}
                    email={reply}
                    isSent={reply.expediteur?.email === user?.email}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer Fixe */}
      <footer className="shrink-0 bg-white border-t border-gray-100 p-4 md:p-6 z-20">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex gap-3">
            <button
              onClick={() => setIsReplyOpen(true)}
              className="group flex items-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-2xl hover:bg-cyan-700 transition-all font-bold shadow-lg shadow-cyan-200 active:scale-95"
            >
              <Reply className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Répondre
            </button>
            <button
              onClick={() => setIsForwardOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-2xl hover:border-cyan-200 hover:text-cyan-600 transition-all font-bold active:scale-95 shadow-sm"
            >
              <Forward className="w-4 h-4" />
              Transférer
            </button>
          </div>

          <div className="hidden sm:block">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
              <span className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
              Discussion active
            </div>
          </div>
        </div>
      </footer>

      {/* Modals de Formulaire */}
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
