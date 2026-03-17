// import React, { useEffect, useState, useRef, useCallback } from "react";
// import { io, Socket } from "socket.io-client";
// import {
//   getCommunication,
//   createGroup,
//   deleteGroup,
//   getUserGroups,
//   updateGroup,
//   getUnreadByConversation,
//   deleteCommunication,
//   updateCommunication,
//   askAIInput,
// } from "./services/communicationService";
// import type { User } from "../../models/User";
// import type { Communication } from "../../models/Communication";
// import type { Group } from "../../models/Group";
// import { useAuth } from "../../context/useAuth";
// import {
//   CheckSquare,
//   Home,
//   LogOut,
//   Menu,
//   MessageCircleMore,
//   MessageSquare,
//   MoreVertical,
//   Pencil,
//   Plus,
//   Send,
//   Trash2,
// } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import { getCollegue } from "../../services/userService";
// import Toast from "../../components/ui/Toast";
// import { autoRefresh } from "../../services/messageService";
// import ChatModal from "./ChatModal";

// type UserWithStatus = User & { isOnline: boolean };

// const CanalCommunication: React.FC = () => {
//   const { logout, user } = useAuth();
//   const navigate = useNavigate();

//   // States principaux
//   const [userMenuOpen, setUserMenuOpen] = useState(false);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [messages, setMessages] = useState<Communication[]>([]);
//   const [input, setInput] = useState("");
//   const [selectedUser, setSelectedUser] = useState<User | null>(null);
//   const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
//   const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
//   const [groups, setGroups] = useState<Group[]>([]);
//   const [showCreateGroup, setShowCreateGroup] = useState(false);
//   const [groupName, setGroupName] = useState("");
//   const [selectedUsersForGroup, setSelectedUsersForGroup] = useState<number[]>(
//     [],
//   );
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);

//   const [selectedIds, setSelectedIds] = useState<number[]>([]);

//   const hasSelection = selectedIds.length > 0;
//   const [isSelectMode, setIsSelectMode] = useState(false);
//   const [openMenuId, setOpenMenuId] = useState<number | null>(null);
//   const menuRef = useRef<HTMLDivElement | null>(null);

//   const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
//   const [editingContent, setEditingContent] = useState("");
//   // const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
//   const [unreadMessages, setUnreadMessages] = useState<{
//     [key: string]: number;
//   }>({});
//   const [editingGroup, setEditingGroup] = useState<Group | null>(null);
//   const [users, setUsers] = useState<UserWithStatus[]>([]);
//   const [, setLoading] = useState(true);
//   const [toast, setToast] = useState<{
//     message: string;
//     type: "success" | "error";
//   } | null>(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   // ------------------------- STATE -------------------------

//   const [suggestions, setSuggestions] = useState<string[]>([]);
//   const [selectedSuggestionIndex, setSelectedSuggestionIndex] =
//     useState<number>(-1); // pour navigation clavier
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const socketRef = useRef<Socket | null>(null);

//   const isSelectionEmpty = !selectedGroup && !selectedUser;

//   // ------------------ Scroll auto ------------------
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
//         setOpenMenuId(null);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   // ------------------------- FONCTIONS -------------------------

//   // 1️⃣ Récupérer les suggestions IA à partir du service existant
//   const fetchSuggestions = async (text: string) => {
//     if (!text.trim()) {
//       setSuggestions([]);
//       setSelectedSuggestionIndex(-1);
//       return;
//     }

//     try {
//       const res = await askAIInput({ inputText: text });

//       if (res.success) {
//         setSuggestions(res.suggestions || []);
//         setSelectedSuggestionIndex(-1);
//       }
//     } catch (err) {
//       console.error("Erreur suggestions IA:", err);
//       setSuggestions([]);
//       setSelectedSuggestionIndex(-1);
//     }
//   };

//   // ------------------ Send message ------------------
//   const sendMessage = () => {
//     if (!input.trim() || !user) return;

//     // Préparer le payload pour le socket
//     const payload = {
//       content: input.trim(),
//       userId: Number(user.id),
//       recipientId: selectedUser?.id ? Number(selectedUser.id) : undefined,
//       groupId: selectedGroup?.id ? Number(selectedGroup.id) : undefined,
//     };

//     // Message temporaire pour affichage immédiat (optimistic update)
//     const tempMessage: Communication = {
//       id: Date.now(), // ID temporaire unique
//       content: payload.content,
//       user: user,
//       recipientId: payload.recipientId,
//       groupId: payload.groupId,
//       createdAt: new Date().toISOString(),
//     };

//     // Ajouter le message au state
//     setMessages((prev) => [...prev, tempMessage]);

//     // Envoyer via socket
//     socketRef.current?.emit("sendMessage", payload);

//     // Nettoyer input et suggestions IA
//     setInput("");
//     setSuggestions([]);
//     setSelectedSuggestionIndex(-1);
//   };
//   // 3️⃣ Sélection clavier (haut/bas) + entrée
//   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (suggestions.length === 0) return;

//     if (e.key === "ArrowDown") {
//       e.preventDefault();
//       setSelectedSuggestionIndex((prev) => (prev + 1) % suggestions.length);
//     } else if (e.key === "ArrowUp") {
//       e.preventDefault();
//       setSelectedSuggestionIndex(
//         (prev) => (prev - 1 + suggestions.length) % suggestions.length,
//       );
//     } else if (e.key === "Enter") {
//       if (selectedSuggestionIndex >= 0) {
//         e.preventDefault();
//         setInput(suggestions[selectedSuggestionIndex]);
//         setSuggestions([]);
//         setSelectedSuggestionIndex(-1);
//       } else {
//         sendMessage();
//       }
//     }
//   };
//   // ------------------ Fetch unread messages ------------------
//   const fetchUnreadMessages = useCallback(async () => {
//     try {
//       const res = await getUnreadByConversation();
//       setUnreadMessages(res.data ?? {});
//     } catch (err) {
//       console.error("Erreur récupération messages non lus:", err);
//     }
//   }, []);

