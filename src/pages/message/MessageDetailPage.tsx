// ========================================
// EmailDetailPage.tsx
// Page de détail d'un email / conversation
// ========================================

import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Reply, Forward, User, Paperclip } from "lucide-react";
import type { Message } from "../../models/Message";
import { useState, useEffect } from "react";
import { getConversation, marquerCommeLu } from "../../services/messageService";
import { useAuth } from "../../context/useAuth";
import MessageFormModalProps from "./MessageForm";

// ========================================
// EmailHeader Component
// Affiche les informations principales d'un email
// ========================================
interface EmailHeaderProps {
  email: Message;
}

const EmailHeader: React.FC<EmailHeaderProps> = ({ email }) => {
  // Formate la date d'envoi en français


  // Vérifie la présence de pièces jointes
  const hasAttachment = (email.piecesJointes?.length || 0) > 0;

  return (
    <div className="border-b border-gray-100 pb-4 mb-4">
      {/* Entête principal avec expéditeur et sujet */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar expéditeur */}
          <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              {email.sujet || "Sans sujet"}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-gray-600">
                {email.expediteur?.email || "Inconnu"}
              </span>
              <span className="text-gray-300">•</span>
              {email.dateEnvoiFormatted }
            </div>
          </div>
        </div>

        {/* Affiche l'icône pièce jointe si nécessaire */}
        {hasAttachment && (
          <div className="flex items-center gap-1 text-blue-600">
            <Paperclip className="w-4 h-4" />
            <span className="text-sm">{email.piecesJointes?.length}</span>
          </div>
        )}
      </div>

      {/* Informations expéditeur / destinataires */}
      <div className="bg-gray-50 rounded-md p-3">
        <div className="space-y-2 text-sm">
          {/* Expéditeur */}
          <div className="flex items-center gap-3">
            <span className="font-medium text-gray-700 min-w-8">De:</span>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center">
                <User className="w-3 h-3 text-white" />
              </div>
              <span className="text-gray-900">
                {email.expediteur?.email || "Inconnu"}
              </span>
            </div>
          </div>

          {/* Destinataires */}
          <div className="flex items-start gap-3">
            <span className="font-medium text-gray-700 min-w-8">À:</span>
            <div className="flex flex-wrap gap-1">
              {(email.destinataires || []).map((recipient, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 bg-white px-2 py-1 rounded-md border border-gray-200"
                >
                  <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center">
                    <User className="w-2 h-2 text-white" />
                  </div>
                  <span className="text-gray-700 text-sm">
                    {recipient.email}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ========================================
// EmailBubble Component
// Affiche un message individuel dans la conversation
// ========================================
interface EmailBubbleProps {
  email: Message;
  isSent: boolean; // true si l'utilisateur actuel a envoyé le message
  isMain?: boolean; // true si c'est le message principal de la conversation
}

const EmailBubble: React.FC<EmailBubbleProps> = ({
  email,
  isSent,
  isMain = false,
}) => {
  const formattedDate = email.dateEnvoi
    ? new Date(email.dateEnvoi).toLocaleString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";
  const formattedFullDate = email.dateEnvoi
    ? new Date(email.dateEnvoi).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Date inconnue";

  const hasAttachment = (email.piecesJointes?.length || 0) > 0;

  return (
    <div
      className={`flex gap-3 mb-4 ${isSent ? "justify-end" : "justify-start"}`}
    >
      {/* Avatar expéditeur si ce n'est pas l'utilisateur */}
      {!isSent && !isMain && (
        <div className="flex-shrink-0">
          <div className="w-7 h-7 bg-cyan-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
            {email.expediteur?.email.charAt(0).toUpperCase() || "U"}
          </div>
        </div>
      )}

      {/* Contenu du message */}
      <div className={`flex-1 max-w-2xl`}>
        {/* Nom expéditeur et date */}
        {!isMain && (
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`font-medium ${
                isSent ? "text-cyan-700" : "text-gray-900"
              }`}
            >
              {isSent ? "Moi" : email.expediteur?.email || "Inconnu"}
            </span>
            <span className="text-xs text-gray-500" title={formattedFullDate}>
              {formattedDate}
            </span>
          </div>
        )}

        {/* Contenu et pièces jointes */}
        <div
          className={`rounded-lg p-3 ${isSent ? "bg-cyan-50" : "bg-gray-50"}`}
        >
          <div className="prose max-w-none">
            <div
              className="whitespace-pre-wrap text-gray-800 leading-relaxed text-sm"
              dangerouslySetInnerHTML={{ __html: email.contenu || "" }}
            />
          </div>

          {hasAttachment && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center gap-1 text-xs mb-1">
                <Paperclip className="w-3 h-3 text-gray-400" />
                <span className="font-medium text-gray-600">
                  Pièces jointes :
                </span>
              </div>
              <ul className="space-y-1">
                {email.piecesJointes?.map((pj, index) => (
                  <li key={index}>
                    <a
                      href={pj.chemin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1"
                    >
                      <Paperclip className="w-3 h-3" />
                      {pj.nom} (
                      {pj.taille ? (pj.taille / 1024).toFixed(1) : "?"} KB)
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Avatar pour les messages envoyés */}
      {isSent && !isMain && (
        <div className="flex-shrink-0">
          <div className="w-7 h-7 bg-pink-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
            M
          </div>
        </div>
      )}
    </div>
  );
};

// ========================================
// EmailDetailPage Component
// Page principale de détail d'une conversation
// ========================================
export default function EmailDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [conversation, setConversation] = useState<Message[]>([]);
  const [mainMessage, setMainMessage] = useState<Message | null>(null);
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [isForwardOpen, setIsForwardOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Chargement de la conversation à l'ouverture de la page
  useEffect(() => {
    if (!id) return;

    const fetchConversation = async () => {
      setIsLoading(true);
      try {
        const res = await getConversation(id);
        const conversationData: Message[] = res.data?.conversation || [];

        setConversation(conversationData);
        setMainMessage(conversationData[0] || null);

        // Marquer comme lu si l'utilisateur est destinataire et le message n'est pas lu
        if (
          conversationData[0]?.estLu === false &&
          conversationData[0]?.destinataires?.some(
            (dest) => dest.email === user?.email
          )
        ) {
          await marquerCommeLu(conversationData[0].id);
        }
      } catch (err) {
        console.error("Erreur récupération conversation :", err);
        setConversation([]);
        setMainMessage(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversation();
  }, [id, user?.email]);

  const handleReply = () => setIsReplyOpen(true);
  const handleForward = () => setIsForwardOpen(true);

  const replies = conversation.length > 1 ? conversation.slice(1) : [];

  // Affichage écran de chargement
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto"></div>
          <p className="mt-3 text-gray-600">Chargement de la conversation...</p>
        </div>
      </div>
    );
  }

  // Affichage si conversation introuvable
  if (!mainMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-lg text-gray-500 mb-3">Conversation introuvable</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors"
          >
            Retour à la boîte de réception
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header navigation conversation */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3 p-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 px-2 py-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
          <div className="h-4 w-px bg-gray-300"></div>
          <span className="text-sm text-gray-500">
            Conversation • {replies.length + 1} message(s)
          </span>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-md border border-gray-200 p-4 mb-4">
            <EmailHeader email={mainMessage} />
            <EmailBubble
              email={mainMessage}
              isSent={mainMessage.expediteur?.email === user?.email}
              isMain
            />
          </div>

          {replies.length > 0 && (
            <div className="bg-white rounded-md border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-4 bg-cyan-500 rounded-full"></div>
                <h2 className="font-semibold text-gray-900">
                  Réponses ({replies.length})
                </h2>
              </div>
              <div className="space-y-4">
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
      </div>

      {/* Barre d'actions (Répondre / Transférer) */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-3">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={handleReply}
              className="flex items-center gap-1 px-3 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors font-medium"
            >
              <Reply className="w-4 h-4" />
              Répondre
            </button>
            <button
              onClick={handleForward}
              className="flex items-center gap-1 px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors font-medium"
            >
              <Forward className="w-4 h-4" />
              Transférer
            </button>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></div>
            {replies.length} réponse(s) dans cette conversation
          </div>
        </div>
      </div>

      {/* Modals pour répondre ou transférer */}
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
