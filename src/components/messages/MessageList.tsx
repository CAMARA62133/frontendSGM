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
  const [isLoading,] = useState(false);

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
  /** Sélection/désélection d’un message individuel */
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
    <div className="min-h-screen bg-gray-50 p-3 sm:p-5">
      <div className="w-full max-w-[1400px] mx-auto flex flex-col h-[calc(100vh-40px)]">
        {/* -------------------- HEADER -------------------- */}
        <div className="p-4 sm:p-6 border-b border-gray-200 bg-white rounded-lg shadow-sm mb-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Titre + compteur non lus */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {icon}
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {title}
                </h1>
              </div>
              {unreadCount !== undefined && (
                <span className="bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-sm font-medium">
                  {unreadCount} non-lu{unreadCount !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            {/* Recherche + boutons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Barre de recherche */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher dans les messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-gray-50"
                />
              </div>

              {/* Boutons filtres / recharger */}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-2.5 rounded-lg border transition-all flex items-center gap-2 text-sm font-medium ${
                    showFilters
                      ? "bg-cyan-50 border-cyan-500 text-cyan-700 shadow-sm"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Filter className="w-4 h-4" /> Filtres
                </button>

                <button
                  onClick={fetchMessagesData}
                  disabled={isLoading}
                  className="p-2.5 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors flex items-center justify-center disabled:opacity-50"
                >
                  <RotateCw
                    className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* -------------------- FILTRES -------------------- */}
        {showFilters && (
          <div className="mb-4">
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
            // Supprime les messages après action
            setMessages((prev) => prev.filter((m) => !ids.includes(m.id)));
            setSelectedMessages([]);
          }}
        />

        {/* -------------------- LISTE DES MESSAGES -------------------- */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex-1 overflow-hidden flex flex-col">
          {/* Header de la liste */}
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center gap-4">
            <input
              type="checkbox"
              checked={
                selectedMessages.length === filteredMessages.length &&
                filteredMessages.length > 0
              }
              onChange={toggleSelectAll}
              className="w-4 h-4 text-cyan-600 rounded border-gray-300 focus:ring-cyan-500"
            />
            <span className="text-sm text-gray-600 font-medium">
              {filteredMessages.length} message
              {filteredMessages.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Contenu de la liste */}
          <div className="flex-1 overflow-y-auto">
            {isLoading && (
              <div className="flex items-center justify-center h-full p-8 text-gray-500">
                <RotateCw className="w-6 h-6 animate-spin mr-2" />
                Chargement des messages...
              </div>
            )}

            {!isLoading && filteredMessages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full p-8 text-gray-500">
                <p className="text-lg font-medium mb-2">Aucun message trouvé</p>
                <p className="text-sm">
                  Aucun message ne correspond à vos critères de recherche.
                </p>
              </div>
            )}

            {!isLoading &&
              filteredMessages.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => onMessageClick?.(msg)}
                  className={`group relative p-4 transition-all cursor-pointer border-b border-gray-100
                    ${
                      !msg.estLu
                        ? "bg-blue-50 border-l-4 border-l-cyan-500"
                        : "bg-white hover:bg-gray-50"
                    }
                    ${
                      selectedMessages.includes(msg.id)
                        ? "bg-cyan-25 border-l-cyan-500"
                        : ""
                    }
                    ${onMessageClick ? "hover:shadow-sm" : ""}`}
                >
                  {/* Contenu du message */}
                  <div className="flex items-start gap-4">
                    {/* Checkbox + favoris */}
                    <div className="flex items-center gap-3 mt-1 flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={selectedMessages.includes(msg.id)}
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => toggleSelectMessage(msg.id)}
                        className="w-4 h-4 text-cyan-600 rounded border-gray-300 focus:ring-cyan-500"
                      />
                      {showStar && onToggleStar && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleStar(msg.id);
                          }}
                          className="transition-all hover:scale-110"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              msg.estFavori
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300 hover:text-yellow-400 group-hover:text-yellow-400"
                            } transition-colors`}
                          />
                        </button>
                      )}
                    </div>

                    {/* Texte du message */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`font-semibold text-sm truncate ${
                              !msg.estLu ? "text-gray-900" : "text-gray-700"
                            }`}
                          >
                            {msg.expediteur?.nom} {msg.expediteur?.prenom}
                          </span>
                          {!msg.estLu && (
                            <span className="bg-cyan-500 text-white px-2 py-0.5 rounded-full text-xs font-medium">
                              Nouveau
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500 flex-shrink-0">
                          {msg.piecesJointes!.length > 0 && (
                            <Paperclip className="w-3.5 h-3.5 text-gray-400" />
                          )}
                          <span className="min-w-[70px] text-right">
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
                        className={`font-semibold mb-1 truncate ${
                          !msg.estLu
                            ? "text-gray-900 text-base"
                            : "text-gray-800 text-sm"
                        }`}
                      >
                        {msg.sujet}
                      </h3>
                      <p
                        className={`text-sm line-clamp-2 ${
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
                        <div className="w-2 h-2 bg-cyan-500 rounded-full flex-shrink-0" />
                      )}
                      {onMessageClick && (
                        <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
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