//   useEffect(() => {
//     const stop = autoRefresh(fetchUnreadMessages, 5000);
//     return () => stop();
//   }, [fetchUnreadMessages]);

//   // ------------------ Fetch utilisateurs ------------------
//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         setLoading(true);
//         const res = await getCollegue();
//         const allMembers = (res.data.users || []).filter(
//           (u: User) => Number(u.id) !== Number(user?.id),
//         );

//         // Séparer en ligne / hors ligne
//         const onlineIds = onlineUsers.map((u) => Number(u.id));
//         const usersWithStatus: UserWithStatus[] = allMembers.map((u) => ({
//           ...u,
//           isOnline: onlineIds.includes(u.id!),
//         }));
//         setUsers(usersWithStatus);
//         setUsers(usersWithStatus);
//       } catch (err) {
//         console.error(err);
//         setToast({ message: "Erreur chargement des collègues", type: "error" });
//       } finally {
//         setLoading(false);
//       }
//     };
//     if (user) fetchUsers();
//   }, [user, onlineUsers]);
//   // ------------------ Fetch groupes ------------------
//   const fetchGroups = useCallback(async () => {
//     if (!user) return;
//     try {
//       const res = await getUserGroups();
//       setGroups(res.data ?? []);
//     } catch (err) {
//       console.error("Erreur récupération groupes:", err);
//     }
//   }, [user]);

//   useEffect(() => {
//     fetchGroups();
//   }, [fetchGroups]);

//   // ------------------ Fetch messages & socket ------------------
//   const fetchMessages = useCallback(async () => {
//     if (!user) return;
//     try {
//       const res = await getCommunication({
//         recipientId: selectedUser?.id ? Number(selectedUser.id) : undefined,
//         groupId: selectedGroup?.id ? Number(selectedGroup.id) : undefined,
//       });
//       setMessages(res.data ?? []);
//     } catch (err) {
//       console.error("Erreur récupération messages:", err);
//     }
//   }, [selectedUser, selectedGroup, user]);

//   useEffect(() => {
//     fetchMessages();
//   }, [fetchMessages]);

//   useEffect(() => {
//     if (!user) return;

//     // Initialisation du socket
//     const socket = io(import.meta.env.VITE_API_URL);
//     socketRef.current = socket;

//     // Rejoindre la "room" spécifique à la conversation actuelle
//     socket.emit("joinConversation", {
//       userId: Number(user.id),
//       recipientId: selectedUser?.id ? Number(selectedUser.id) : undefined,
//       groupId: selectedGroup?.id ? Number(selectedGroup.id) : undefined,
//     });

//     // --- ÉCOUTEURS (LISTENERS) ---

//     // 1. Réception de nouveaux messages
//     const handleReceiveMessage = (msg: Communication) => {
//       setMessages((prev) => {
//         if (prev.some((m) => m.id === msg.id)) return prev;
//         return [...prev, msg];
//       });

//       // Gestion des badges de messages non lus
//       const key = msg.groupId ? `group-${msg.groupId}` : `user-${msg.user.id}`;
//       const isCurrentConversation =
//         (msg.groupId && selectedGroup?.id === msg.groupId) ||
//         (!msg.groupId && selectedUser?.id === msg.user.id);

//       if (!isCurrentConversation) {
//         setUnreadMessages((prev) => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
//       }
//     };

//     // 2. Gestion des utilisateurs en ligne
//     const handleOnlineUsers = (onlineIds: number[]) => {
//       const formattedUsers = onlineIds.map((id) => ({ id }) as User);
//       setOnlineUsers(formattedUsers);
//     };

//     // 3. Gestion de la suppression (Auteur -> Destinataire)
//     const handleMessageDeleted = (deletedId: number | string) => {
//       setMessages((prev) =>
//         prev.map((m) =>
//           Number(m.id) === Number(deletedId)
//             ? { ...m, isDeleted: true, content: "Ce message a été supprimé" }
//             : m,
//         ),
//       );
//     };

//     // 4. Gestion de la modification (Update)
//     const handleMessageUpdated = (updatedMsg: {
//       id: number;
//       content: string;
//     }) => {
//       setMessages((prev) =>
//         prev.map((m) =>
//           Number(m.id) === Number(updatedMsg.id)
//             ? { ...m, content: updatedMsg.content, isEdited: true }
//             : m,
//         ),
//       );
//     };

//     // Activation des écouteurs
//     socket.on("receiveMessage", handleReceiveMessage);
//     socket.on("onlineUsersBadge", handleOnlineUsers);
//     socket.on("messageDeleted", handleMessageDeleted);
//     socket.on("messageUpdated", handleMessageUpdated);

//     // Nettoyage à la destruction du composant ou changement de conversation
//     return () => {
//       socket.off("receiveMessage", handleReceiveMessage);
//       socket.off("onlineUsersBadge", handleOnlineUsers);
//       socket.off("messageDeleted", handleMessageDeleted);
//       socket.off("messageUpdated", handleMessageUpdated);
//       socket.disconnect();
//       socketRef.current = null;
//     };
//   }, [user, selectedUser, selectedGroup]);
//   // ------------------ Sélection utilisateur / groupe ------------------
//   const handleSelectUser = (u: User) => {
//     setSelectedUser(u);
//     setSelectedGroup(null);
//     setUnreadMessages((prev) => ({ ...prev, [`user-${u.id}`]: 0 }));
//     setIsSidebarOpen(false);
//   };

//   const handleSelectGroup = (g: Group) => {
//     setSelectedGroup(g);
//     setSelectedUser(null);
//     setUnreadMessages((prev) => ({ ...prev, [`group-${g.id}`]: 0 }));
//     setIsSidebarOpen(false);
//   };

//   const toggleSelect = (id: number) => {
//     setSelectedIds((prev) =>
//       prev.includes(id) ? prev.filter((mid) => mid !== id) : [...prev, id],
//     );
//   };

