import React, { useState, useEffect } from "react";
import {
  Trash2,
  Archive,
  RefreshCcw,
  Star,
  Mail,
  MailOpen,
  Search,
  Download,
  Inbox,
} from "lucide-react";
import {
  toggleArchiveMessage,
  restaurerMessage,
  toggleFavori,
  supprimerMessage,
  marquerTousLus,
  getAllMessages,
} from "../../services/messageService";
import type { Message } from "../../models/Message";
import Toast from "../../components/ui/Toast";

// =====================================================
// Composant MessageList
// Affiche la liste des messages reçus avec filtres,
// recherche, actions (archiver, favori, supprimer…)
// =====================================================
const MessageList: React.FC = () => {
  // ---------------------------------
  // États locaux
  // ---------------------------------
  const [messages, setMessages] = useState<Message[]>([]); // Tous les messages
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]); // Messages filtrés
  const [loading, setLoading] = useState(true); // Indicateur de chargement
  const [searchTerm, setSearchTerm] = useState(""); // Texte de recherche
  const [statusFilter, setStatusFilter] = useState<
    "all" | "unread" | "read" | "favoris" | "archived"
  >("all"); // Filtre par statut
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null); // Notifications utilisateur

  // ---------------------------------
  // Fonction pour récupérer les messages
  // ---------------------------------
  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await getAllMessages();
      console.log(response.data);
      if (response.success && response.data) {
        setMessages(response.data);
      } else {
        setMessages([]);
      }
    } catch {
      setToast({
        message: "Erreur lors du chargement des messages",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------
  // useEffect : chargement initial des messages
  // ---------------------------------
  useEffect(() => {
    fetchMessages();
  }, []);

  // ---------------------------------
  // useEffect : filtrage et recherche
  // ---------------------------------
  useEffect(() => {
    let result = messages;

    // Filtrage par texte (sujet, contenu, expéditeur)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (m) =>
          m.sujet.toLowerCase().includes(term) ||
          m.contenu.toLowerCase().includes(term) ||
          m.expediteur!.nom.toLowerCase().includes(term) ||
          m.expediteur!.prenom.toLowerCase().includes(term) ||
          m.expediteur!.email.toLowerCase().includes(term)
      );
    }

    // Filtrage par statut
    if (statusFilter === "unread") result = result.filter((m) => !m.estLu);
    if (statusFilter === "read") result = result.filter((m) => m.estLu);
    if (statusFilter === "favoris") result = result.filter((m) => m.estFavori);
    if (statusFilter === "archived")
      result = result.filter((m) => m.estArchive);

    setFilteredMessages(result);
  }, [messages, searchTerm, statusFilter]);

  // ---------------------------------
  // Actions sur les messages
  // ---------------------------------

  // Marquer un message comme lu
  const handleMarkAsRead = async (id: string) => {
    try {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === id ? { ...msg, estLu: true } : msg))
      );
      setToast({ message: "Message marqué comme lu", type: "success" });
    } catch {
      setToast({ message: "Erreur lors de la mise à jour", type: "error" });
    }
  };

  // Marquer tous les messages comme lus
  const handleMarkAllAsRead = async () => {
    try {
      await marquerTousLus();
      setToast({
        message: "Tous les messages marqués comme lus",
        type: "success",
      });
      fetchMessages();
    } catch {
      setToast({ message: "Erreur lors de la mise à jour", type: "error" });
    }
  };

  // Archiver un message
  const handleArchive = async (id: string) => {
    try {
      await toggleArchiveMessage(id);
      setToast({ message: "Message archivé", type: "success" });
      fetchMessages();
    } catch {
      setToast({ message: "Erreur lors de l'archivage", type: "error" });
    }
  };

  // Restaurer un message archivé
  const handleRestore = async (id: string) => {
    try {
      await restaurerMessage(id);
      setToast({ message: "Message restauré", type: "success" });
      fetchMessages();
    } catch {
      setToast({ message: "Erreur lors de la restauration", type: "error" });
    }
  };

  // Ajouter ou retirer des favoris
  const handleFavori = async (id: string) => {
    try {
      await toggleFavori(id);
      fetchMessages();
    } catch {
      setToast({ message: "Erreur lors du changement favori", type: "error" });
    }
  };

  // Supprimer un message
  const handleDelete = async (id: string) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce message ?")) return;
    try {
      await supprimerMessage(id);
      setToast({
        message: "Message déplacé vers la corbeille",
        type: "success",
      });
      fetchMessages();
    } catch {
      setToast({ message: "Erreur lors de la suppression", type: "error" });
    }
  };
  /** Supprimer le HTML pour afficher le texte brut */
  function stripHtml(html: string) {
    if (!html) return "";
    const temp = document.createElement("div");
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || "";
  }
  // ---------------------------------
  // Affichage loading
  // ---------------------------------
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  // ---------------------------------
  // Rendu principal
  // ---------------------------------
  return (
    <div className="space-y-6">
      {/* ========================= */}
      {/* En-tête / Filtres / Recherche */}
      {/* ========================= */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Titre et résumé */}
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan-500 text-white rounded-xl">
              <Inbox size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Boîte de réception
              </h1>
              <p className="text-gray-600 mt-1">
                {filteredMessages.length} message
                {filteredMessages.length > 1 ? "s" : ""} trouvé
                {statusFilter === "unread" &&
                  ` (${messages.filter((m) => !m.estLu).length} non lus)`}
              </p>
            </div>
          </div>

          {/* Bouton marquer tous comme lus */}
          {messages.some((m) => !m.estLu) && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 flex items-center gap-2 transition-colors duration-200 font-semibold"
            >
              <MailOpen size={18} />
              Tout marquer comme lu
            </button>
          )}
        </div>

        {/* Filtres et recherche */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Recherche */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Rechercher un message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>

          {/* Filtre par statut */}
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value as
                  | "all"
                  | "unread"
                  | "read"
                  | "favoris"
                  | "archived"
              )
            }
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
          >
            <option value="all">Tous les messages</option>
            <option value="unread">Non lus</option>
            <option value="read">Lus</option>
            <option value="favoris">Favoris</option>
            <option value="archived">Archivés</option>
          </select>

          {/* Export */}
          <button className="px-4 py-3 border border-cyan-500 text-cyan-600 rounded-lg hover:bg-cyan-500 hover:text-white flex items-center justify-center gap-2 transition-colors duration-200 font-semibold">
            <Download size={18} /> Exporter
          </button>
        </div>
      </div>

      {/* ========================= */}
      {/* Liste des messages */}
      {/* ========================= */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredMessages.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="text-white" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Aucun message trouvé
            </h3>
            <p className="text-gray-600 mb-6">
              Essayez de modifier vos filtres ou rédigez un nouveau message.
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-cyan-500 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Sujet
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Expéditeur
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Date
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMessages.map((m) => (
                <tr
                  key={m.id}
                  className={`hover:bg-gray-50 transition-colors ${
                    !m.estLu ? "bg-cyan-50" : ""
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {m.estFavori && (
                        <Star
                          size={16}
                          className="text-yellow-400 fill-yellow-400"
                        />
                      )}
                      <span className="font-semibold text-gray-900">
                        {m.sujet}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm truncate max-w-xs">
                      {stripHtml(m.contenu)}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {m.expediteur?.prenom} {m.expediteur?.nom}
                    <br />
                    <span className="text-gray-500 text-xs">
                      {m.expediteur?.email}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(m.dateEnvoi).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      {/* Marquer comme lu / non lu */}
                      <button
                        onClick={() => handleMarkAsRead(m.id)}
                        className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                        title={
                          m.estLu ? "Marquer comme non lu" : "Marquer comme lu"
                        }
                      >
                        {m.estLu ? <MailOpen size={18} /> : <Mail size={18} />}
                      </button>

                      {/* Favori */}
                      <button
                        onClick={() => handleFavori(m.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          m.estFavori
                            ? "text-yellow-500 hover:bg-yellow-50"
                            : "text-gray-500 hover:bg-gray-50"
                        }`}
                        title={
                          m.estFavori
                            ? "Retirer des favoris"
                            : "Ajouter aux favoris"
                        }
                      >
                        <Star
                          size={18}
                          className={m.estFavori ? "fill-yellow-500" : ""}
                        />
                      </button>

                      {/* Archiver / Restaurer */}
                      {m.estArchive ? (
                        <button
                          onClick={() => handleRestore(m.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Restaurer"
                        >
                          <RefreshCcw size={18} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleArchive(m.id)}
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Archiver"
                        >
                          <Archive size={18} />
                        </button>
                      )}

                      {/* Supprimer */}
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ========================= */}
      {/* Notifications Toast */}
      {/* ========================= */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default MessageList;
