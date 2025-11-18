"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Mail,
  Send,
  FileText,
  Archive,
  PenSquare,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Star,
  Trash2,
  MessageSquare,
} from "lucide-react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import EmailComposerModal from "./MessageForm";
import {
  nombreMessagesNonLus,
  nombreBrouillons,
  nombreMessagesCorbeille,
  nombreMessagesArchives,
  nombreMessagesFavoris,
  autoRefresh,
} from "../../services/messageService";
import { useAuth } from "../../context/useAuth";

/**
 * Items du menu de la messagerie.
 * Chaque item peut contenir un badge pour afficher le nombre de messages.
 */
const initialMenuItems = [
  {
    name: "Boîte de réception",
    href: "/messaging/inbox",
    icon: Mail,
    badge: 0,
    color: "text-gray-700",
  },
  {
    name: "Messages envoyés",
    href: "/messaging/sent",
    icon: Send,
    color: "text-gray-700",
  },
  {
    name: "Brouillons",
    href: "/messaging/drafts",
    icon: FileText,
    badge: 0,
    color: "text-gray-700",
  },
  {
    name: "Favoris",
    href: "/messaging/favorites",
    icon: Star,
    badge: 0,
    color: "text-gray-700",
  },
  {
    name: "Archives",
    href: "/messaging/archived",
    icon: Archive,
    badge: 0,
    color: "text-gray-700",
  },
  {
    name: "Corbeille",
    href: "/messaging/trash",
    icon: Trash2,
    badge: 0,
    color: "text-gray-700",
  },
  // 🔹 Nouveau : Canal de chat
  {
    name: "Canal de chat",
    href: "/messaging/canal",
    icon: MessageSquare,
    color: "text-gray-700",
  },
];

/**
 * Composant principal de la messagerie.
 * Gère la sidebar (desktop & mobile), le menu utilisateur et la fenêtre de composition.
 */
export default function MessagingLayout() {
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;

  // États pour l'UI
  const [sidebarOpen, setSidebarOpen] = useState(false); // sidebar mobile
  const [isComposeOpen, setIsComposeOpen] = useState(false); // modal de nouveau message
  const [userMenuOpen, setUserMenuOpen] = useState(false); // menu utilisateur
  const [unreadCount, setUnreadCount] = useState(0);
  const [draftCount, setDraftCount] = useState(0);
  const [trashCount, setTrashCount] = useState(0);
  const [archiveCount, setArchiveCount] = useState(0);
  const [favoriCount, setFavoriCount] = useState(0);

  // ===========================
  // FONCTIONS POUR LES BADGES
  // ===========================

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await nombreMessagesNonLus();
      setUnreadCount(response.count ?? 0);
    } catch {
      setUnreadCount(0);
    }
  }, []);

  const fetchDraftCount = useCallback(async () => {
    try {
      const response = await nombreBrouillons();
      setDraftCount(response.count ?? 0);
    } catch {
      setDraftCount(0);
    }
  }, []);

  const fetchTrashCount = useCallback(async () => {
    try {
      const response = await nombreMessagesCorbeille();
      setTrashCount(response.count ?? 0);
    } catch {
      setTrashCount(0);
    }
  }, []);

  const fetchArchiveCount = useCallback(async () => {
    try {
      const response = await nombreMessagesArchives();
      console.log(response.count);
      
      setArchiveCount(response.count ?? 0);
    } catch {
      setArchiveCount(0);
    }
  }, []);

  const fetchFavoriCount = useCallback(async () => {
    try {
      const response = await nombreMessagesFavoris();
      setFavoriCount(response.count ?? 0);
    } catch {
      setFavoriCount(0);
    }
  }, []);

  // ===========================
  // USEEFFECT POUR RÉCUPÉRER LES BADGES
  // ===========================
const fetchAllCounts = useCallback(async () => {
  await fetchUnreadCount();
  await fetchDraftCount();
  await fetchTrashCount();
  await fetchArchiveCount();
  await fetchFavoriCount();
}, [
  fetchUnreadCount,
  fetchDraftCount,
  fetchTrashCount,
  fetchArchiveCount,
  fetchFavoriCount,
]);