//   // ------------------ Création / édition groupe ------------------
//   const handleSaveGroup = async () => {
//     if (!groupName.trim()) {
//       setToast({ message: "Le nom du groupe est obligatoire", type: "error" });
//       return;
//     }
//     if (selectedUsersForGroup.length === 0) {
//       setToast({
//         message: "Veuillez sélectionner au moins un membre",
//         type: "error",
//       });
//       return;
//     }

//     try {
//       const finalUserIds = Array.from(
//         new Set([...selectedUsersForGroup, Number(user?.id)]),
//       );
//       if (editingGroup) {
//         const res = await updateGroup(editingGroup.id, {
//           name: groupName.trim(),
//           userIds: finalUserIds,
//         });
//         const updatedGroup = res.data;
//         setGroups((prev) =>
//           prev.map((g) => (g.id === updatedGroup.id ? updatedGroup : g)),
//         );
//         if (selectedGroup?.id === updatedGroup.id)
//           setSelectedGroup(updatedGroup);
//         setToast({ message: "Groupe mis à jour avec succès", type: "success" });
//       } else {
//         const res = await createGroup({
//           name: groupName.trim(),
//           userIds: finalUserIds,
//         });
//         setGroups((prev) => [res.data, ...prev]);
//         setToast({ message: "Groupe créé avec succès", type: "success" });
//       }
//       closeModal();
//     } catch (err) {
//       console.error(err);
//       setToast({ message: "Erreur lors de l'enregistrement", type: "error" });
//     }
//   };

//   const handleEditGroup = (group: Group) => {
//     setEditingGroup(group);
//     setGroupName(group.name);
//     setSelectedUsersForGroup(group.Users?.map((u) => Number(u.id)) || []);
//     setShowCreateGroup(true);
//   };

//   const closeModal = () => {
//     setShowCreateGroup(false);
//     setEditingGroup(null);
//     setGroupName("");
//     setSelectedUsersForGroup([]);
//     setSearchTerm("");
//   };

//   const handleDeleteGroup = async (groupId: number, creatorId: number) => {
//     if (Number(user?.id) !== creatorId) return;
//     if (!window.confirm("Voulez-vous vraiment supprimer ce groupe ?")) return;

//     try {
//       await deleteGroup(groupId);
//       setGroups((prev) => prev.filter((g) => g.id !== groupId));
//       if (selectedGroup?.id === groupId) setSelectedGroup(null);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const handleDeleteMessage = async (msg: Communication) => {
//     if (!window.confirm("Voulez-vous vraiment supprimer ce message ?")) return;

//     try {
//       const res = await deleteCommunication(msg.id!);

//       if (res.success) {
//         const forAll = res.message.includes("pour tous"); // vrai si suppression globale

//         setMessages((prev) =>
//           forAll
//             ? prev.map((m) =>
//                 m.id === msg.id
//                   ? {
//                       ...m,
//                       isDeleted: true,
//                       content: "Ce message a été supprimé",
//                     }
//                   : m,
//               )
//             : prev.filter((m) => m.id !== msg.id),
//         );

//         setToast({
//           message: res.message,
//           type: "success",
//         });
//       }
//     } catch (err) {
//       console.error(err);
//       setToast({ message: "Erreur lors de la suppression", type: "error" });
//     }
//   };
//   const handleEditMessage = (msg: Communication) => {
//     setEditingMessageId(msg.id!);
//     setEditingContent(msg.content);
//     setOpenMenuId(null);
//   };

//   const handleSaveEdit = async (id: number) => {
//     if (!editingContent.trim()) return;

//     try {
//       const res = await updateCommunication(id, {
//         content: editingContent.trim(),
//       });

//       setMessages((prev) =>
//         prev.map((m) =>
//           m.id === id ? { ...m, content: res.data.content } : m,
//         ),
//       );

//       setEditingMessageId(null);
//       setEditingContent("");

//       setToast({
//         message: "Message modifié avec succès",
//         type: "success",
//       });
//     } catch (err) {
//       console.error(err);
//       setToast({
//         message: "Erreur modification message",
//         type: "error",
//       });
//     }
//   };
//   // ------------------Logout ------------------
//   const handleLogout = () => {
//     logout();
//     navigate("/login");
//   };

//   // ------------------ Filtrage utilisateurs modal ------------------
//   const filteredUsers = users.filter((u) =>
//     `${u.nom} ${u.prenom}`.toLowerCase().includes(searchTerm.toLowerCase()),
//   );
//   const sortedUsers = [...filteredUsers].sort((a, b) => {
//     const aSelected = selectedUsersForGroup.includes(Number(a.id));
//     const bSelected = selectedUsersForGroup.includes(Number(b.id));
//     return aSelected === bSelected ? 0 : aSelected ? -1 : 1;
//   });
//   const usersToDisplay =
//     searchTerm === "" ? sortedUsers.slice(0, 3) : sortedUsers;

//   return (
//     <div className="h-[calc(100vh-80px)] flex flex-col lg:flex-row bg-gray-50">
//       {/* Bouton menu mobile */}
//       <button
//         onClick={() => setIsSidebarOpen(true)}
//         className="lg:hidden fixed top-24 left-4 z-20 p-2.5 bg-cyan-600 text-white rounded-lg shadow-lg hover:bg-cyan-700 transition-colors"
//       >
//         <Menu size={20} />
//       </button>

//       {/* Sidebar - Mobile: cachée par défaut, visible quand menu ouvert */}
//       <div
//         className={`
//         fixed lg:relative inset-y-0 left-0 z-30 w-80 bg-white border-r border-gray-200 flex flex-col
//         transform transition-transform duration-300 ease-in-out
//         ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
//         lg:transform-none lg:static lg:z-auto
//       `}
//       >
//         <div className="p-4 border-b border-gray-200 bg-cyan-600 flex justify-between items-center">
//           {/* Titre */}
//           <div className="flex items-center gap-3 px-2 mb-6">
//             {/* Conteneur de l'icône avec un fond cyan foncé pour faire ressortir le blanc */}
//             <div className="p-2 bg-cyan-600 rounded-lg shadow-sm">
//               <MessageCircleMore className="w-6 h-6 text-white" />
//             </div>

