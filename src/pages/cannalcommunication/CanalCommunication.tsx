import React, { useEffect, useState, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import {
  getCommunication,
  createGroup,
  deleteGroup,
  getUserGroups,
} from "../../services/communicationService";
import type { User } from "../../models/User";
import type { Communication } from "../../models/Communication";
import type { Group } from "../../models/Group";
import { useAuth } from "../../context/useAuth";
import { ChevronDown, Home, LogOut,  User2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CanalCommunication: React.FC = () => {

    const { logout, user } = useAuth();
  const navigate = useNavigate();
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
    []
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  // Scroll automatique
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🔹 Récupérer les groupes
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
  }, [fetchGroups]); // ✅ plus de warning

  // 🔹 Initialisation socket + récupération messages
  useEffect(() => {
    if (!user) return;

    const fetchMessages = async () => {
      const res = await getCommunication({
        recipientId: selectedUser?.id ? Number(selectedUser.id) : undefined,
        groupId: selectedGroup?.id ? Number(selectedGroup.id) : undefined,
      });
      setMessages(res.data ?? []);
    };

    fetchMessages();

    const socket = io(import.meta.env.VITE_API_URL);
    socketRef.current = socket;

    socket.emit("joinConversation", {
      userId: Number(user.id),
      recipientId: selectedUser?.id ? Number(selectedUser.id) : undefined,
      groupId: selectedGroup?.id ? Number(selectedGroup.id) : undefined,
    });

    socket.on("receiveMessage", (msg: Communication) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("onlineUsers", (users: User[]) => setOnlineUsers(users || []));

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user, selectedUser, selectedGroup]);

  // 🔹 Envoyer un message (socket)
  const sendMessage = () => {
    if (!input.trim() || !user) return;

    const payload = {
      content: input.trim(),
      userId: Number(user.id),
      recipientId: selectedUser?.id ? Number(selectedUser.id) : undefined,
      groupId: selectedGroup?.id ? Number(selectedGroup.id) : undefined,
    };

    socketRef.current?.emit("sendMessage", payload);
    setInput("");
  };

  // 🔹 Créer un groupe
  const handleCreateGroup = async () => {
    if (!groupName || selectedUsersForGroup.length === 0) return;
    try {
      const res = await createGroup({
        name: groupName,
        userIds: selectedUsersForGroup,
      });
      setGroups((prev) => [...prev, res.data]);
      setShowCreateGroup(false);
      setGroupName("");
      setSelectedUsersForGroup([]);
    } catch (err) {
      console.error("Erreur création groupe:", err);
    }
  };

  // 🔹 Supprimer un groupe (seul le créateur peut)
  // 🔹 Supprimer un groupe (seul le créateur peut)
  const handleDeleteGroup = async (groupId: number, creatorId: number) => {
    if (Number(user?.id) !== creatorId) return; // Conversion en number
    if (!window.confirm("Voulez-vous vraiment supprimer ce groupe ?")) return;

    try {
      await deleteGroup(groupId);
      setGroups((prev) => prev.filter((g) => g.id !== groupId));
      if (selectedGroup?.id === groupId) setSelectedGroup(null);
    } catch (err) {
      console.error("Erreur suppression groupe:", err);
    }
  };
    const handleLogout = () => {
      logout();
      navigate("/login");
    };

  return (
    <div className="h-[calc(100vh-80px)] flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-cyan-600 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Messages</h2>
          <button
            onClick={() => setShowCreateGroup(true)}
            className="text-sm bg-pink-500 text-white px-3 py-2 rounded-lg hover:bg-pink-600"
          >
            + Groupe
          </button>
        </div>

        {/* Utilisateurs en ligne */}
        <div className="flex-1 overflow-y-auto p-3">
          <h3 className="text-sm font-semibold text-gray-500 mb-3 px-2">
            En ligne
          </h3>
          {onlineUsers.map((u) => (
            <div
              key={u.id}
              onClick={() => {
                setSelectedUser(u);
                setSelectedGroup(null);
              }}
              className={`p-3 mb-1 rounded-lg cursor-pointer flex items-center gap-3 ${
                selectedUser?.id === u.id
                  ? "bg-cyan-100 border border-cyan-200"
                  : "hover:bg-gray-100"
              }`}
            >
              <div className="relative">
                <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center text-white font-medium">
                  {u.nom.charAt(0)}
                  {u.prenom.charAt(0)}
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <div className="font-medium text-gray-800">
                  {u.nom} {u.prenom}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Groupes */}
        <div className="p-4 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-500 mb-3">Groupes</h3>
          <div className="flex flex-col gap-2">
            {groups.map((g) => (
              <div
                key={g.id}
                className={`p-3 rounded-lg cursor-pointer flex items-center justify-between ${
                  selectedGroup?.id === g.id
                    ? "bg-pink-100 border border-pink-200"
                    : "hover:bg-gray-100"
                }`}
              >
                <div
                  className="flex items-center gap-3"
                  onClick={() => {
                    setSelectedGroup(g);
                    setSelectedUser(null);
                  }}
                >
                  <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center text-white font-medium">
                    {g.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="font-medium text-gray-800">{g.name}</div>
                </div>
                {g.creatorId === Number(user?.id) && (
                  <button
                    className="text-red-500 hover:text-red-700 text-sm"
                    onClick={() => handleDeleteGroup(g.id, g.creatorId)}
                  >
                    Supprimer
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          {/* Informations de la conversation */}
          <div className="flex items-center gap-3">
            {selectedUser && (
              <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center text-white font-medium">
                {selectedUser.nom.charAt(0)}
                {selectedUser.prenom.charAt(0)}
              </div>
            )}
            {selectedGroup && (
              <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center text-white font-medium">
                {selectedGroup.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="text-xl font-semibold text-gray-800">
                {selectedUser
                  ? `${selectedUser.nom} ${selectedUser.prenom}`
                  : selectedGroup
                  ? selectedGroup.name
                  : "Sélectionnez une conversation"}
              </div>
              {selectedUser && (
                <div className="text-sm text-green-600 flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  En ligne
                </div>
              )}
            </div>
          </div>

          {/* Menu utilisateur - DÉPLACÉ À DROITE */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/80 hover:bg-white border border-gray-200/80 hover:border-cyan-200 shadow-sm hover:shadow-md transition-all duration-200 group"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center shadow-md overflow-hidden">
                {user?.photo ? (
                  <img
                    src={user.photo}
                    alt={`${user.prenom} ${user.nom}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User2 className="w-4 h-4 text-white" />
                )}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900">
                  {user?.prenom} {user?.nom}
                </p>
                <p className="text-xs text-gray-500 truncate max-w-32">
                  {user?.email}
                </p>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                  userMenuOpen ? "rotate-180 text-cyan-600" : ""
                }`}
              />
            </button>

            {userMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setUserMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-64 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-200/80 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100/80">
                    <p className="text-sm font-semibold text-gray-900">
                      {user?.prenom} {user?.nom}
                    </p>
                    <p className="text-sm text-gray-500 truncate mt-1">
                      {user?.email}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      navigate("/vitrine");
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-left text-cyan-600 hover:bg-red-50/80 transition-colors rounded-lg mx-2 my-1"
                  >
                    <Home className="w-4 h-4" />
                    <span className="font-medium">Accueil</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-left text-red-600 hover:bg-red-50/80 transition-colors rounded-lg mx-2 my-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="font-medium">Se déconnecter</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 min-h-0">
          <div className="max-w-4xl mx-auto flex flex-col gap-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.user?.id === user?.id ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-3 py-2 rounded-2xl break-words ${
                    msg.user?.id === user?.id
                      ? "bg-cyan-600 text-white rounded-br-none"
                      : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
                  }`}
                >
                  {msg.user?.id !== user?.id && (
                    <div className="text-sm font-semibold text-cyan-600 mb-1">
                      {msg.user?.nom}
                    </div>
                  )}
                  <div className="text-sm">{msg.content}</div>
                  <div
                    className={`text-xs mt-1 ${
                      msg.user?.id === user?.id
                        ? "text-cyan-200"
                        : "text-gray-500"
                    }`}
                  >
                    {new Date(msg.createdAt!).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef}></div>
          </div>
        </div>

        {/* Input */}
        <div className="bg-white border-t border-gray-200 p-3">
          <div className="max-w-4xl mx-auto flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Écrire un message..."
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:border-cyan-500 bg-gray-50"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="bg-cyan-600 text-white px-5 py-2 rounded-full hover:bg-cyan-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              Envoyer
            </button>
          </div>
        </div>
      </div>
      {/* Modal création groupe */}
      {showCreateGroup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Créer un groupe
            </h2>
            <input
              type="text"
              placeholder="Nom du groupe"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="border border-gray-300 rounded-lg w-full mb-4 p-3 focus:outline-none focus:border-cyan-500"
            />
            <div className="max-h-64 overflow-y-auto mb-4 border border-gray-200 rounded-lg p-3">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">
                Sélectionner les membres :
              </h3>
              {onlineUsers.map((u) => (
                <label
                  key={u.id}
                  className="flex items-center gap-3 p-2 rounded hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    value={u.id}
                    onChange={(e) => {
                      const id = Number(e.target.value);
                      setSelectedUsersForGroup((prev) =>
                        e.target.checked
                          ? [...prev, id]
                          : prev.filter((uid) => uid !== id)
                      );
                    }}
                    className="rounded text-cyan-600 focus:ring-cyan-500"
                  />
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                      {u.nom.charAt(0)}
                      {u.prenom.charAt(0)}
                    </div>
                    <span className="text-gray-700">
                      {u.nom} {u.prenom}
                    </span>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium"
                onClick={() => setShowCreateGroup(false)}
              >
                Annuler
              </button>
              <button
                className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 font-medium"
                onClick={handleCreateGroup}
              >
                Créer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CanalCommunication;