useEffect(() => {
  // 🔁 Auto-refresh fluide
  const stop = autoRefresh(fetchAllCounts, 8000);

  return () => stop();
}, [fetchAllCounts]);

  // ===========================
  // LOGOUT
  // ===========================
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // ===========================
  // MENU ITEMS AVEC BADGES DYNAMIQUES
  // ===========================
  const menuItems = initialMenuItems.map((item) => {
    switch (item.href) {
      case "/messaging/inbox":
        return { ...item, badge: unreadCount };
      case "/messaging/drafts":
        return { ...item, badge: draftCount };
      case "/messaging/trash":
        return { ...item, badge: trashCount };
      case "/messaging/archived":
        return { ...item, badge: archiveCount };
      case "/messaging/favorites":
        return { ...item, badge: favoriCount };
      default:
        return item;
    }
  });

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* ===========================
           SIDEBAR DESKTOP
         =========================== */}
      <aside className="hidden md:flex w-72 bg-white border-r border-gray-200 flex-col">
        {/* Header sidebar */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-cyan-600">Messagerie</h2>
        </div>

        {/* Menu navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {/* Bouton Nouveau message */}
            <li>
              <button
                onClick={() => setIsComposeOpen(true)}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all duration-200 text-cyan-600 hover:bg-cyan-50"
              >
                <PenSquare className="w-5 h-5 text-cyan-600" />
                <span className="font-medium">Nouveau message</span>
              </button>
            </li>

            {/* Items menu */}
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-cyan-50 text-cyan-600 shadow-sm"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-5 h-5 ${
                          isActive ? "text-cyan-600" : item.color
                        }`}
                      />
                      <span
                        className={`font-medium ${
                          isActive ? "text-cyan-600" : "text-gray-700"
                        }`}
                      >
                        {item.name}
                      </span>
                    </div>
                    {item.badge && item.badge > 0 && (
                      <span className="px-2 py-1 bg-pink-500 text-white text-xs font-bold rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* ===========================
           SIDEBAR MOBILE
         =========================== */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-transform transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-black bg-opacity-30"
          onClick={() => setSidebarOpen(false)}
        />

        <aside className="relative w-72 bg-white h-full border-r border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-cyan-600">Messagerie</h2>
            <button onClick={() => setSidebarOpen(false)}>
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setIsComposeOpen(true)}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all duration-200 text-cyan-600 hover:bg-cyan-50"
                >
                  <PenSquare className="w-5 h-5 text-cyan-600" />
                  <span className="font-medium">Nouveau message</span>
                </button>
              </li>

              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive
                          ? "bg-cyan-50 text-cyan-600 shadow-sm"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-5 h-5 ${
                            isActive ? "text-cyan-600" : item.color
                          }`}
                        />
                        <span
                          className={`font-medium ${
                            isActive ? "text-cyan-600" : "text-gray-700"
                          }`}
                        >
                          {item.name}
                        </span>
                      </div>
                      {item.badge && item.badge > 0 && (
                        <span className="px-2 py-1 bg-pink-500 text-white text-xs font-bold rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>
      </div>

      {/* ===========================
           CONTENU PRINCIPAL
         =========================== */}
      <div
        className={`flex-1 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? "translate-x-72" : "translate-x-0"
        }`}
      >
        {/* Header */}
        <header className="flex items-center justify-between bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 relative z-50">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Menu utilisateur */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-cyan-50 transition-all duration-200 border border-transparent hover:border-cyan-200"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center shadow-sm overflow-hidden">
                {user?.photo ? (
                  <img
                    src={user.photo}
                    alt={`${user.prenom} ${user.nom}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-sm">
                    {user?.nom?.[0]?.toUpperCase()}
                    {user?.prenom?.[0]?.toUpperCase()}
                  </span>
                )}
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
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">
                      Connecté en tant que
                    </p>
                    <p className="text-sm text-gray-600 truncate mt-1">
                      {user?.email || "utilisateur@example.com"}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="font-medium">Se déconnecter</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Contenu principal */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* ===========================
           MODAL DE COMPOSITION DE MESSAGE
         =========================== */}
      <EmailComposerModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        onSendSuccess={() => {
          fetchUnreadCount();
          fetchDraftCount();
          fetchTrashCount();
          fetchArchiveCount();
          fetchFavoriCount();
        }}
      />
    </div>
  );
}