//             {/* Titre */}
//             <h2 className="text-xl font-bold text-white tracking-wide">
//               Chats
//             </h2>
//           </div>
//           {/* Bouton */}
//           <button
//             onClick={() => setShowCreateGroup(true)}
//             className="flex items-center gap-2 text-sm font-bold bg-cyan-600 text-white px-4 py-2.5 rounded-xl 
//              hover:bg-cyan-700 transition-all duration-200 shadow-sm border-b-2 border-cyan-800 active:border-b-0 active:translate-y-0.5"
//           >
//             <Plus size={18} strokeWidth={3} />
//             <span className="hidden sm:inline">Nouveau canal</span>
//             <span className="sm:hidden">+</span>
//           </button>
//         </div>

//         {/* Utilisateurs en ligne */}
//         <div className="flex-1 overflow-y-auto p-4 bg-white">
//           {/* En-tête de section */}
//           <div className="flex items-center justify-between mb-6 px-2">
//             <div className="flex items-center gap-2">
//               <h3 className="text-xs font-bold text-cyan-600 uppercase tracking-widest">
//                 Utilisateurs en ligne
//               </h3>
//             </div>

//             {/* Badge stylisé du nombre d’utilisateurs en ligne */}

//             <span className="bg-green-100 text-pink-600 text-[11px] font-black px-2 py-0.5 rounded-md border-b-2 border-green-200 shadow-sm">
//               {
//                 onlineUsers.filter((u) => Number(u.id) !== Number(user?.id))
//                   .length
//               }
//             </span>
//           </div>

//           {/* Liste des utilisateurs */}
//           <div className="space-y-2">
//             {users.map((u) => {
//               const isSelected = selectedUser?.id === u.id;
//               const unreadCount = unreadMessages[`user-${u.id}`] || 0;

//               return (
//                 <button
//                   key={u.id}
//                   onClick={() => handleSelectUser(u)}
//                   className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-200 cursor-pointer ${
//                     isSelected ? "bg-cyan-50 shadow-sm" : "hover:bg-gray-50"
//                   }`}
//                 >
//                   <div className="relative flex-shrink-0">
//                     <div
//                       className={`w-11 h-11 rounded-full flex items-center justify-center overflow-hidden text-white font-bold text-sm shadow-sm transition-transform duration-200 ${
//                         isSelected ? "bg-cyan-600 scale-105" : "bg-cyan-500"
//                       }`}
//                     >
//                       {u.photo ? (
//                         <img
//                           src={`${import.meta.env.VITE_API_URL}${u.photo}`}
//                           alt={`${u.prenom} ${u.nom}`}
//                           className="w-full h-full object-cover"
//                         />
//                       ) : (
//                         <>
//                           {u.nom.charAt(0).toUpperCase()}
//                           {u.prenom.charAt(0).toUpperCase()}
//                         </>
//                       )}
//                     </div>

//                     {/* Badge notifications */}
//                     {unreadCount > 0 && (
//                       <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow z-10">
//                         {unreadCount > 9 ? "9+" : unreadCount}
//                       </div>
//                     )}

//                     {/* Point vert seulement si online */}

//                     {u.isOnline && (
//                       <div className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center w-3.5 h-3.5">
//                         {/* L'effet de halo qui pulse */}
//                         <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping"></span>

//                         {/* Le point fixe au centre */}
//                         <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500 border-2 border-white"></span>
//                       </div>
//                     )}
//                   </div>

//                   <div className="flex flex-col items-start overflow-hidden">
//                     <span
//                       className={`text-sm font-semibold truncate w-full ${
//                         isSelected ? "text-cyan-900" : "text-gray-700"
//                       }`}
//                     >
//                       {u.nom} {u.prenom}
//                     </span>
//                     <span className="text-[10px] font-medium text-green-600">
//                       {u.isOnline ? "Disponible" : "Hors ligne"}
//                     </span>
//                   </div>

//                   {isSelected && (
//                     <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
//                   )}
//                 </button>
//               );
//             })}
//           </div>
//         </div>

//         {/* Groupes */}
//         <div className="p-4 border-t border-gray-100 bg-white">
//           {/* Titre avec une typographie plus travaillée */}
//           <h3 className="text-[11px] font-bold text-cyan-600 mb-4 uppercase tracking-[0.2em] px-1">
//             Canaux de discussion
//           </h3>

//           <div className="flex flex-col gap-2">
//             {groups.map((g) => {
//               const isSelected = selectedGroup?.id === g.id;
//               const unreadCount = unreadMessages[`group-${g.id}`] || 0;

//               return (
//                 <div
//                   key={g.id}
//                   className={`relative group p-3 rounded-xl flex items-center justify-between transition-all duration-200 cursor-pointer ${
//                     isSelected ? "bg-pink-50 shadow-sm" : "hover:bg-gray-50"
//                   }`}
//                   onClick={() => handleSelectGroup(g)} // <-- utilise la fonction pour reset notifications
//                 >
//                   {/* Barre de sélection affinée */}
//                   {isSelected && (
//                     <span className="absolute left-0 top-2 bottom-2 w-1 bg-pink-500 rounded-r-full"></span>
//                   )}

//                   {/* Contenu gauche */}
//                   <div className="flex items-center gap-3 flex-1 relative">
//                     {/* Avatar : on garde le rose mais avec un rendu plus "flat/premium" */}
//                     <div
//                       className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm transition-transform ${
//                         isSelected ? "scale-105 bg-pink-600" : "bg-pink-500"
//                       }`}
//                     >
//                       {g.name.charAt(0).toUpperCase()}
//                     </div>

//                     {/* Badge notifications rouge */}
//                     {unreadCount > 0 && (
//                       <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow">
//                         {unreadCount > 9 ? "9+" : unreadCount}
//                       </div>
//                     )}

