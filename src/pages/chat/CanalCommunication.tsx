import React, { useEffect, useState, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";

import type { Group } from "../../models/Group";
import { useAuth } from "../../context/useAuth";
import {
  Home,
  LogOut,
  Menu,
  MessageCircleMore,
  MoreVertical,
  Pencil,
  Plus,
  Send,
  Trash2,
  Clock,
  Bell,
  TrendingUp,
  Moon,
  Vote,
  // FolderOpen,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getCollegue } from "../../services/userService";
import Toast from "../../components/ui/Toast";
import { autoRefresh } from "../../services/messageService";
import ChatModal from "./ChatModal";

import "react-datepicker/dist/react-datepicker.css";

// Imports des nouveaux composants
import { usePinnedMessages } from "./hooks/usePinnedMessages";
import { useReadReceipts } from "./hooks/useReadReceipts";
import { commandService } from "./services/commandService";
import PinnedMessages from "./components/pinned/PinnedMessages";
import SearchButton from "./components/search/SearchButton";
import GlobalSearch from "./components/search/GlobalSearch";
// import FileUploadButton from "./components/files/FileUploadButton";
import FileManager from "./components/files/FileManager";
import FileMessage from "./components/files/FileMessage";
import PollCreator from "./components/polls/PollCreator";
import PollDisplay from "./components/polls/PollDisplay";
import ScheduleMessageModal from "./components/schedule/ScheduleMessageModal";
import DNDSettings from "./components/dnd/DNDSettings";
import ThemeButton from "./components/theme/ThemeButton";
import ThemeCustomizer from "./components/theme/ThemeCustomizer";
import StatsDashboard from "./components/stats/StatsDashboard";
import CommandSuggestions from "./components/commands/CommandSuggestions";
import MessageMenu from "./components/common/MessageMenu";
import EditMessageModal from "./components/common/EditMessageModal";
import ReadReceipts from "./components/common/ReadReceipts";

import { SocketProvider } from "./contexts/SocketProvider";
import { ThemeProvider } from "./contexts/ThemeProvider";
import { useTheme } from "./contexts/useTheme";
import type { Poll, PollOption } from "./types/poll.type";
import type { Communication } from "./types/communication.type";
import { communicationService } from "./services/communicationService";
import type { User } from "../../models/User";

const CanalCommunicationContent: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { getTheme } = useTheme();

  // States principaux existants
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const hasSelection = selectedIds.length > 0;
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");
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
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] =
    useState<number>(-1);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const isSelectionEmpty = !selectedGroup && !selectedUser;

  // Nouveaux states
  const [showSearch, setShowSearch] = useState(false);
  const [showFileManager, setShowFileManager] = useState(false);
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showDNDSettings, setShowDNDSettings] = useState(false);
  const [showThemeCustomizer, setShowThemeCustomizer] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [scheduledContent, setScheduledContent] = useState("");
  const [polls, setPolls] = useState<Record<number, Poll>>({});
  const [dndEnabled, setDndEnabled] = useState(false);
  const [, setPollQuestion] = useState("");
  const [, setPollOptions] = useState(["", ""]);

  const currentConversationId = selectedGroup
    ? `group-${selectedGroup.id}`
    : selectedUser
      ? `user-${selectedUser.id}`
      : null;

  // Hooks personnalisés
  const { pinnedMessages, pinMessage, unpinMessage } = usePinnedMessages(
    currentConversationId,
  );
  const { readReceipts } = useReadReceipts(messages, currentConversationId);
  const currentTheme = getTheme(currentConversationId);

  // ------------------ Scroll auto ------------------
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ------------------------- FONCTIONS EXISTANTES -------------------------
  // Gestionnaire de sondages - VERSION CORRIGÉE
  const handleCreatePoll = (
    question: string,
    options: string[],
    expiresIn: number,
  ) => {
    // Créer un nouveau sondage
    const newPoll: Poll = {
      id: Date.now(),
      question,
      createdBy: user?.id ?? 0,
      groupId: 0, // à remplir selon ton contexte
      expiresAt: new Date(
        Date.now() + expiresIn * 60 * 60 * 1000,
      ).toISOString(),
      isActive: true,
      options: options.map((text, index) => ({
        id: index,
        pollId: Date.now(), // ou newPoll.id après création, mais ici on peut utiliser newPoll.id
        text,
        votes: 0,
      })),
    };

    // Ajouter le sondage à l'état
    setPolls((prev) => ({ ...prev, [newPoll.id]: newPoll }));

    // Réinitialiser les champs
    setPollQuestion("");
    setPollOptions(["", ""]);

    setToast({
      message: "Sondage créé avec succès",
      type: "success",
    });
  };

  const handleVotePoll = (pollId: number, optionId: number) => {
    // Mettre à jour le sondage avec le vote
    setPolls((prev) => {
      const poll = prev[pollId];
      if (!poll) return prev;

      const updatedPoll: Poll = {
        ...poll,
        options: poll.options!.map((opt: PollOption) =>
          opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt,
        ),
      };

      return { ...prev, [pollId]: updatedPoll };
    });

    setToast({
      message: "Vote enregistré",
      type: "success",
    });
  };
  // Suggestions IA
  const fetchSuggestions = async (text: string) => {
    if (!text.trim()) {
      setSuggestions([]);
      setSelectedSuggestionIndex(-1);
      return;
    }
    try {
      const res = await communicationService.askAIInput({ inputText: text });
      if (res.success) {
        setSuggestions(res.suggestions || []);
        setSelectedSuggestionIndex(-1);
      }
    } catch (err) {
      console.error("Erreur suggestions IA:", err);
      setSuggestions([]);
      setSelectedSuggestionIndex(-1);
    }
  };

  // Envoi de message
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
      user: {
        id: user.id!, // assure-toi que id n'est pas undefined
        nom: user.nom,
        prenom: user.prenom,
        photo: user.photo,
      },
      userId: user.id!, // obligatoire pour Communication
      recipientId: payload.recipientId,
      groupId: payload.groupId,
      isRead: false,
      isDeleted: false,
      isEdited: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMessage]);
    socketRef.current?.emit("sendMessage", payload);
    setInput("");
    setSuggestions([]);
    setSelectedSuggestionIndex(-1);
  };

  // Gestion des touches
  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (suggestions.length === 0 && !e.shiftKey && e.key === "Enter") {
      e.preventDefault();

      if (input.startsWith("/")) {
        const result = await commandService.parseCommand(input);
        if (result) {
          if (result.type === "poll") {
            setPollQuestion(result.question!);
            setPollOptions(result.options!);
            setShowPollCreator(true);
          } else if (result.type === "reminder") {
            setTimeout(() => {
              setToast({
                message: `🔔 Rappel: ${result.message}`,
                type: "success",
              });
            }, result.delay);
          }
          setInput("");
          return;
        }
      }

      sendMessage();
    }

    if (suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => (prev + 1) % suggestions.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedSuggestionIndex(
          (prev) => (prev - 1 + suggestions.length) % suggestions.length,
        );
      } else if (e.key === "Enter") {
        if (selectedSuggestionIndex >= 0) {
          e.preventDefault();
          setInput(suggestions[selectedSuggestionIndex]);
          setSuggestions([]);
          setSelectedSuggestionIndex(-1);
        }
      }
    }
  };

  // Raccourci clavier Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setShowSearch(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fetch unread messages
  const fetchUnreadMessages = useCallback(async () => {
    try {
      const res = await communicationService.getUnreadByConversation();
      setUnreadMessages(res.data ?? {});
    } catch (err) {
      console.error("Erreur récupération messages non lus:", err);
    }
  }, []);

  useEffect(() => {
    const stop = autoRefresh(fetchUnreadMessages, 5000);
    return () => stop();
  }, [fetchUnreadMessages]);

  // Fetch utilisateurs
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await getCollegue();

        const allMembers = (res.data.users || []).filter(
          (u) => Number(u.id) !== Number(user?.id),
        );

        const onlineIds = onlineUsers.map((u) => Number(u.id));

        const usersWithStatus: User[] = allMembers.map((u) => ({
          ...u,
          isOnline: onlineIds.includes(u.id!),
        }));

        setUsers(usersWithStatus);
      } catch (err) {
        console.error(err);
        setToast({ message: "Erreur chargement des collègues", type: "error" });
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchUsers();
  }, [user, onlineUsers]);
  // Fetch groupes
  const fetchGroups = useCallback(async () => {
    if (!user) return;
    try {
      const res = await communicationService.getUserGroups();
      setGroups(res ?? []);
    } catch (err) {
      console.error("Erreur récupération groupes:", err);
    }
  }, [user]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    if (!user) return;
    try {
      const res = await communicationService.getAll({
        recipientId: selectedUser?.id ? Number(selectedUser.id) : undefined,
        groupId: selectedGroup?.id ? Number(selectedGroup.id) : undefined,
      });
      setMessages(res ?? []);
    } catch (err) {
      console.error("Erreur récupération messages:", err);
    }
  }, [selectedUser, selectedGroup, user]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Socket.io
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

      // Sécuriser l'accès à user
      const userId = msg.user?.id ?? 0; // 0 si user undefined
      const key = msg.groupId ? `group-${msg.groupId}` : `user-${userId}`;

      const isCurrentConversation =
        (msg.groupId && selectedGroup?.id === msg.groupId) ||
        (!msg.groupId && selectedUser?.id === userId);

      if (!isCurrentConversation) {
        setUnreadMessages((prev) => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
      }
    };

    const handleOnlineUsers = (onlineIds: number[]) => {
      const formattedUsers = onlineIds.map((id) => ({ id }) as User);
      setOnlineUsers(formattedUsers);
    };

    const handleMessageDeleted = (deletedId: number | string) => {
      setMessages((prev) =>
        prev.map((m) =>
          Number(m.id) === Number(deletedId)
            ? { ...m, isDeleted: true, content: "Ce message a été supprimé" }
            : m,
        ),
      );
    };

    const handleMessageUpdated = (updatedMsg: {
      id: number;
      content: string;
    }) => {
      setMessages((prev) =>
        prev.map((m) =>
          Number(m.id) === Number(updatedMsg.id)
            ? { ...m, content: updatedMsg.content, isEdited: true }
            : m,
        ),
      );
    };

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("onlineUsersBadge", handleOnlineUsers);
    socket.on("messageDeleted", handleMessageDeleted);
    socket.on("messageUpdated", handleMessageUpdated);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("onlineUsersBadge", handleOnlineUsers);
      socket.off("messageDeleted", handleMessageDeleted);
      socket.off("messageUpdated", handleMessageUpdated);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user, selectedUser, selectedGroup]);

  // Sélection utilisateur / groupe
  const handleSelectUser = (u: User) => {
    setSelectedUser(u);
    setSelectedGroup(null);
    setUnreadMessages((prev) => ({ ...prev, [`user-${u.id}`]: 0 }));
    setIsSidebarOpen(false);
  };

  const handleSelectGroup = (g: Group) => {
    setSelectedGroup(g);
    setSelectedUser(null);
    setUnreadMessages((prev) => ({ ...prev, [`group-${g.id}`]: 0 }));
    setIsSidebarOpen(false);
  };

  // Création / édition groupe
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
        const res = await communicationService.updateGroup(editingGroup.id, {
          name: groupName.trim(),
          userIds: finalUserIds,
        });
        const updatedGroup = res;
        setGroups((prev) =>
          prev.map((g) => (g.id === updatedGroup.id ? updatedGroup : g)),
        );
        if (selectedGroup?.id === updatedGroup.id)
          setSelectedGroup(updatedGroup);
        setToast({ message: "Groupe mis à jour avec succès", type: "success" });
      } else {
        const res = await communicationService.createGroup({
          name: groupName.trim(),
          userIds: finalUserIds,
        });
        setGroups((prev) => [res, ...prev]);
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
      await communicationService.deleteGroup(groupId);
      setGroups((prev) => prev.filter((g) => g.id !== groupId));
      if (selectedGroup?.id === groupId) setSelectedGroup(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMessage = async (msg: Communication) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce message ?")) return;

    try {
      await communicationService.delete(msg.id); // ← ici
      // Si ton service ne renvoie pas success/message, tu peux adapter :
      setMessages((prev) => prev.filter((m) => m.id !== msg.id));
      setToast({ message: "Message supprimé avec succès", type: "success" });
    } catch (err) {
      console.error(err);
      setToast({ message: "Erreur lors de la suppression", type: "error" });
    }
  };
  const handleSaveEdit = async (id: number, content: string) => {
    if (!content.trim()) return;

    try {
      const res = await communicationService.update(id, {
        content: content.trim(),
      });
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, content: res.content } : m)),
      );
      setEditingMessageId(null);
      setEditingContent("");
      setToast({ message: "Message modifié avec succès", type: "success" });
    } catch (err) {
      console.error(err);
      setToast({ message: "Erreur modification message", type: "error" });
    }
  };

  // Logout
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Filtrage utilisateurs modal
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

  // Gestionnaire de fichiers
  // const handleFileUpload = async (file: File) => {
  //   console.log("Upload file:", file);
  // };

  // Gestionnaire de messages programmés
  const handleScheduleMessage = (date: Date, content: string) => {
    console.log("Schedule message:", { date, content });
    setToast({
      message: `Message programmé pour le ${date.toLocaleString()}`,
      type: "success",
    });
  };

  const toggleSelect = useCallback((id: number) => {
    setIsSelectMode(true);
    setSelectedIds((prev) => {
      const isAlreadySelected = prev.includes(id);
      if (isAlreadySelected) {
        const next = prev.filter((mid) => mid !== id);
        // Si on décoche le dernier message, on peut quitter le mode sélection
        if (next.length === 0) setIsSelectMode(false);
        return next;
      }
      return [...prev, id];
    });
  }, []);

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col lg:flex-row bg-gray-50">
      {/* Bouton menu mobile */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="lg:hidden fixed top-24 left-4 z-20 p-2.5 bg-cyan-600 text-white rounded-lg shadow-lg hover:bg-cyan-700 transition-colors"
      >
        <Menu size={20} />
      </button>

      {/* Sidebar */}
      <div
        className={`
        fixed lg:relative inset-y-0 left-0 z-30 w-80 bg-white border-r border-gray-200 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        lg:transform-none lg:static lg:z-auto
      `}
      >
        <div className="p-4 border-b border-gray-200 bg-cyan-600 flex justify-between items-center">
          <div className="flex items-center gap-3 px-2 mb-6">
            <div className="p-2 bg-cyan-600 rounded-lg shadow-sm">
              <MessageCircleMore className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-wide">
              Chats
            </h2>
          </div>
          <button
            onClick={() => setShowCreateGroup(true)}
            className="flex items-center gap-2 text-sm font-bold bg-cyan-600 text-white px-4 py-2.5 rounded-xl 
             hover:bg-cyan-700 transition-all duration-200 shadow-sm border-b-2 border-cyan-800 active:border-b-0 active:translate-y-0.5"
          >
            <Plus size={18} strokeWidth={3} />
            <span className="hidden sm:inline">Nouveau canal</span>
            <span className="sm:hidden">+</span>
          </button>
        </div>

        {/* Utilisateurs en ligne */}
        <div className="flex-1 overflow-y-auto p-4 bg-white">
          <div className="flex items-center justify-between mb-6 px-2">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-cyan-600 uppercase tracking-widest">
                Utilisateurs en ligne
              </h3>
            </div>
            <span className="bg-green-100 text-pink-600 text-[11px] font-black px-2 py-0.5 rounded-md border-b-2 border-green-200 shadow-sm">
              {
                onlineUsers.filter((u) => Number(u.id) !== Number(user?.id))
                  .length
              }
            </span>
          </div>

          <div className="space-y-2">
            {users.map((u) => {
              const isSelected = selectedUser?.id === u.id;
              const unreadCount = unreadMessages[`user-${u.id}`] || 0;

              return (
                <button
                  key={u.id}
                  onClick={() => handleSelectUser(u)}
                  className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-200 cursor-pointer ${
                    isSelected ? "bg-cyan-50 shadow-sm" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center overflow-hidden text-white font-bold text-sm shadow-sm transition-transform duration-200 ${
                        isSelected ? "bg-cyan-600 scale-105" : "bg-cyan-500"
                      }`}
                    >
                      {u.photo ? (
                        <img
                          src={`${import.meta.env.VITE_API_URL}${u.photo}`}
                          alt={`${u.prenom} ${u.nom}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <>
                          {u.nom.charAt(0).toUpperCase()}
                          {u.prenom.charAt(0).toUpperCase()}
                        </>
                      )}
                    </div>

                    {unreadCount > 0 && (
                      <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow z-10">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </div>
                    )}

                    {u.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center w-3.5 h-3.5">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500 border-2 border-white"></span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-start overflow-hidden">
                    <span
                      className={`text-sm font-semibold truncate w-full ${
                        isSelected ? "text-cyan-900" : "text-gray-700"
                      }`}
                    >
                      {u.nom} {u.prenom}
                    </span>
                    <span className="text-[10px] font-medium text-green-600">
                      {u.isOnline ? "Disponible" : "Hors ligne"}
                    </span>
                  </div>

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
                  onClick={() => handleSelectGroup(g)}
                >
                  {isSelected && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 bg-pink-500 rounded-r-full"></span>
                  )}

                  <div className="flex items-center gap-3 flex-1 relative">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm transition-transform ${
                        isSelected ? "scale-105 bg-pink-600" : "bg-pink-500"
                      }`}
                    >
                      {g.name.charAt(0).toUpperCase()}
                    </div>

                    {unreadCount > 0 && (
                      <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </div>
                    )}

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

                  {g.creatorId === Number(user?.id) && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditGroup(g);
                        }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-cyan-600 hover:bg-cyan-50"
                      >
                        <Pencil size={16} />
                      </button>
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

      {/* Overlay pour mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Chat principal */}
      <div className="flex-1 flex flex-col bg-gray-50 min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 shadow-sm z-10">
          {hasSelection ? (
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 bg-cyan-600 text-white animate-in slide-in-from-top duration-200">
              <div className="flex items-center gap-2 sm:gap-4">
                <button
                  onClick={() => {
                    setIsSelectMode(false);
                    setSelectedIds([]);
                  }}
                  className="p-2 rounded-full hover:bg-cyan-700 transition"
                >
                  ✕
                </button>
                <span className="font-bold text-xs sm:text-sm tracking-wide">
                  {selectedIds.length} sélectionné(s)
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <button
                  onClick={async () => {
                    for (const id of selectedIds) {
                      const messageToId = messages.find((m) => m.id === id);
                      if (messageToId) {
                        await handleDeleteMessage(messageToId);
                      }
                    }
                    setSelectedIds([]);
                    setIsSelectMode(false);
                  }}
                  className="flex items-center gap-1 sm:gap-2 hover:bg-cyan-700 px-2 sm:px-3 py-2 rounded-lg transition text-sm sm:text-base"
                >
                  <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                  <span className="hidden xs:inline">Supprimer</span> (
                  {selectedIds.length})
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3 sm:p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="relative flex-shrink-0">
                  {selectedUser ? (
                    selectedUser.photo ? (
                      <img
                        src={`${import.meta.env.VITE_API_URL}${selectedUser.photo}`}
                        alt="Avatar"
                        className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-full border-2 border-cyan-500 shadow-sm"
                      />
                    ) : (
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold shadow-sm uppercase tracking-wider text-sm sm:text-base">
                        {(selectedUser.nom?.[0] || "").toUpperCase()}
                        {(selectedUser.prenom?.[0] || "").toUpperCase()}
                      </div>
                    )
                  ) : selectedGroup ? (
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold shadow-sm uppercase text-sm sm:text-base">
                      {selectedGroup.name.charAt(0)}
                    </div>
                  ) : (
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center text-gray-300 border-2 border-dashed border-gray-200">
                      <MessageCircleMore className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-bold text-gray-800 leading-tight truncate">
                    {selectedUser
                      ? `${selectedUser.prenom} ${selectedUser.nom}`
                      : selectedGroup
                        ? selectedGroup.name
                        : "Aucune discussion sélectionnée"}
                  </h2>
                  <p
                    className={`text-[10px] sm:text-xs font-medium truncate ${
                      selectedUser
                        ? onlineUsers.some(
                            (u) => Number(u.id) === Number(selectedUser.id),
                          )
                          ? "text-green-600"
                          : "text-gray-400"
                        : "text-gray-500"
                    }`}
                  >
                    {selectedUser
                      ? onlineUsers.some(
                          (u) => Number(u.id) === Number(selectedUser.id),
                        )
                        ? "En ligne"
                        : "Hors ligne"
                      : selectedGroup
                        ? "Canal"
                        : ""}
                  </p>
                </div>
              </div>

              {/* Nouveaux boutons d'actions */}
              <div className="flex items-center gap-2">
                {/* Bouton Recherche */}
                <SearchButton
                  onClick={() => setShowSearch(true)}
                  className="hover:text-cyan-500 transition-colors"
                />

                {/* Bouton Statistiques */}
                <button
                  onClick={() => setShowStats(true)}
                  className="p-2 text-gray-500 hover:bg-cyan-50 hover:text-cyan-600 rounded-xl transition-all duration-200"
                  title="Statistiques"
                >
                  <TrendingUp size={20} />
                  {/* TrendingUp fait plus "Data/Stats" que BarChart */}
                </button>

                {/* Bouton Thème */}
                <ThemeButton
                  onClick={() => setShowThemeCustomizer(true)}
                  className="hover:text-pink-500 transition-colors"
                />

                {/* Bouton Ne Pas Déranger (DND) */}
                <button
                  onClick={() => setShowDNDSettings(true)}
                  className={`p-2 rounded-xl transition-all duration-300 flex items-center justify-center ${
                    dndEnabled
                      ? "bg-gradient-to-br from-pink-500 to-pink-600 text-white shadow-lg shadow-pink-200"
                      : "text-gray-500 hover:bg-pink-50 hover:text-pink-600"
                  }`}
                  title="Ne pas déranger"
                >
                  {dndEnabled ? (
                    <Moon size={20} className="animate-pulse" />
                  ) : (
                    <Bell size={20} />
                  )}
                </button>

                {/* Menu utilisateur */}
                <div className="relative flex-shrink-0">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-pink-600 hover:bg-pink-700 transition-colors duration-300"
                  >
                    {user?.photo ? (
                      <img
                        src={`${import.meta.env.VITE_API_URL}${user.photo}`}
                        alt="Avatar"
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <span className="text-white font-bold text-sm sm:text-lg">
                        {(user?.nom?.[0] || "").toUpperCase()}
                        {(user?.prenom?.[0] || "").toUpperCase()}
                      </span>
                    )}
                    <div className="absolute bottom-0 right-0 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-emerald-500 border-2 border-white rounded-full"></div>
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
                          Se déconnecter
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </header>

        {/* Messages épinglés */}
        <PinnedMessages
          pinnedMessages={pinnedMessages}
          onUnpin={unpinMessage}
          onJumpToMessage={(messageId) => {
            const element = document.getElementById(`message-${messageId}`);
            element?.scrollIntoView({ behavior: "smooth", block: "center" });
          }}
        />

        {/* Zone des messages */}
        <div
          className={`flex-1 overflow-y-auto p-3 sm:p-6 bg-gray-50/50 transition-all duration-700 ease-in-out ${
            isSelectionEmpty
              ? "opacity-0 pointer-events-none"
              : "opacity-100 pointer-events-auto"
          }`}
          style={{ backgroundColor: currentTheme.background }}
        >
          <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
            {/* Afficher les sondages */}
            {Object.values(polls).map((poll) => (
              <PollDisplay
                key={poll.id}
                poll={poll}
                onVote={(optionId) => handleVotePoll(poll.id, optionId)}
              />
            ))}

            {/* Messages */}
            {/* Messages */}
            {messages.map((msg) => {
              const isMe = msg.user?.id === user?.id;
              const isSelected = selectedIds.includes(msg.id!);

              return (
                <div
                  id={`message-${msg.id}`}
                  key={msg.id}
                  // On déplace le onClick ici pour que toute la ligne soit cliquable en mode sélection
                  onClick={() => isSelectMode && toggleSelect(msg.id!)}
                  className={`group relative flex items-end gap-2 sm:gap-3 py-1 px-2 transition-colors ${
                    isMe ? "flex-row-reverse" : "flex-row"
                  } ${isSelected ? "bg-cyan-50/50" : ""}`} // Feedback visuel sur toute la ligne
                >
                  {/* Checkbox visible seulement en mode sélection */}
                  {isSelectMode && (
                    <div className="flex items-center self-center px-1 sm:px-2 animate-in fade-in zoom-in duration-200">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation(); // Évite le double déclenchement avec le onClick du parent
                          toggleSelect(msg.id!);
                        }}
                        className="w-4 h-4 sm:w-5 sm:h-5 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                      />
                    </div>
                  )}

                  {/* Avatar (inchangé) */}
                  {!isMe && selectedGroup && (
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-cyan-100 border border-cyan-200 flex items-center justify-center overflow-hidden shadow-sm flex-shrink-0">
                      {msg.user?.photo ? (
                        <img
                          src={`${import.meta.env.VITE_API_URL}${msg.user.photo}`}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-[8px] sm:text-[10px] font-bold text-cyan-700">
                          {(msg.user?.nom?.[0] || "").toUpperCase()}
                          {(msg.user?.prenom?.[0] || "").toUpperCase()}
                        </span>
                      )}
                    </div>
                  )}

                  <div
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[85%] sm:max-w-[80%] lg:max-w-[70%]`}
                  >
                    {!isMe && (
                      <span className="text-[8px] sm:text-[10px] font-black text-cyan-600 mb-1 ml-1 uppercase tracking-widest">
                        {msg.user?.nom}
                      </span>
                    )}

                    <div className="relative group/bubble w-full">
                      {/* Bulle de message */}
                      <div
                        onClick={(e) => {
                          // Si on n'est pas encore en mode sélection, on peut quand même
                          // déclencher la sélection via un clic si on le souhaite,
                          // sinon on laisse le onClick du parent gérer.
                          if (isSelectMode) e.stopPropagation();
                          toggleSelect(msg.id!);
                        }}
                        className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-[13px] sm:text-[14px] leading-relaxed shadow-sm transition-all duration-200 cursor-pointer ${
                          isMe
                            ? "text-white rounded-br-none border"
                            : "bg-white text-gray-700 border border-gray-200 rounded-bl-none"
                        } ${isSelected ? "ring-2 ring-cyan-400 ring-offset-2 scale-[0.98]" : "hover:shadow-md"}`}
                        style={{
                          backgroundColor: isMe
                            ? currentTheme.primary
                            : currentTheme.messageBg,
                          borderColor: isMe ? currentTheme.primary : "#e5e7eb",
                        }}
                      >
                        {/* Contenu du message (Fichiers + Texte) */}
                        {msg.fileId && msg.file && (
                          <FileMessage
                            fileId={msg.fileId}
                            filename={msg.file.filename}
                            mimetype={msg.file.mimetype}
                            size={msg.file.size}
                          />
                        )}
                        <p className="whitespace-pre-wrap break-words">
                          {msg.content}
                        </p>

                        <div className="flex items-center justify-end gap-1 mt-1.5">
                          <div
                            className={`text-[8px] sm:text-[9px] font-bold uppercase tracking-tighter ${isMe ? "text-cyan-200" : "text-gray-400"}`}
                          >
                            {new Date(msg.createdAt!).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          {isMe && readReceipts[msg.id!] && (
                            <ReadReceipts receipts={readReceipts[msg.id!]} />
                          )}
                        </div>
                      </div>

                      {/* Menu flottant (masqué en mode sélection) */}
                      {!isSelectMode && (
                        <div
                          className={`absolute top-1 ${isMe ? "-left-8 sm:-left-10" : "-right-8 sm:-right-10"}`}
                        >
                          {openMenuId === msg.id ? (
                            <MessageMenu
                              message={msg}
                              isMe={isMe}
                              isPinned={pinnedMessages.some(
                                (p) => p.messageId === msg.id,
                              )}
                              onEdit={() => {
                                setEditingMessageId(msg.id!);
                                setEditingContent(msg.content);
                                setOpenMenuId(null);
                              }}
                              onDelete={() => handleDeleteMessage(msg)}
                              onPin={() => pinMessage(msg.id!)}
                              onSelect={() => {
                                setIsSelectMode(true);
                                toggleSelect(msg.id!);
                                setOpenMenuId(null);
                              }}
                              onClose={() => setOpenMenuId(null)}
                            />
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation(); // CRITIQUE : Empêche la sélection au clic sur le menu
                                setOpenMenuId(msg.id!);
                              }}
                              className="p-1 rounded-full hover:bg-gray-200 transition opacity-0 group-hover/bubble:opacity-100"
                            >
                              <MoreVertical
                                size={16}
                                className="text-gray-500"
                              />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} className="h-2" />
          </div>
        </div>

        {/* Barre de saisie avec nouveaux boutons */}
        {!isSelectionEmpty && (
          <div className="p-3 sm:p-4 bg-white border-t border-gray-100 relative">
            <div className="max-w-4xl mx-auto flex flex-col gap-1">
              {/* Barre d'outils */}

              <div className="flex items-center gap-1.5 mb-2 px-2 py-1 bg-gray-50/50 rounded-xl border border-gray-100 w-fit">
                {/* Bouton Upload (Assure-toi qu'il accepte aussi les nouvelles classes)
                <FileUploadButton
                  onFileSelect={handleFileUpload}
                  className="hover:bg-cyan-50 text-gray-500 hover:text-cyan-600 rounded-lg transition-all"
                />
 */}
                {/* Bouton Sondage */}
                <button
                  onClick={() => setShowPollCreator(true)}
                  className="p-2 text-gray-500 hover:bg-pink-50 hover:text-pink-600 rounded-lg transition-all duration-200 group"
                  title="Créer un sondage"
                >
                  <Vote
                    size={18}
                    className="group-hover:scale-110 transition-transform"
                  />
                </button>

                {/* Bouton Programmation */}
                <button
                  onClick={() => {
                    setScheduledContent(input);
                    setShowScheduleModal(true);
                  }}
                  className="p-2 text-gray-500 hover:bg-cyan-50 hover:text-cyan-600 rounded-lg transition-all duration-200 group"
                  title="Programmer un message"
                >
                  <Clock
                    size={18}
                    className="group-hover:rotate-12 transition-transform"
                  />
                </button>

                {/* Séparateur discret */}
                <div className="w-[1px] h-4 bg-gray-200 mx-1" />

                {/* Bouton Gestionnaire de fichiers (Fini l'emoji !) 
                <button
                  onClick={() => setShowFileManager(true)}
                  className="p-2 text-gray-500 hover:bg-pink-50 hover:text-pink-600 rounded-lg transition-all duration-200 group flex items-center gap-1.5"
                  title="Fichiers partagés"
                >
                  <FolderOpen
                    size={18}
                    className="group-hover:scale-110 transition-transform"
                  />
                  <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">
                    Docs
                  </span>
                </button>*/}
              </div>
              {/* Input + bouton envoyer */}
              <div className="flex items-center gap-2 sm:gap-3 bg-gray-50 border border-gray-200 rounded-2xl p-1 focus-within:border-cyan-400 focus-within:bg-white transition-all shadow-inner">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    fetchSuggestions(e.target.value);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Écrivez votre message... (/ pour les commandes)"
                  className="flex-1 bg-transparent px-3 sm:px-4 py-2 text-sm focus:outline-none min-w-0"
                  style={{ color: currentTheme.primary }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold text-white disabled:bg-gray-200 disabled:text-gray-400 shadow-sm hover:bg-cyan-700 active:scale-95 transition-all duration-200"
                  style={{ backgroundColor: currentTheme.primary }}
                >
                  <span className="hidden xs:inline">Envoyer</span>
                  <Send size={14} className="sm:w-4 sm:h-4" />
                </button>
              </div>

              {/* Suggestions IA */}
              {suggestions.length > 0 && (
                <div className="absolute bottom-full mb-2 left-3 sm:left-4 right-3 sm:right-4 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                  {suggestions.map((s, idx) => (
                    <div
                      key={idx}
                      className={`px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-cyan-100 cursor-pointer transition truncate ${
                        selectedSuggestionIndex === idx
                          ? "bg-cyan-200 font-semibold"
                          : ""
                      }`}
                      onClick={() => {
                        setInput((prev) => {
                          const words = prev.trim().split(" ");
                          words.pop();
                          return [...words, s].join(" ") + " ";
                        });
                        setSuggestions([]);
                        setSelectedSuggestionIndex(-1);
                      }}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              )}

              {/* Suggestions de commandes */}
              <CommandSuggestions
                input={input}
                onSelect={(command) => {
                  setInput(command);
                  const inputEl = document.querySelector(
                    'input[type="text"]',
                  ) as HTMLInputElement;
                  inputEl?.focus();
                }}
              />
            </div>
          </div>
        )}

        {/* Modals */}
        <ChatModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

        {showSearch && (
          <GlobalSearch
            onResultClick={(message) => {
              if (message.groupId) {
                const group = groups.find((g) => g.id === message.groupId);
                if (group) handleSelectGroup(group);
              } else {
                const user = users.find((u) => u.id === message.userId);
                if (user) handleSelectUser(user);
              }
              setTimeout(() => {
                const element = document.getElementById(
                  `message-${message.id}`,
                );
                element?.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
              }, 500);
              setShowSearch(false);
            }}
            onClose={() => setShowSearch(false)}
          />
        )}

        {showFileManager && currentConversationId && (
          <FileManager
            conversationId={currentConversationId}
            onClose={() => setShowFileManager(false)}
          />
        )}

        {showPollCreator && (
          <PollCreator
            onCreatePoll={handleCreatePoll}
            onClose={() => setShowPollCreator(false)}
          />
        )}

        {showScheduleModal && (
          <ScheduleMessageModal
            onClose={() => setShowScheduleModal(false)}
            onSchedule={handleScheduleMessage}
            initialContent={scheduledContent}
          />
        )}

        {showDNDSettings && (
          <DNDSettings
            conversationId={currentConversationId}
            onClose={() => setShowDNDSettings(false)}
            onSave={() => {
              setDndEnabled(!dndEnabled);
              setToast({ message: "Paramètres enregistrés", type: "success" });
            }}
          />
        )}

        {showThemeCustomizer && (
          <ThemeCustomizer
            currentTheme={currentTheme}
            onSave={(theme) => {
              if (currentConversationId) {
                // Sauvegarder le thème
                console.log("Save theme:", theme);
              }
            }}
            onClose={() => setShowThemeCustomizer(false)}
          />
        )}

        {showStats && <StatsDashboard onClose={() => setShowStats(false)} />}

        {/* Modal édition message */}
        {editingMessageId && (
          <EditMessageModal
            initialContent={editingContent}
            onSave={(newContent) =>
              handleSaveEdit(editingMessageId, newContent)
            }
            onClose={() => setEditingMessageId(null)}
          />
        )}

        {/* Toast */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>

      {/* Modal création groupe */}
      {showCreateGroup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-[400px] max-w-full border border-gray-100 p-4">
            <h2 className="text-lg sm:text-xl font-semibold text-cyan-600 mb-4">
              Créer un canal
            </h2>

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

            <div className="bg-gray-50 rounded-lg border border-gray-200 p-3">
              <h3 className="text-xs font-semibold text-cyan-600 mb-2 uppercase tracking-wide">
                Sélectionner les membres
              </h3>

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
                        className="rounded text-pink-500 focus:ring-pink-500 flex-shrink-0"
                      />

                      <div
                        className="w-7 h-7 sm:w-8 sm:h-8 bg-cyan-600 rounded-full 
                              flex items-center justify-center 
                              text-white text-[10px] sm:text-xs font-semibold uppercase flex-shrink-0"
                      >
                        {u.nom.charAt(0)}
                        {u.prenom.charAt(0)}
                      </div>

                      <span className="text-xs sm:text-sm text-gray-700 truncate">
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

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 mt-4">
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
    </div>
  );
};

// Wrapper avec les providers
const CanalCommunication: React.FC = () => {
  return (
    <SocketProvider>
      <ThemeProvider>
        <CanalCommunicationContent />
      </ThemeProvider>
    </SocketProvider>
  );
};

export default CanalCommunication;
