import React, { useEffect, useState, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import {
  getCommunication,
  createGroup,
  deleteGroup,
  getUserGroups,
  updateGroup,
  getUnreadByConversation,
} from "../../services/communicationService";
import type { User } from "../../models/User";
import type { Communication } from "../../models/Communication";
import type { Group } from "../../models/Group";
import { useAuth } from "../../context/useAuth";
import {
  Home,
  LogOut,
  MessageCircleMore,
  Pencil,
  Plus,
  Send,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAllUsers } from "../../services/userService";
import Toast from "../../components/ui/Toast";
import { autoRefresh } from "../../services/messageService";

const CanalCommunication: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  // States principaux
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [messages, setMessages] = useState<Communication[]>([]);
  const [input, setInput] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedUsersForGroup, setSelectedUsersForGroup] = useState<number[]>(
    [],
  );
  const [unreadMessages, setUnreadMessages] = useState<{
    [key: string]: number;
  }>({});
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [, setLoading] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const isSelectionEmpty = !selectedGroup && !selectedUser;

  // ------------------ Scroll auto ------------------
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ------------------ Fetch unread messages ------------------
  const fetchUnreadMessages = useCallback(async () => {
    try {
      const res = await getUnreadByConversation();
      setUnreadMessages(res.data ?? {});
    } catch (err) {
      console.error("Erreur récupération messages non lus:", err);
    }
  }, []);

  useEffect(() => {
    const stop = autoRefresh(fetchUnreadMessages, 5000);
    return () => stop();
  }, [fetchUnreadMessages]);

  // ------------------ Fetch utilisateurs ------------------
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await getAllUsers();
        const allUsers = res.data.users || [];
        setUsers(allUsers.filter((u) => Number(u.id) !== Number(user?.id)));
      } catch (err) {
        console.error(err);
        setToast({ message: "Erreur chargement utilisateurs", type: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [user?.id]);

  // ------------------ Fetch groupes ------------------
  const fetchGroups = useCallback(async () => {
    if (!user) return;
    try {
      const res = await getUserGroups();
      setGroups(res.data ?? []);
    } catch (err) {
      console.error("Erreur récupération groupes:", err);
    }
  }, [user]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // ------------------ Fetch messages & socket ------------------
  const fetchMessages = useCallback(async () => {
    if (!user) return;
    try {
      const res = await getCommunication({
        recipientId: selectedUser?.id ? Number(selectedUser.id) : undefined,
        groupId: selectedGroup?.id ? Number(selectedGroup.id) : undefined,
      });
      setMessages(res.data ?? []);
    } catch (err) {
      console.error("Erreur récupération messages:", err);
    }
  }, [selectedUser, selectedGroup, user]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    if (!user) return;

    const socket = io(import.meta.env.VITE_API_URL);
    socketRef.current = socket;

    socket.emit("joinConversation", {
      userId: Number(user.id),
      recipientId: selectedUser?.id ? Number(selectedUser.id) : undefined,
      groupId: selectedGroup?.id ? Number(selectedGroup.id) : undefined,
    });

    const handleReceiveMessage = (msg: Communication) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });

      const key = msg.groupId ? `group-${msg.groupId}` : `user-${msg.user.id}`;

      // Vérifie si le message n’est pas dans la conversation ouverte
      const isCurrentConversation =
        (msg.groupId && selectedGroup?.id === msg.groupId) ||
        (!msg.groupId && selectedUser?.id === msg.user.id);

      if (!isCurrentConversation) {
        setUnreadMessages((prev) => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("onlineUsers", (users: User[]) => setOnlineUsers(users || []));

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user, selectedUser, selectedGroup]);

  // ------------------ Sélection utilisateur / groupe ------------------
  const handleSelectUser = (u: User) => {
    setSelectedUser(u);
    setSelectedGroup(null);
    setUnreadMessages((prev) => ({ ...prev, [`user-${u.id}`]: 0 }));
  };

  const handleSelectGroup = (g: Group) => {
    setSelectedGroup(g);
    setSelectedUser(null);
    setUnreadMessages((prev) => ({ ...prev, [`group-${g.id}`]: 0 }));
  };

  // ------------------ Send message ------------------
  const sendMessage = () => {
    if (!input.trim() || !user) return;

    const payload = {
      content: input.trim(),
      userId: Number(user.id),
      recipientId: selectedUser?.id ? Number(selectedUser.id) : undefined,
      groupId: selectedGroup?.id ? Number(selectedGroup.id) : undefined,
    };

    const tempMessage: Communication = {
      id: Date.now(),
      content: payload.content,
      user: user,
      recipientId: payload.recipientId,
      groupId: payload.groupId,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMessage]);
    socketRef.current?.emit("sendMessage", payload);
    setInput("");
  };

  // ------------------ Création / édition groupe ------------------
  const handleSaveGroup = async () => {
    if (!groupName.trim()) {
      setToast({ message: "Le nom du groupe est obligatoire", type: "error" });
      return;
    }
    if (selectedUsersForGroup.length === 0) {
      setToast({
        message: "Veuillez sélectionner au moins un membre",
        type: "error",
      });
      return;
    }

    try {
      const finalUserIds = Array.from(
        new Set([...selectedUsersForGroup, Number(user?.id)]),
      );
      if (editingGroup) {
        const res = await updateGroup(editingGroup.id, {
          name: groupName.trim(),
          userIds: finalUserIds,
        });
        const updatedGroup = res.data;
        setGroups((prev) =>
          prev.map((g) => (g.id === updatedGroup.id ? updatedGroup : g)),
        );
        if (selectedGroup?.id === updatedGroup.id)
          setSelectedGroup(updatedGroup);
        setToast({ message: "Groupe mis à jour avec succès", type: "success" });
      } else {
        const res = await createGroup({
          name: groupName.trim(),
          userIds: finalUserIds,
        });
        setGroups((prev) => [res.data, ...prev]);
        setToast({ message: "Groupe créé avec succès", type: "success" });
      }
      closeModal();
    } catch (err) {
      console.error(err);
      setToast({ message: "Erreur lors de l'enregistrement", type: "error" });
    }
  };

  const handleEditGroup = (group: Group) => {
    setEditingGroup(group);
    setGroupName(group.name);
    setSelectedUsersForGroup(group.Users?.map((u) => Number(u.id)) || []);
    setShowCreateGroup(true);
  };

  const closeModal = () => {
    setShowCreateGroup(false);
    setEditingGroup(null);
    setGroupName("");
    setSelectedUsersForGroup([]);
    setSearchTerm("");
  };

  const handleDeleteGroup = async (groupId: number, creatorId: number) => {
    if (Number(user?.id) !== creatorId) return;
    if (!window.confirm("Voulez-vous vraiment supprimer ce groupe ?")) return;

    try {
      await deleteGroup(groupId);
      setGroups((prev) => prev.filter((g) => g.id !== groupId));
      if (selectedGroup?.id === groupId) setSelectedGroup(null);
    } catch (err) {
      console.error(err);
    }
  };

  // ------------------ Logout ------------------
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // ------------------ Filtrage utilisateurs modal ------------------
  const filteredUsers = users.filter((u) =>
    `${u.nom} ${u.prenom}`.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const aSelected = selectedUsersForGroup.includes(Number(a.id));
    const bSelected = selectedUsersForGroup.includes(Number(b.id));
    return aSelected === bSelected ? 0 : aSelected ? -1 : 1;
  });
  const usersToDisplay =
    searchTerm === "" ? sortedUsers.slice(0, 3) : sortedUsers;

  return (
    <div className="h-[calc(100vh-80px)] flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-cyan-600 flex justify-between items-center">
          {/* Titre */}
          <div className="flex items-center gap-3 px-2 mb-6">
            {/* Conteneur de l'icône avec un fond cyan foncé pour faire ressortir le blanc */}
            <div className="p-2 bg-cyan-600 rounded-lg shadow-sm">
              <MessageCircleMore className="w-6 h-6 text-white" />
            </div>

            {/* Titre */}
            <h2 className="text-xl font-bold text-white tracking-wide">
              Chats
            </h2>
          </div>
          {/* Bouton */}
          <button
            onClick={() => setShowCreateGroup(true)}
            className="flex items-center gap-2 text-sm font-bold bg-cyan-600 text-white px-4 py-2.5 rounded-xl 
             hover:bg-cyan-700 transition-all duration-200 shadow-sm border-b-2 border-cyan-800 active:border-b-0 active:translate-y-0.5"
          >
            <Plus size={18} strokeWidth={3} />
            <span>Nouveau canal</span>
          </button>
        </div>

        {/* Utilisateurs en ligne */}
        <div className="flex-1 overflow-y-auto p-4 bg-white">
          {/* En-tête de section */}
          <div className="flex items-center justify-between mb-6 px-2">
            <div className="flex items-center gap-2">
              <div className="relative flex items-center justify-center">
                <span className="absolute inline-flex h-3 w-3 rounded-full bg-green-400 opacity-75 animate-ping"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </div>
              <h3 className="text-xs font-bold text-cyan-600 uppercase tracking-widest">
                Utilisateurs en ligne
              </h3>
            </div>

            {/* Badge stylisé du nombre d’utilisateurs en ligne */}
            <span className="bg-green-100 text-pink-600 text-[11px] font-black px-2 py-0.5 rounded-md border-b-2 border-green-200 shadow-sm">
              {onlineUsers.length}
            </span>
          </div>

          {/* Liste des utilisateurs */}
          <div className="space-y-2">
            {onlineUsers.map((u) => {
              const isSelected = selectedUser?.id === u.id;
              const unreadCount = unreadMessages[`user-${u.id}`] || 0;

              return (
                <button
                  key={u.id}
                  onClick={() => handleSelectUser(u)} // ← utilise la fonction
                  className={`w-full group flex items-center gap-4 p-3 rounded-xl transition-all duration-200 cursor-pointer ${
                    isSelected ? "bg-cyan-50 shadow-sm" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    {/* Avatar */}
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm transition-transform duration-200 ${
                        isSelected ? "bg-cyan-600 scale-105" : "bg-cyan-500"
                      }`}
                    >
                      {u.nom.charAt(0)}
                      {u.prenom.charAt(0)}
                    </div>

                    {/* Pastille rouge pour notifications non lues */}
                    {unreadCount > 0 && (
                      <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </div>
                    )}

                    {/* Point vert en ligne */}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>

                  {/* Informations texte */}
                  <div className="flex flex-col items-start overflow-hidden">
                    <span
                      className={`text-sm font-semibold truncate w-full transition-colors ${
                        isSelected
                          ? "text-cyan-900"
                          : "text-gray-700 group-hover:text-gray-900"
                      }`}
                    >
                      {u.nom} {u.prenom}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-medium text-green-600">
                        Disponible
                      </span>
                    </div>
                  </div>

                  {/* Indicateur de sélection discret à droite */}
                  {isSelected && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Groupes */}
        <div className="p-4 border-t border-gray-100 bg-white">
          {/* Titre avec une typographie plus travaillée */}
          <h3 className="text-[11px] font-bold text-cyan-600 mb-4 uppercase tracking-[0.2em] px-1">
            Canaux de discussion
          </h3>

          <div className="flex flex-col gap-2">
            {groups.map((g) => {
              const isSelected = selectedGroup?.id === g.id;
              const unreadCount = unreadMessages[`group-${g.id}`] || 0;

              return (
                <div
                  key={g.id}
                  className={`relative group p-3 rounded-xl flex items-center justify-between transition-all duration-200 cursor-pointer ${
                    isSelected ? "bg-pink-50 shadow-sm" : "hover:bg-gray-50"
                  }`}
                  onClick={() => handleSelectGroup(g)} // <-- utilise la fonction pour reset notifications
                >
                  {/* Barre de sélection affinée */}
                  {isSelected && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 bg-pink-500 rounded-r-full"></span>
                  )}

                  {/* Contenu gauche */}
                  <div className="flex items-center gap-3 flex-1 relative">
                    {/* Avatar : on garde le rose mais avec un rendu plus "flat/premium" */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm transition-transform ${
                        isSelected ? "scale-105 bg-pink-600" : "bg-pink-500"
                      }`}
                    >
                      {g.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Badge notifications rouge */}
                    {unreadCount > 0 && (
                      <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </div>
                    )}

                    {/* Textes */}
                    <div className="flex flex-col min-w-0 ml-2">
                      <span
                        className={`text-sm font-bold truncate ${
                          isSelected ? "text-pink-700" : "text-gray-800"
                        }`}
                      >
                        {g.name}
                      </span>
                      <span
                        className={`text-[11px] ${
                          isSelected ? "text-pink-400" : "text-gray-400"
                        }`}
                      >
                        Canal de discussion
                      </span>
                    </div>
                  </div>

                  {/* Boutons éditer / supprimer */}
                  {g.creatorId === Number(user?.id) && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      {/* BOUTON ÉDITER */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditGroup(g);
                        }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-cyan-600 hover:bg-cyan-50"
                      >
                        <Pencil size={16} />
                      </button>

                      {/* BOUTON SUPPRIMER */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteGroup(g.id, g.creatorId);
                        }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* --- HEADER --- */}
        <header className="bg-white border-b border-gray-100 p-4 flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center gap-4">
            {/* Avatar dynamique */}
            <div className="relative">
              {selectedUser ? (
                <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold shadow-sm uppercase tracking-wider">
                  {selectedUser.nom.charAt(0)}
                  {selectedUser.prenom.charAt(0)}
                </div>
              ) : selectedGroup ? (
                <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold shadow-sm uppercase">
                  {selectedGroup.name.charAt(0)}
                </div>
              ) : (
                /* Icône par défaut */
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-300 border-2 border-dashed border-gray-200">
                  <MessageCircleMore className="w-6 h-6" />
                </div>
              )}
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-800 leading-tight">
                {selectedUser ? (
                  `${selectedUser.prenom} ${selectedUser.nom}`
                ) : selectedGroup ? (
                  selectedGroup.name
                ) : (
                  <span className="text-gray-400 font-medium italic">
                    Aucune discussion sélectionnée
                  </span>
                )}
              </h2>
              <p className="text-xs font-medium text-green-600 flex items-center gap-1">
                {selectedUser ? "En ligne actuellement" : "Canal de discussion"}
              </p>
            </div>
          </div>

          {/* Menu Utilisateur (Ton Profil) */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="w-10 h-10 flex items-center justify-center gap-2 
                       rounded-full bg-pink-600 hover:bg-pink-700 
                       transition-colors duration-300"
            >
              {user?.photo ? (
                <img
                  src={`${import.meta.env.VITE_API_URL}${user.photo}`}
                  alt="Avatar"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span className="text-white font-bold text-lg">
                  {(user?.prenom?.[0] || "").toUpperCase()}
                  {(user?.nom?.[0] || "").toUpperCase()}
                </span>
              )}

              {/* Pastille "En ligne" */}
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></div>
            </button>

            {userMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setUserMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md border border-gray-200 py-1 z-50 shadow-lg">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {user?.prenom} {user?.nom}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email}
                    </p>
                  </div>

                  {/* Accueil */}
                  <button
                    onClick={() => navigate("/vitrine")}
                    className="w-full px-4 py-2 flex items-center gap-2 text-sm font-medium text-gray-700 hover:bg-cyan-50 hover:text-cyan-700 transition"
                  >
                    <Home className="w-4 h-4" />
                    Accueil
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-3 py-2 text-left text-red-600 hover:bg-red-50 text-sm"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Se déconnecter</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </header>
        {/* --- ZONE MESSAGES --- */}
        <div
          className={`flex-1 overflow-y-auto p-6 bg-gray-50/50 transition-all duration-700 ease-in-out ${
            isSelectionEmpty
              ? "opacity-0 pointer-events-none"
              : "opacity-100 pointer-events-auto"
          }`}
        >
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((msg) => {
              const isMe = msg.user?.id === user?.id;
              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                    isMe ? "justify-end" : "justify-start"
                  }`}
                >
                  {/* Avatar miniature pour les autres */}
                  {!isMe && (
                    <div className="w-8 h-8 rounded-full bg-cyan-100 border border-cyan-200 flex items-center justify-center text-[10px] font-bold text-cyan-700 shadow-sm flex-shrink-0">
                      {msg.user?.nom?.charAt(0)}
                    </div>
                  )}

                  <div
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[80%] lg:max-w-[70%]`}
                  >
                    {!isMe && (
                      <span className="text-[10px] font-black text-cyan-600 mb-1 ml-1 uppercase tracking-widest">
                        {msg.user?.nom}
                      </span>
                    )}

                    <div
                      className={`px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed shadow-sm transition-all duration-200 ${
                        isMe
                          ? "bg-cyan-600 text-white rounded-br-none border border-cyan-700"
                          : "bg-white text-gray-700 border border-gray-200 rounded-bl-none"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      <div
                        className={`text-[9px] mt-1.5 flex justify-end font-bold uppercase tracking-tighter ${
                          isMe ? "text-cyan-200" : "text-gray-400"
                        }`}
                      >
                        {new Date(msg.createdAt!).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} className="h-2"></div>
          </div>
        </div>
        {/* --- BARRE DE SAISIE --- */}
        {/* On n'affiche la barre de saisie que si une sélection existe */}
        {!isSelectionEmpty && (
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="max-w-4xl mx-auto flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl p-1.5 focus-within:border-cyan-400 focus-within:bg-white transition-all shadow-inner">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Écrivez votre message..."
                className="flex-1 bg-transparent px-4 py-2 text-sm focus:outline-none"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-cyan-600 text-white disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed shadow-sm hover:bg-cyan-700 hover:shadow-md active:scale-95 transition-all duration-200"
              >
                <span>Envoyer</span>
                <Send
                  size={16}
                  className={`transition-all duration-300 ${
                    input.trim()
                      ? "translate-x-0 opacity-100 scale-100"
                      : "-translate-x-1 opacity-50 scale-90"
                  }`}
                />
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Modal création groupe */}
      {showCreateGroup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-[400px] max-w-[95%] border border-gray-100 p-4">
            {/* Titre */}
            <h2 className="text-xl font-semibold text-cyan-600 mb-4">
              Créer un canal
            </h2>

            {/* Input Nom */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Nom du groupe"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full p-2.5 text-sm rounded-lg border border-gray-200 bg-gray-50 
                   focus:bg-white focus:outline-none 
                   focus:ring-2 focus:ring-cyan-600 focus:border-cyan-600 transition"
              />
            </div>

            {/* Zone Membres */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-3">
              <h3 className="text-xs font-semibold text-cyan-600 mb-2 uppercase tracking-wide">
                Sélectionner les membres
              </h3>

              {/* Recherche */}
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-2 text-sm rounded-md border border-gray-200 bg-white 
                     focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-cyan-600 transition"
                />
              </div>

              {/* Liste */}
              <div className="max-h-40 overflow-y-auto space-y-1">
                {usersToDisplay.length > 0 ? (
                  usersToDisplay.map((u) => (
                    <label
                      key={u.id}
                      className="flex items-center gap-2 p-2 rounded-lg 
                         hover:bg-cyan-50 transition cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedUsersForGroup.includes(Number(u.id))}
                        value={u.id}
                        onChange={(e) => {
                          const id = Number(e.target.value);
                          setSelectedUsersForGroup((prev) =>
                            e.target.checked
                              ? [...prev, id]
                              : prev.filter((uid) => uid !== id),
                          );
                        }}
                        className="rounded text-pink-500 focus:ring-pink-500"
                      />

                      <div
                        className="w-8 h-8 bg-cyan-600 rounded-full 
                              flex items-center justify-center 
                              text-white text-xs font-semibold uppercase"
                      >
                        {u.nom.charAt(0)}
                        {u.prenom.charAt(0)}
                      </div>

                      <span className="text-sm text-gray-700">
                        {u.nom} {u.prenom}
                      </span>
                    </label>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 text-center py-2">
                    Aucun utilisateur trouvé.
                  </p>
                )}
              </div>

              {searchTerm === "" && users.length > 4 && (
                <p className="text-xs text-gray-400 italic mt-2 text-center">
                  + {users.length - 3} autres utilisateurs.
                </p>
              )}
            </div>

            {/* Boutons */}
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 
             text-gray-700 hover:bg-gray-100 transition"
                onClick={closeModal}
              >
                Annuler
              </button>

              <button
                className={`px-4 py-2 text-sm rounded-lg font-medium shadow-sm transition active:scale-95 
    ${
      !groupName.trim() || selectedUsersForGroup.length === 0
        ? "bg-gray-300 cursor-not-allowed text-gray-500"
        : "bg-pink-500 hover:bg-pink-600 text-white"
    }`}
                onClick={handleSaveGroup}
              >
                {editingGroup ? "Enregistrer" : "Créer"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Notification Toast */}
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

export default CanalCommunication;