//                     {/* Textes */}
//                     <div className="flex flex-col min-w-0 ml-2">
//                       <span
//                         className={`text-sm font-bold truncate ${
//                           isSelected ? "text-pink-700" : "text-gray-800"
//                         }`}
//                       >
//                         {g.name}
//                       </span>
//                       <span
//                         className={`text-[11px] ${
//                           isSelected ? "text-pink-400" : "text-gray-400"
//                         }`}
//                       >
//                         Canal de discussion
//                       </span>
//                     </div>
//                   </div>

//                   {/* Boutons éditer / supprimer */}
//                   {g.creatorId === Number(user?.id) && (
//                     <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
//                       {/* BOUTON ÉDITER */}
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           handleEditGroup(g);
//                         }}
//                         className="p-1.5 rounded-lg text-gray-400 hover:text-cyan-600 hover:bg-cyan-50"
//                       >
//                         <Pencil size={16} />
//                       </button>

//                       {/* BOUTON SUPPRIMER */}
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           handleDeleteGroup(g.id, g.creatorId);
//                         }}
//                         className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50"
//                       >
//                         <Trash2 size={16} />
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       </div>

//       {/* Overlay pour mobile quand sidebar est ouverte */}
//       {isSidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black/50 z-20 lg:hidden"
//           onClick={() => setIsSidebarOpen(false)}
//         />
//       )}

//       {/* Chat */}
//       <div className="flex-1 flex flex-col bg-gray-50 min-w-0">
//         {/* --- HEADER --- */}
//         <header className="bg-white border-b border-gray-100 shadow-sm z-10">
//           {hasSelection ? (
//             /* ============================= */
//             /* ===== MODE SELECTION ======== */
//             /* ============================= */
//             <div className="flex items-center justify-between px-4 sm:px-6 py-4 bg-cyan-600 text-white animate-in slide-in-from-top duration-200">
//               {/* Partie gauche */}
//               <div className="flex items-center gap-2 sm:gap-4">
//                 <button
//                   onClick={() => {
//                     setIsSelectMode(false);
//                     setSelectedIds([]);
//                   }}
//                   className="p-2 rounded-full hover:bg-cyan-700 transition"
//                 >
//                   ✕
//                 </button>

//                 <span className="font-bold text-xs sm:text-sm tracking-wide">
//                   {selectedIds.length} sélectionné(s)
//                 </span>
//               </div>

//               {/* Partie droite */}
//               <div className="flex items-center gap-2 sm:gap-4">
//                 <button
//                   onClick={async () => {
//                     // On boucle sur les IDs sélectionnés
//                     for (const id of selectedIds) {
//                       // 🔍 On cherche l'objet message complet dans notre state
//                       const messageToId = messages.find((m) => m.id === id);

//                       // Si on l'a trouvé, on appelle la fonction de suppression
//                       if (messageToId) {
//                         await handleDeleteMessage(messageToId);
//                       }
//                     }
//                     setSelectedIds([]);
//                     setIsSelectMode(false);
//                   }}
//                   className="flex items-center gap-1 sm:gap-2 hover:bg-cyan-700 px-2 sm:px-3 py-2 rounded-lg transition text-sm sm:text-base"
//                 >
//                   <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
//                   <span className="hidden xs:inline">Supprimer</span> (
//                   {selectedIds.length})
//                 </button>
//               </div>
//             </div>
//           ) : (
//             /* ============================= */
//             /* ===== HEADER NORMAL ========= */
//             /* ============================= */
//             <div className="p-3 sm:p-4 flex items-center justify-between">
//               <div className="flex items-center gap-3 sm:gap-4 min-w-0">
//                 {/* Avatar dynamique */}
//                 <div className="relative flex-shrink-0">
//                   {selectedUser ? (
//                     selectedUser.photo ? (
//                       <img
//                         src={`${import.meta.env.VITE_API_URL}${selectedUser.photo}`}
//                         alt="Avatar"
//                         className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-full border-2 border-cyan-500 shadow-sm"
//                       />
//                     ) : (
//                       <div className="w-10 h-10 sm:w-12 sm:h-12 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold shadow-sm uppercase tracking-wider text-sm sm:text-base">
//                         {(selectedUser.nom?.[0] || "").toUpperCase()}
//                         {(selectedUser.prenom?.[0] || "").toUpperCase()}
//                       </div>
//                     )
//                   ) : selectedGroup ? (
//                     <div className="w-10 h-10 sm:w-12 sm:h-12 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold shadow-sm uppercase text-sm sm:text-base">
//                       {selectedGroup.name.charAt(0)}
//                     </div>
//                   ) : (
//                     <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center text-gray-300 border-2 border-dashed border-gray-200">
//                       <MessageCircleMore className="w-5 h-5 sm:w-6 sm:h-6" />
//                     </div>
//                   )}
//                 </div>
//                 <div className="min-w-0">
//                   <h2 className="text-base sm:text-lg font-bold text-gray-800 leading-tight truncate">
//                     {selectedUser
//                       ? `${selectedUser.prenom} ${selectedUser.nom}`
//                       : selectedGroup
//                         ? selectedGroup.name
//                         : "Aucune discussion sélectionnée"}
//                   </h2>

//                   <p
//                     className={`text-[10px] sm:text-xs font-medium truncate ${
//                       selectedUser
//                         ? onlineUsers.some(
//                             (u) => Number(u.id) === Number(selectedUser.id),
//                           )
//                           ? "text-green-600"
//                           : "text-gray-400"
//                         : "text-gray-500"
//                     }`}
//                   >
//                     {selectedUser
//                       ? onlineUsers.some(
//                           (u) => Number(u.id) === Number(selectedUser.id),
//                         )
//                         ? "En ligne"
//                         : "Hors ligne"
//                       : selectedGroup
//                         ? "Canal"
//                         : ""}
//                   </p>
//                 </div>
//               </div>

