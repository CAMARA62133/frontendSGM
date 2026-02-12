"use client";

import {
  useState,
  useMemo,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { Message } from "../../models/Message";
import {
  getMessagesRecus,
  getMessagesEnvoyes,
  getBrouillons,
  getFavoris,
  getCorbeille,
  getMessagesArchives,
  autoRefresh,
} from "../../services/messageService";
import FloatingActions, { type ActionType } from "./FloatingActions";
import MessageFilters from "./MessageFilters";
import {
  Search,
  Filter,
  RotateCw,
  Star,
  Paperclip,
  ChevronRight,
} from "lucide-react";

/**
 * 🔹 Props du composant MessagesPage
 */
interface MessagesPageProps {
  /** Dossier à afficher : reçus, brouillons, envoyés, archivés, favoris, corbeille */
  statut:
    | "recus"
    | "brouillons"
    | "envoyes"
    | "archives"
    | "favoris"
    | "corbeille";

  /** Titre affiché dans le header */
  title: string;

  /** Icône affichée à côté du titre */
  icon: ReactNode;

  /** Actions flottantes disponibles pour cette page */
  floatingActions: ActionType[];

  /** Afficher ou non le bouton de favoris sur chaque message */
  showStar?: boolean;

  /** Couleur principale pour les styles dynamiques */
  mainColor: string;

  /** Fonction pour gérer le clic sur l'icône de favoris */
  onToggleStar?: (id: string) => void;

  /** Fonction pour gérer le clic sur un message */
  onMessageClick?: (msg: Message) => void;

  /** Nombre de messages non lus */
  unreadCount?: number;
}

/**
 * 🔹 Composant MessagesPage
 * Affiche une page de messages avec :
 * - Recherche
 * - Filtres dynamiques
 * - Sélection de messages
 * - Actions flottantes
 */
export default function MessagesPage({
  statut,
  title,
  icon,
  floatingActions,
  showStar = false,
  onToggleStar,
  onMessageClick,
  unreadCount,
}: MessagesPageProps) {
  // -------------------- États locaux --------------------
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterRecipient, setFilterRecipient] = useState("");
  const [filterHasAttachment, setFilterHasAttachment] = useState(false);
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [isLoading] = useState(false);

  // -------------------- Charger les messages selon le dossier --------------------
  const fetchMessagesData = useCallback(async () => {
    try {
      let response;
      switch (statut) {
        case "recus":
          response = await getMessagesRecus();
          break;
        case "envoyes":
          response = await getMessagesEnvoyes();
          break;
        case "brouillons":
          response = await getBrouillons();
          break;
        case "archives":
          response = await getMessagesArchives();
          break;
        case "favoris":
          response = await getFavoris();
          break;
        case "corbeille":
          response = await getCorbeille();
          break;
        default:
          response = await getMessagesRecus();
      }

      // ⚡ Mise à jour fluide : seulement si les données ont changé
      setMessages((prev) => {
        const newData = response.data || [];
        return JSON.stringify(prev) !== JSON.stringify(newData)
          ? newData
          : prev;
      });
    } catch (err) {
      console.error("Erreur chargement messages:", err);
      setMessages([]);
    } finally {
      setSelectedMessages([]); // réinitialisation sélection
    }
  }, [statut]);

  // -------------------- Auto-refresh invisible --------------------
  useEffect(() => {
    const stopAutoRefresh = autoRefresh(fetchMessagesData, 8000); // toutes les 8 sec

    // Nettoyage à la désactivation du composant
    return () => stopAutoRefresh();
  }, [fetchMessagesData]);

  // -------------------- Sélection de messages --------------------
  /** Sélection/désélection d'un message individuel */
  const toggleSelectMessage = (id: string) => {
    setSelectedMessages((prev) =>
      prev.includes(id) ? prev.filter((msgId) => msgId !== id) : [...prev, id]
    );
  };

  /** Sélection/désélection de tous les messages visibles */
  const toggleSelectAll = () => {
    if (
      selectedMessages.length === filteredMessages.length &&
      filteredMessages.length > 0
    ) {
      setSelectedMessages([]);
    } else {
      setSelectedMessages(filteredMessages.map((msg) => msg.id));
    }
  };

  /** Supprimer le HTML pour afficher le texte brut */
  function stripHtml(html: string) {
    if (!html) return "";
    const temp = document.createElement("div");
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || "";
  }

  // -------------------- Filtres dynamiques --------------------
  const filteredMessages = useMemo(() => {
    return messages.filter((msg) => {
      const from = msg.expediteur?.email || msg.expediteur?.nom || "";
      const subject = msg.sujet || "";
      const body = msg.contenu || "";
      const date = msg.dateEnvoi ? new Date(msg.dateEnvoi) : null;
      const hasAttachment = (msg.piecesJointes?.length || 0) > 0;

      // Filtre recherche texte
      const matchesSearch =
        from.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        body.toLowerCase().includes(searchQuery.toLowerCase());

      // Filtre expéditeur/destinataire
      const matchesRecipient =
        !filterRecipient ||
        from.toLowerCase().includes(filterRecipient.toLowerCase());

      // Filtre pièce jointe
      const matchesAttachment = !filterHasAttachment || hasAttachment;

      // Filtre date de début
      let matchesDateFrom = true;
      if (filterDateFrom && date) {
        const df = new Date(filterDateFrom);
        df.setHours(0, 0, 0, 0);
        matchesDateFrom = date >= df;
      }

      // Filtre date de fin
      let matchesDateTo = true;
      if (filterDateTo && date) {
        const dt = new Date(filterDateTo);
        dt.setHours(23, 59, 59, 999);
        matchesDateTo = date <= dt;
      }

      return (
        matchesSearch &&
        matchesRecipient &&
        matchesAttachment &&
        matchesDateFrom &&
        matchesDateTo
      );
    });
  }, [
    messages,
    searchQuery,
    filterRecipient,
    filterHasAttachment,
    filterDateFrom,
    filterDateTo,
  ]);

  /** Réinitialiser tous les filtres */
  const clearFilters = () => {
    setSearchQuery("");
    setFilterRecipient("");
    setFilterHasAttachment(false);
    setFilterDateFrom("");
    setFilterDateTo("");
  };

  // -------------------- Rendu --------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50/60 via-cyan-50/20 to-blue-50/30 p-4">
      <div className="w-full max-w-[1400px] mx-auto flex flex-col h-[75vh]">
        {/* -------------------- HEADER -------------------- */}
        <div className="p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-sm mb-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            {/* Titre + compteur non lus */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 border border-zinc-300 rounded-xl shadow-sm">
                  <div className="text-white">{icon}</div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                  {unreadCount !== undefined && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="bg-cyan-100 text-cyan-700 px-3 py-1.5 rounded-full text-sm font-semibold">
                        {unreadCount} non-lu{unreadCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recherche + boutons */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Barre de recherche */}
              <div className="relative flex-1 min-w-[280px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher dans les messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 bg-white/80 text-sm transition-all duration-200"
                />
              </div>

              {/* Boutons filtres / recharger */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-3 rounded-xl border transition-all flex items-center gap-2 text-sm font-semibold ${
                    showFilters
                      ? "bg-cyan-50 border-cyan-200 text-cyan-700 shadow-sm"
                      : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:shadow-sm"
                  }`}
                >
                  <Filter className="w-4 h-4" /> Filtres
                </button>

                <button
                  onClick={fetchMessagesData}
                  disabled={isLoading}
                  className="p-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-xl hover:from-cyan-600 hover:to-cyan-700 transition-all shadow-sm hover:shadow-md flex items-center justify-center disabled:opacity-50"
                >
                  <RotateCw
                    className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* -------------------- FILTRES -------------------- */}
        {showFilters && (
          <div className="mb-5">
            <MessageFilters
              show={showFilters}
              filterRecipient={filterRecipient}
              setFilterRecipient={setFilterRecipient}
              filterHasAttachment={filterHasAttachment}
              setFilterHasAttachment={setFilterHasAttachment}
              filterDateFrom={filterDateFrom}
              setFilterDateFrom={setFilterDateFrom}
              filterDateTo={filterDateTo}
              setFilterDateTo={setFilterDateTo}
              clearFilters={clearFilters}
            />
          </div>
        )}

        {/* -------------------- ACTIONS FLOTTANTES -------------------- */}
        <FloatingActions
          selectedMessages={selectedMessages}
          actions={floatingActions}
          onUpdateMessages={(ids) => {
            setMessages((prev) => prev.filter((m) => !ids.includes(m.id)));
            setSelectedMessages([]);
          }}
        />

        {/* -------------------- LISTE DES MESSAGES -------------------- */}
        <div className="bg-white/80 rounded-2xl border border-white/60 shadow-sm flex-1 overflow-hidden flex flex-col">
          {/* Header de la liste */}
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100/80 border-b border-gray-200/60 flex items-center gap-4">
            <input
              type="checkbox"
              checked={
                selectedMessages.length === filteredMessages.length &&
                filteredMessages.length > 0
              }
              onChange={toggleSelectAll}
              className="w-5 h-5 text-cyan-600 rounded-lg border-gray-300 focus:ring-2 focus:ring-cyan-500/40 focus:ring-offset-1 transition-all"
            />
            <span className="text-sm font-semibold text-gray-700">
              {selectedMessages.length > 0
                ? `${selectedMessages.length} message${
                    selectedMessages.length !== 1 ? "s" : ""
                  } sélectionné${selectedMessages.length !== 1 ? "s" : ""}`
                : `${filteredMessages.length} message${
                    filteredMessages.length !== 1 ? "s" : ""
                  }`}
            </span>
          </div>

          {/* Contenu de la liste */}
          <div className="flex-1 overflow-y-auto">
            {isLoading && (
              <div className="flex items-center justify-center h-full p-8 text-gray-500">
                <RotateCw className="w-6 h-6 animate-spin mr-3 text-cyan-600" />
                <span className="text-base font-medium">
                  Chargement des messages...
                </span>
              </div>
            )}

            {!isLoading && filteredMessages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full p-8 text-gray-500">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-lg font-semibold mb-2 text-gray-600">
                  Aucun message trouvé
                </p>
                <p className="text-gray-500 text-center max-w-md">
                  {searchQuery || showFilters
                    ? "Aucun message ne correspond à vos critères de recherche."
                    : "Votre boîte de réception est vide pour le moment."}
                </p>
              </div>
            )}

            {!isLoading &&
              filteredMessages.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => onMessageClick?.(msg)}
                  className={`group relative p-5 transition-all cursor-pointer border-b border-gray-100/60 last:border-b-0
                    ${
                      !msg.estLu
                        ? "bg-cyan-25 border-l-3 border-l-cyan-500"
                        : "bg-white hover:bg-gray-50"
                    }
                    ${
                      selectedMessages.includes(msg.id)
                        ? "bg-cyan-100 border-l-3 border-l-cyan-600"
                        : ""
                    }
                    ${
                      onMessageClick
                        ? "hover:bg-cyan-25 transition-colors duration-150"
                        : ""
                    }`}
                >
                  {/* Contenu du message */}
                  <div className="flex items-start gap-4">
                    {/* Checkbox + favoris */}
                    <div className="flex items-center gap-3 mt-0.5 flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={selectedMessages.includes(msg.id)}
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => toggleSelectMessage(msg.id)}
                        className="w-5 h-5 text-cyan-600 rounded-lg border-gray-300 focus:ring-2 focus:ring-cyan-500/40 focus:ring-offset-1 transition-all"
                      />
                      {showStar && onToggleStar && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleStar(msg.id);
                          }}
                          className="transition-all hover:scale-110 p-1.5 rounded-lg hover:bg-yellow-50"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              msg.estFavori
                                ? "fill-yellow-400 text-yellow-500 drop-shadow-sm"
                                : "text-gray-300 hover:text-yellow-400 group-hover:text-yellow-400"
                            } transition-colors duration-200`}
                          />
                        </button>
                      )}
                    </div>

                    {/* Texte du message */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span
                            className={`font-bold text-sm ${
                              !msg.estLu ? "text-gray-900" : "text-gray-700"
                            }`}
                          >
                            {msg.expediteur?.nom} {msg.expediteur?.prenom}
                          </span>
                          {!msg.estLu || !msg.estEnvoye && (
                            <span className="inline-flex items-center gap-1.5 bg-cyan-500 text-white px-3 py-1 rounded-lg text-xs font-medium">
                              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                              Nouveau
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500 flex-shrink-0">
                          {msg.piecesJointes!.length > 0 && (
                            <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg">
                              <Paperclip className="w-3.5 h-3.5 text-gray-500" />
                              <span className="font-medium">
                                {msg.piecesJointes!.length}
                              </span>
                            </div>
                          )}
                          <span className="min-w-[80px] text-right font-medium bg-gray-100 px-2 py-1 rounded-lg">
                            {msg.dateEnvoi &&
                              new Date(msg.dateEnvoi).toLocaleDateString(
                                "fr-FR",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                          </span>
                        </div>
                      </div>

                      <h3
                        className={`font-bold mb-2 truncate ${
                          !msg.estLu
                            ? "text-gray-900 text-lg"
                            : "text-gray-800 text-base"
                        }`}
                      >
                        {msg.sujet}
                      </h3>
                      <p
                        className={`text-sm line-clamp-2 leading-relaxed ${
                          !msg.estLu
                            ? "text-gray-700 font-medium"
                            : "text-gray-600"
                        }`}
                      >
                        {stripHtml(msg.contenu)}
                      </p>
                    </div>

                    {/* Indicateur nouveau et flèche */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!msg.estLu && (
                        <div className="w-3 h-3 bg-cyan-500 rounded-full flex-shrink-0 shadow-sm" />
                      )}
                      {onMessageClick && (
                        <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-cyan-100 transition-colors">
                          <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-cyan-600 transition-colors" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
