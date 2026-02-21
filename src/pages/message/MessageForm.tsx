import type React from "react";
import {
  useState,
  useRef,
  useCallback,
  type ChangeEvent,
  useEffect,
} from "react";
import Toolbar from "../../components/messages/Toolbar";
import { X, Paperclip, Send, Save, Loader2 } from "lucide-react";
import type { User } from "../../models/User";
import { getAllUsers } from "../../services/userService";
import type { ErrorResponse, Message } from "../../models/Message";
import { envoyerMessage } from "../../services/messageService";
import Toast from "../../components/ui/Toast";
import type { AxiosError } from "axios";
import { useAuth } from "../../context/useAuth";
import { useNavigate } from "react-router-dom";

interface MessageFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendSuccess?: () => void;
  initialRecipient?: string | string[];
  initialSubject?: string;
  initialMessage?: Message;
  threadId?: string;
  mode?: "new" | "reply" | "forward" | "draft";
}

const MessageFormModal: React.FC<MessageFormModalProps> = ({
  isOpen,
  onClose,
  onSendSuccess,
  initialRecipient,
  initialSubject,
  initialMessage,
  threadId,
  mode = "new",
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const isProcessing = isSaving || isSending;
  const [isSent, setIsSent] = useState(false);
  const navigate = useNavigate();
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "warning" | "info";
    onConfirm?: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
  } | null>(null);

  const [sujet, setSujet] = useState("");
  const [contenu, setContenu] = useState("");
  const [destinataires, setDestinataires] = useState<string[]>([]);
  const [piecesJointes, setPiecesJointes] = useState<File[]>([]);

  const [users, setUsers] = useState<User[]>([]);
  const [emailInput, setEmailInput] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const messageRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleMessageChange = useCallback(() => {
    if (messageRef.current) {
      setContenu(messageRef.current.innerHTML);
    }
  }, []);

  const executeCommand = useCallback(
    (command: string, value?: string) => {
      document.execCommand(command, false, value);
      handleMessageChange();
      messageRef.current?.focus();
    },
    [handleMessageChange],
  );

  const addRecipient = (newEmail: string) => {
    const emailTrim = newEmail.trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailTrim || !emailRegex.test(emailTrim)) {
      setToast({ message: "Adresse e-mail invalide.", type: "warning" });
      return;
    }
    setDestinataires((prev) => Array.from(new Set([...prev, emailTrim])));
    setEmailInput("");
    setFilteredUsers([]);
  };

  const removeRecipient = (emailToRemove: string) => {
    setDestinataires((prev) => prev.filter((e) => e !== emailToRemove));
  };

  const handleEmailInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmailInput(value);
    if (value.length > 0) {
      const filtered = users.filter(
        (u) =>
          u.email.toLowerCase().includes(value.toLowerCase()) &&
          !destinataires.includes(u.email),
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers([]);
    }
  };

  const handleSelectUser = (userEmail: string) => {
    addRecipient(userEmail);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setPiecesJointes((prev) => [...prev, ...newFiles]);
    }
    e.target.value = "";
  };

  const removeAttachment = (index: number) => {
    setPiecesJointes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveOrSend = useCallback(
    async (estBrouillon: boolean) => {
      if (!estBrouillon) {
        if (!sujet.trim()) {
          setToast({
            message: "Veuillez renseigner un sujet.",
            type: "warning",
          });
          return;
        }
        if (destinataires.length === 0) {
          setToast({
            message: "Ajoutez au moins un destinataire.",
            type: "warning",
          });
          return;
        }
      }

      const setProcessingState = estBrouillon ? setIsSaving : setIsSending;

      try {
        setProcessingState(true);

        const formData = new FormData();
        formData.append("sujet", sujet);
        formData.append("contenu", contenu);
        formData.append("estBrouillon", estBrouillon.toString());
        destinataires.forEach((d) => formData.append("destinataires", d));
        piecesJointes.forEach((file) => formData.append("piecesJointes", file));

        if (initialMessage?.id) {
          formData.append("messageId", initialMessage.id);
        }

        if (mode === "reply" || mode === "forward") {
          formData.append("mode", mode);
          formData.append("threadId", initialMessage?.id || "");
        } else if (threadId) {
          formData.append("threadId", threadId);
        }

        await envoyerMessage(formData);

        if (estBrouillon) {
          setToast({ message: "Brouillon sauvegardé 💾", type: "success" });
          setTimeout(() => {
            navigate("/messaging/trash");
          }, 500);
        } else {
          setToast({
            message: "Message envoyé avec succès 🎉",
            type: "success",
          });
          setIsSent(true);
          onSendSuccess?.();
          onClose();
        }
      } catch (err) {
        const axiosError = err as AxiosError<ErrorResponse>;
        const errorMessage = axiosError?.response?.data?.message;

        if (errorMessage?.includes("emailsInvalides")) {
          const invalidEmails =
            axiosError.response?.data?.emailsInvalides || [];
          setToast({
            message: `Destinataires invalides: ${invalidEmails.join(", ")}`,
            type: "error",
          });
        } else {
          setToast({
            message: errorMessage || "Erreur lors de l'opération.",
            type: "error",
          });
        }
      } finally {
        setProcessingState(false);
      }
    },
    [
      sujet,
      contenu,
      destinataires,
      piecesJointes,
      mode,
      initialMessage,
      threadId,
      onClose,
      onSendSuccess,
      navigate,
    ],
  );

  useEffect(() => {
    if (!isOpen) {
      setSujet("");
      setContenu("");
      setDestinataires([]);
      setPiecesJointes([]);
      setIsSent(false);
      return;
    }

    let defaultSujet = initialSubject || "";
    let defaultContenu = "";
    let defaultDestinataires: string[] = [];

    if (initialMessage) {
      const isDraft = initialMessage.estBrouillon;
      if (!isDraft && initialMessage.sujet) {
        defaultSujet =
          mode === "reply"
            ? `Re: ${initialMessage.sujet}`
            : mode === "forward"
              ? `Tr: ${initialMessage.sujet}`
              : initialMessage.sujet;
      } else {
        defaultSujet = initialMessage.sujet || defaultSujet;
      }

      if (mode === "reply") {
        const originalSenderEmail =
          (initialMessage.expediteur as User)?.email || "";
        defaultContenu = `<div><br></div><blockquote style="border-left:2px solid #ccc;padding-left:10px;color:#555;">De: ${originalSenderEmail}<br>Sujet: ${
          initialMessage.sujet || "Sans objet"
        }<br><br>${initialMessage.contenu || ""}</blockquote>`;
        defaultDestinataires = originalSenderEmail ? [originalSenderEmail] : [];
      } else if (mode === "forward") {
        const originalSenderEmail =
          (initialMessage.expediteur as User)?.email || "";
        defaultContenu = `<div><br></div><p>----- Message transféré -----</p><blockquote style="border-left:2px solid #ccc;padding-left:10px;color:#555;">De: ${originalSenderEmail}<br>Sujet: ${
          initialMessage.sujet || "Sans objet"
        }<br><br>${initialMessage.contenu || ""}</blockquote>`;
        defaultDestinataires = Array.isArray(initialRecipient)
          ? initialRecipient
          : initialRecipient
            ? [initialRecipient]
            : [];
      } else if (isDraft) {
        defaultContenu = initialMessage.contenu || "";
        defaultDestinataires =
          initialMessage.destinataires?.map((d) =>
            typeof d === "string" ? d : d.email,
          ) || [];
      }
    } else {
      defaultDestinataires = Array.isArray(initialRecipient)
        ? initialRecipient
        : initialRecipient
          ? [initialRecipient]
          : [];
    }

    setSujet(defaultSujet);
    setContenu(defaultContenu);
    setDestinataires(defaultDestinataires);
    if (messageRef.current) messageRef.current.innerHTML = defaultContenu;
  }, [isOpen, initialMessage, initialRecipient, initialSubject, mode]);

  useEffect(() => {
    if (!isOpen) return;
    const fetchUsers = async () => {
      try {
        const res = await getAllUsers();
        setUsers(res.data.users || []);
      } catch (e) {
        const error = e as AxiosError<{ message: string }>;
        setToast({
          message:
            error.response?.data?.message ||
            "Impossible de récupérer les utilisateurs",
          type: "error",
        });
      }
    };
    fetchUsers();
  }, [isOpen]);

  // ✅ Version finale handleClose utilisant le Toast interactif
  const handleClose = useCallback(() => {
    if (isSent || isProcessing) return;

    const hasContent =
      sujet.trim() ||
      contenu ||
      destinataires.length > 0 ||
      piecesJointes.length > 0;

    if (hasContent) {
      setToast({
        message: "Le message contient du contenu. Fermer sans sauvegarder ?",
        type: "warning", 
        confirmLabel: "Oui, fermer",
        cancelLabel: "Annuler",
        onConfirm: () => onClose(),
      });
    } else {
      onClose();
    }
  }, [
    isSent,
    isProcessing,
    sujet,
    contenu,
    destinataires,
    piecesJointes,
    onClose,
  ]);
  if (!isOpen) return null;

  const currentTitle =
    mode === "reply"
      ? "Répondre"
      : mode === "forward"
        ? "Transférer"
        : initialMessage?.estBrouillon
          ? "Modifier brouillon"
          : "Nouveau message";

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-gray-100 relative flex flex-col max-h-[95vh] overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-cyan-500 p-2 rounded-lg shadow-sm">
                <Send className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {currentTitle}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Rédigez votre message
                </p>
              </div>
            </div>
            <button
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-all duration-200"
              onClick={handleClose}
              disabled={isProcessing}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 overflow-y-auto flex-1 bg-gray-50/30">
            {/* Destinataires */}
            <div className="flex items-start gap-4">
              <label
                htmlFor="recipient-input"
                className="text-sm font-semibold text-gray-700 w-20 pt-3 shrink-0"
              >
                À:
              </label>
              <div className="flex-1 flex flex-col gap-2 relative">
                <div className="flex flex-wrap gap-2 p-3 border border-gray-200 rounded-xl bg-white focus-within:ring-2 focus-within:ring-cyan-500 focus-within:border-cyan-500 transition-all shadow-sm">
                  {destinataires.map((d) => (
                    <span
                      key={d}
                      className="bg-cyan-50 text-cyan-700 px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5 font-medium border border-cyan-200"
                    >
                      {d}
                      <button
                        onClick={() => removeRecipient(d)}
                        className="ml-1 text-cyan-500 hover:text-cyan-700 hover:bg-cyan-100 rounded-full p-0.5 transition-colors"
                        disabled={isProcessing}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    id="recipient-input"
                    type="text"
                    value={emailInput}
                    onChange={handleEmailInputChange}
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      emailInput.trim() &&
                      addRecipient(emailInput)
                    }
                    className="flex-1 outline-none bg-transparent min-w-[120px] text-gray-700 placeholder-gray-400"
                    placeholder="Ajouter un destinataire..."
                    disabled={isProcessing}
                    autoComplete="off"
                  />
                </div>

                {filteredUsers
                  .filter(
                    (u) =>
                      u.type !== "admin" &&
                      u.type !== "directeur" &&
                      u.id !== user!.id,
                  )
                  .map((u) => (
                    <div
                      key={u.id}
                      onMouseDown={() => handleSelectUser(u.email)}
                      className="px-4 py-3 hover:bg-cyan-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                    >
                      <div className="font-medium text-gray-900">
                        {u.prenom} {u.nom}
                      </div>
                      <div className="text-sm text-gray-600">{u.email}</div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Sujet */}
            <div className="flex items-center gap-4">
              <label
                htmlFor="subject-input"
                className="text-sm font-semibold text-gray-700 w-20"
              >
                Sujet:
              </label>
              <input
                id="subject-input"
                type="text"
                value={sujet}
                onChange={(e) => setSujet(e.target.value)}
                className="flex-1 border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white shadow-sm transition-all"
                placeholder="Objet du message..."
                disabled={isProcessing}
              />
            </div>

            {/* Message */}
            <div className="flex items-start gap-4">
              <label className="text-sm font-semibold text-gray-700 w-20 pt-3 shrink-0">
                Message:
              </label>
              <div className="flex-1 flex flex-col gap-3">
                <Toolbar
                  executeCommand={executeCommand}
                  disabled={isProcessing}
                />
                <div
                  ref={messageRef}
                  contentEditable={!isProcessing}
                  suppressContentEditableWarning
                  onInput={handleMessageChange}
                  className={`min-h-[300px] border border-gray-200 p-4 rounded-xl bg-white shadow-inner focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 overflow-y-auto text-gray-700 leading-relaxed prose prose-sm max-w-none ${
                    isProcessing ? "cursor-not-allowed opacity-70" : ""
                  }`}
                  style={{
                    backgroundImage: `linear-gradient(to bottom, transparent 39px, #f8fafc 1px)`,
                    backgroundSize: "100% 40px",
                    backgroundAttachment: "local",
                  }}
                />
              </div>
            </div>

            {/* Pièces jointes */}
            <div className="flex items-start gap-4 pt-4 border-t border-gray-200">
              <label className="text-sm font-semibold text-gray-700 w-20 pt-2 shrink-0">
                Fichiers:
              </label>
              <div className="flex flex-col gap-3 flex-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 rounded-xl border border-gray-200 hover:bg-gray-50 w-fit shadow-sm transition-all hover:shadow-md border-dashed hover:border-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isProcessing}
                >
                  <Paperclip className="w-4 h-4 text-cyan-500" />
                  <span className="text-cyan-600 font-medium">
                    Ajouter un fichier
                  </span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  multiple
                  onChange={handleFileChange}
                />
                <div className="flex flex-wrap gap-3">
                  {piecesJointes.map((file, index) => (
                    <div
                      key={index}
                      className="bg-white border border-gray-200 px-4 py-2.5 rounded-xl flex items-center gap-3 shadow-sm hover:shadow-md transition-all group"
                    >
                      <Paperclip className="w-4 h-4 text-cyan-500" />
                      <span className="text-sm text-gray-700 font-medium max-w-[200px] truncate">
                        {file.name}
                      </span>
                      <button
                        onClick={() => removeAttachment(index)}
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full p-1 transition-colors opacity-0 group-hover:opacity-100"
                        disabled={isProcessing}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 bg-white rounded-b-2xl">
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <Paperclip className="w-4 h-4" />
              {piecesJointes.length} fichier(s) attaché(s)
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleSaveOrSend(true)}
                className="flex items-center gap-2 px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200"
                disabled={isProcessing}
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isSaving ? "Sauvegarde..." : "Sauvegarder"}
              </button>
              <button
                onClick={() => handleSaveOrSend(false)}
                className="flex items-center gap-2 px-6 py-2.5 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600 font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isProcessing}
              >
                {isSending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {isSending ? "Envoi en cours..." : "Envoyer"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          onConfirm={toast.onConfirm}
          confirmLabel={toast.confirmLabel}
          cancelLabel={toast.cancelLabel}
        />
      )}
    </>
  );
};;

export default MessageFormModal;