//               {/* Menu utilisateur */}
//               <div className="relative flex-shrink-0">
//                 <button
//                   onClick={() => setUserMenuOpen(!userMenuOpen)}
//                   className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-pink-600 hover:bg-pink-700 transition-colors duration-300"
//                 >
//                   {user?.photo ? (
//                     <img
//                       src={`${import.meta.env.VITE_API_URL}${user.photo}`}
//                       alt="Avatar"
//                       className="w-full h-full object-cover rounded-full"
//                     />
//                   ) : (
//                     <span className="text-white font-bold text-sm sm:text-lg">
//                       {(user?.nom?.[0] || "").toUpperCase()}
//                       {(user?.prenom?.[0] || "").toUpperCase()}
//                     </span>
//                   )}

//                   <div className="absolute bottom-0 right-0 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-emerald-500 border-2 border-white rounded-full"></div>
//                 </button>

//                 {userMenuOpen && (
//                   <>
//                     <div
//                       className="fixed inset-0 z-40"
//                       onClick={() => setUserMenuOpen(false)}
//                     />
//                     <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md border border-gray-200 py-1 z-50 shadow-lg">
//                       <div className="px-3 py-2 border-b border-gray-100">
//                         <p className="text-sm font-semibold text-gray-900 truncate">
//                           {user?.prenom} {user?.nom}
//                         </p>
//                         <p className="text-xs text-gray-500 truncate">
//                           {user?.email}
//                         </p>
//                       </div>

//                       <button
//                         onClick={() => navigate("/vitrine")}
//                         className="w-full px-4 py-2 flex items-center gap-2 text-sm font-medium text-gray-700 hover:bg-cyan-50 hover:text-cyan-700 transition"
//                       >
//                         <Home className="w-4 h-4" />
//                         Accueil
//                       </button>

//                       <button
//                         onClick={handleLogout}
//                         className="flex items-center gap-2 w-full px-3 py-2 text-left text-red-600 hover:bg-red-50 text-sm"
//                       >
//                         <LogOut className="w-3 h-3" />
//                         Se déconnecter
//                       </button>
//                     </div>
//                   </>
//                 )}
//               </div>
//             </div>
//           )}
//         </header>

//         {/* 2. ZONE DE DÉFILEMENT DES MESSAGES */}
//         <div
//           className={`flex-1 overflow-y-auto p-3 sm:p-6 bg-gray-50/50 transition-all duration-700 ease-in-out ${
//             isSelectionEmpty
//               ? "opacity-0 pointer-events-none"
//               : "opacity-100 pointer-events-auto"
//           }`}
//         >
//           <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
//             {messages.map((msg) => {
//               const isMe = msg.user?.id === user?.id;
//               const isSelected = selectedIds.includes(msg.id!); // Vérifie si ce message précis est coché

//               return (
//                 <div
//                   key={msg.id}
//                   className={`group relative flex items-end gap-2 sm:gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
//                     isMe ? "flex-row-reverse" : "flex-row"
//                   }`}
//                 >
//                   {/* AFFICHE LA CASE À COCHER SI MODE SÉLECTION ACTIF */}
//                   {isSelectMode && (
//                     <div className="flex items-center self-center px-1 sm:px-2">
//                       <input
//                         type="checkbox"
//                         checked={isSelected}
//                         onChange={() => toggleSelect(msg.id!)}
//                         className="w-4 h-4 sm:w-5 sm:h-5 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
//                       />
//                     </div>
//                   )}

//                   {/* AVATAR (Uniquement pour les autres) */}
//                   {!isMe && selectedGroup && (
//                     <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-cyan-100 border border-cyan-200 flex items-center justify-center overflow-hidden shadow-sm flex-shrink-0">
//                       {msg.user?.photo ? (
//                         <img
//                           src={`${import.meta.env.VITE_API_URL}${msg.user.photo}`}
//                           alt="Avatar"
//                           className="w-full h-full object-cover"
//                         />
//                       ) : (
//                         <span className="text-[8px] sm:text-[10px] font-bold text-cyan-700">
//                           {(msg.user?.nom?.[0] || "").toUpperCase()}
//                           {(msg.user?.prenom?.[0] || "").toUpperCase()}
//                         </span>
//                       )}
//                     </div>
//                   )}
//                   <div
//                     className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[85%] sm:max-w-[80%] lg:max-w-[70%]`}
//                   >
//                     {/* NOM (Uniquement pour les autres) */}
//                     {!isMe && (
//                       <span className="text-[8px] sm:text-[10px] font-black text-cyan-600 mb-1 ml-1 uppercase tracking-widest">
//                         {msg.user?.nom}
//                       </span>
//                     )}

//                     <div className="relative group/bubble w-full">
//                       {/* LA BULLE DE MESSAGE */}
//                       <div
//                         onClick={() => isSelectMode && toggleSelect(msg.id!)}
//                         className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-[13px] sm:text-[14px] leading-relaxed shadow-sm transition-all duration-200 cursor-pointer ${
//                           isMe
//                             ? "bg-cyan-600 text-white rounded-br-none border border-cyan-700"
//                             : "bg-white text-gray-700 border border-gray-200 rounded-bl-none"
//                         } ${isSelected ? "ring-2 ring-cyan-400 ring-offset-2 opacity-80" : ""}`}
//                       >
//                         <p className="whitespace-pre-wrap break-words">
//                           {msg.content}
//                         </p>

//                         {/* HEURE */}
//                         <div
//                           className={`text-[8px] sm:text-[9px] mt-1.5 flex justify-end font-bold uppercase tracking-tighter ${
//                             isMe ? "text-cyan-200" : "text-gray-400"
//                           }`}
//                         >
//                           {new Date(msg.createdAt!).toLocaleTimeString([], {
//                             hour: "2-digit",
//                             minute: "2-digit",
//                           })}
//                         </div>
//                       </div>

//                       {/* Modal Edition */}
//                       {editingMessageId === msg.id && (
//                         <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
//                           {/* Overlay */}
//                           <div
//                             className="absolute inset-0 bg-black/40 backdrop-blur-sm"
//                             onClick={() => setEditingMessageId(null)}
//                           ></div>

//                           {/* Modal */}
//                           <div className="relative bg-white w-full sm:w-[450px] rounded-2xl shadow-2xl p-4 sm:p-6 animate-in fade-in zoom-in-95 duration-200">
//                             {/* Titre */}
//                             <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">
//                               Modifier le message
//                             </h2>

//                             {/* Input */}
//                             <textarea
//                               value={editingContent}
//                               onChange={(e) =>
//                                 setEditingContent(e.target.value)
//                               }
//                               rows={4}
//                               className="w-full border border-gray-200 rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none transition"
//                               placeholder="Modifier votre message..."
//                             />

//                             {/* Boutons */}
//                             <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 mt-5">
//                               <button
//                                 onClick={() => setEditingMessageId(null)}
//                                 className="px-4 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 transition"
//                               >
//                                 Annuler
//                               </button>

//                               <button
//                                 onClick={() => handleSaveEdit(msg.id!)}
//                                 className="px-4 py-2 text-sm rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 transition shadow-md"
//                               >
//                                 Enregistrer
//                               </button>
//                             </div>
//                           </div>
//                         </div>
//                       )}
//                       {/* MENU WHATSAPP STYLE */}
//                       {!isSelectMode && (
//                         <div
//                           className={`absolute top-1 ${
//                             isMe
//                               ? "-left-8 sm:-left-10"
//                               : "-right-8 sm:-right-10"
//                           }`}
//                         >
//                           <div className="relative">
//                             {/* Bouton 3 points */}
//                             <button
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 setOpenMenuId(
//                                   openMenuId === msg.id ? null : msg.id!,
//                                 );
//                               }}
//                               className="p-1 rounded-full hover:bg-gray-200 transition"
//                             >
//                               <MoreVertical
//                                 size={16}
//                                 className="sm:w-[18px] sm:h-[18px] text-gray-500"
//                               />
//                             </button>

//                             {/* Dropdown */}
//                             {openMenuId === msg.id && (
//                               <>
//                                 {/* Overlay invisible pour fermer au clic extérieur */}
//                                 <div
//                                   className="fixed inset-0 z-40"
//                                   onClick={() => setOpenMenuId(null)}
//                                 />

//                                 <div
//                                   className={`absolute z-50 mt-2 w-36 sm:w-44 ${
//                                     isMe
//                                       ? "right-0 origin-top-right"
//                                       : "left-0 origin-top-left"
//                                   } bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150`}
//                                 >
//                                   {isMe && (
//                                     <button
//                                       onClick={() => {
//                                         handleEditMessage(msg);
//                                         setOpenMenuId(null);
//                                       }}
//                                       className="flex items-center gap-2 sm:gap-3 w-full px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-gray-100 transition"
//                                     >
//                                       <Pencil
//                                         size={14}
//                                         className="sm:w-4 sm:h-4"
//                                       />
//                                       Modifier
//                                     </button>
//                                   )}

//                                   <button
//                                     onClick={() => {
//                                       setIsSelectMode(true);
//                                       toggleSelect(msg.id!);
//                                       setOpenMenuId(null);
//                                     }}
//                                     className="flex items-center gap-2 sm:gap-3 w-full px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-gray-100 transition"
//                                   >
//                                     <CheckSquare
//                                       size={14}
//                                       className="sm:w-4 sm:h-4"
//                                     />
//                                     Sélectionner
//                                   </button>

//                                   <button
//                                     onClick={() => {
//                                       // On passe l'objet complet 'msg' au lieu de juste l'ID
//                                       handleDeleteMessage(msg);
//                                       setOpenMenuId(null);
//                                     }}
//                                     className="flex items-center gap-2 sm:gap-3 w-full px-3 sm:px-4 py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50 transition"
//                                   >
//                                     <Trash2
//                                       size={14}
//                                       className="sm:w-4 sm:h-4"
//                                     />
//                                     Supprimer
//                                   </button>
//                                 </div>
//                               </>
//                             )}
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//             {/* Point de repère pour le scroll automatique tout en bas */}
//             <div ref={messagesEndRef} className="h-2"></div>
//           </div>
//         </div>
//         {/* --- BARRE DE SAISIE --- */}
//         {!isSelectionEmpty && (
//           <div className="p-3 sm:p-4 bg-white border-t border-gray-100 relative">
//             <div className="max-w-4xl mx-auto flex flex-col gap-1">
//               {/* Input + bouton envoyer */}
//               <div className="flex items-center gap-2 sm:gap-3 bg-gray-50 border border-gray-200 rounded-2xl p-1 focus-within:border-cyan-400 focus-within:bg-white transition-all shadow-inner">
//                 <input
//                   type="text"
//                   value={input}
//                   onChange={(e) => {
//                     setInput(e.target.value);
//                     fetchSuggestions(e.target.value);
//                   }}
//                   onKeyDown={handleKeyDown}
//                   placeholder="Écrivez votre message..."
//                   className="flex-1 bg-transparent px-3 sm:px-4 py-2 text-sm focus:outline-none min-w-0"
//                 />
//                 <button
//                   onClick={sendMessage}
//                   disabled={!input.trim()}
//                   className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold bg-cyan-600 text-white disabled:bg-gray-200 disabled:text-gray-400 shadow-sm hover:bg-cyan-700 active:scale-95 transition-all duration-200"
//                 >
//                   <span className="hidden xs:inline">Envoyer</span>
//                   <Send size={14} className="sm:w-4 sm:h-4" />
//                 </button>
//               </div>

//               {/* Suggestions IA */}
//               {suggestions.length > 0 && (
//                 <div className="absolute bottom-full mb-2 left-3 sm:left-4 right-3 sm:right-4 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
//                   {suggestions.map((s, idx) => (
//                     <div
//                       key={idx}
//                       className={`px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-cyan-100 cursor-pointer transition truncate ${
//                         selectedSuggestionIndex === idx
//                           ? "bg-cyan-200 font-semibold"
//                           : ""
//                       }`}
//                       onClick={() => {
//                         setInput((prev) => {
//                           const words = prev.trim().split(" ");
//                           words.pop();

//                           return [...words, s].join(" ") + " ";
//                         });
//                         setSuggestions([]);
//                         setSelectedSuggestionIndex(-1);
//                       }}
//                     >
//                       {s}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {/* --- BOUTON IA COMPACT AVEC LABEL VISIBLE --- */}
//         <button
//           onClick={() => setIsModalOpen(true)}
//           className="fixed bottom-6 right-4 sm:bottom-8 sm:right-6 group flex items-center gap-2 bg-gradient-to-r from-purple-600 to-cyan-600 pl-2 pr-3 sm:pr-4 py-1.5 sm:py-2 rounded-xl shadow-lg z-50 hover:shadow-cyan-500/20 hover:-translate-y-1 active:scale-95 transition-all duration-300"
//         >
//           {/* Conteneur Icône plus petit */}
//           <div className="bg-white/20 p-1 sm:p-1.5 rounded-lg backdrop-blur-sm">
//             <MessageSquare
//               size={14}
//               className="sm:w-[18px] sm:h-[18px] text-white"
//             />
//           </div>

//           {/* Texte plus fin et compact */}
//           <span className="text-[10px] sm:text-xs font-bold text-white tracking-tight whitespace-nowrap">
//             Assistant IA
//           </span>

//           {/* Badge de notification (ajusté pour la nouvelle taille) */}
//           <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 sm:h-3 sm:w-3">
//             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
//             <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-cyan-500 border border-white"></span>
//           </span>
//         </button>

//         {/* Reste des éléments hors-flux */}
//         <ChatModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

//         {toast && (
//           <Toast
//             message={toast.message}
//             type={toast.type}
//             onClose={() => setToast(null)}
//           />
//         )}
//       </div>
//       {/* Modal création groupe */}
//       {showCreateGroup && (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
//           <div className="bg-white rounded-2xl shadow-xl w-[400px] max-w-full border border-gray-100 p-4">
//             {/* Titre */}
//             <h2 className="text-lg sm:text-xl font-semibold text-cyan-600 mb-4">
//               Créer un canal
//             </h2>

//             {/* Input Nom */}
//             <div className="mb-4">
//               <input
//                 type="text"
//                 placeholder="Nom du groupe"
//                 value={groupName}
//                 onChange={(e) => setGroupName(e.target.value)}
//                 className="w-full p-2.5 text-sm rounded-lg border border-gray-200 bg-gray-50 
//                    focus:bg-white focus:outline-none 
//                    focus:ring-2 focus:ring-cyan-600 focus:border-cyan-600 transition"
//               />
//             </div>

//             {/* Zone Membres */}
//             <div className="bg-gray-50 rounded-lg border border-gray-200 p-3">
//               <h3 className="text-xs font-semibold text-cyan-600 mb-2 uppercase tracking-wide">
//                 Sélectionner les membres
//               </h3>

//               {/* Recherche */}
//               <div className="mb-3">
//                 <input
//                   type="text"
//                   placeholder="Rechercher..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="w-full p-2 text-sm rounded-md border border-gray-200 bg-white 
//                      focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-cyan-600 transition"
//                 />
//               </div>

//               {/* Liste */}
//               <div className="max-h-40 overflow-y-auto space-y-1">
//                 {usersToDisplay.length > 0 ? (
//                   usersToDisplay.map((u) => (
//                     <label
//                       key={u.id}
//                       className="flex items-center gap-2 p-2 rounded-lg 
//                          hover:bg-cyan-50 transition cursor-pointer"
//                     >
//                       <input
//                         type="checkbox"
//                         checked={selectedUsersForGroup.includes(Number(u.id))}
//                         value={u.id}
//                         onChange={(e) => {
//                           const id = Number(e.target.value);
//                           setSelectedUsersForGroup((prev) =>
//                             e.target.checked
//                               ? [...prev, id]
//                               : prev.filter((uid) => uid !== id),
//                           );
//                         }}
//                         className="rounded text-pink-500 focus:ring-pink-500 flex-shrink-0"
//                       />

//                       <div
//                         className="w-7 h-7 sm:w-8 sm:h-8 bg-cyan-600 rounded-full 
//                               flex items-center justify-center 
//                               text-white text-[10px] sm:text-xs font-semibold uppercase flex-shrink-0"
//                       >
//                         {u.nom.charAt(0)}
//                         {u.prenom.charAt(0)}
//                       </div>

//                       <span className="text-xs sm:text-sm text-gray-700 truncate">
//                         {u.nom} {u.prenom}
//                       </span>
//                     </label>
//                   ))
//                 ) : (
//                   <p className="text-xs text-gray-400 text-center py-2">
//                     Aucun utilisateur trouvé.
//                   </p>
//                 )}
//               </div>

//               {searchTerm === "" && users.length > 4 && (
//                 <p className="text-xs text-gray-400 italic mt-2 text-center">
//                   + {users.length - 3} autres utilisateurs.
//                 </p>
//               )}
//             </div>

//             {/* Boutons */}
//             <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 mt-4">
//               <button
//                 className="px-4 py-2 text-sm rounded-lg border border-gray-300 
//              text-gray-700 hover:bg-gray-100 transition"
//                 onClick={closeModal}
//               >
//                 Annuler
//               </button>

//               <button
//                 className={`px-4 py-2 text-sm rounded-lg font-medium shadow-sm transition active:scale-95 
//                   ${
//                     !groupName.trim() || selectedUsersForGroup.length === 0
//                       ? "bg-gray-300 cursor-not-allowed text-gray-500"
//                       : "bg-pink-500 hover:bg-pink-600 text-white"
//                   }`}
//                 onClick={handleSaveGroup}
//               >
//                 {editingGroup ? "Enregistrer" : "Créer"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//       {/* Notification Toast */}
//       {toast && (
//         <Toast
//           message={toast.message}
//           type={toast.type}
//           onClose={() => setToast(null)}
//         />
//       )}
//     </div>
//   );
// };

// export default CanalCommunication;
