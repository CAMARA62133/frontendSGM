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
  User,
  Home,
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
    color: "text-gray-600",
  },
  {
    name: "Messages envoyés",
    href: "/messaging/sent",
    icon: Send,
    color: "text-gray-600",
  },
  {
    name: "Brouillons",
    href: "/messaging/drafts",
    icon: FileText,
    badge: 0,
    color: "text-gray-600",
  },
  {
    name: "Favoris",
    href: "/messaging/favorites",
    icon: Star,
    badge: 0,
    color: "text-gray-600",
  },
  {
    name: "Archives",
    href: "/messaging/archived",
    icon: Archive,
    badge: 0,
    color: "text-gray-600",
  },
  {
    name: "Corbeille",
    href: "/messaging/trash",
    icon: Trash2,
    badge: 0,
    color: "text-gray-600",
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
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
    const stop = autoRefresh(fetchAllCounts, 8000);
    return () => stop();
  }, [fetchAllCounts]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

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
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-cyan-50/10 to-blue-50/20 overflow-hidden">
      {/* ===========================
           SIDEBAR DESKTOP
         =========================== */}
      <aside className="hidden md:flex w-80 bg-white/95 backdrop-blur-sm border-r border-gray-100 flex-col shadow-xl">
        {/* Header sidebar */}
        <div className="p-6 border-b border-gray-100/80">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-cyan-500 bg-clip-text text-transparent">
                Messagerie
              </h2>
              <p className="text-sm text-gray-500 mt-1">Gestion des messages</p>
            </div>
          </div>
        </div>

        {/* Bouton Nouveau message */}
        <div className="p-4 border-b border-gray-100/60">
          <button
            onClick={() => setIsComposeOpen(true)}
            className="flex items-center gap-3 w-full px-4 py-3.5 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:from-cyan-600 hover:to-cyan-700 group"
          >
            <PenSquare className="w-5 h-5 transition-transform group-hover:scale-110" />
            <span className="font-semibold">Nouveau message</span>
          </button>
        </div>

        {/* Menu navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1.5">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                      isActive
                        ? "bg-gradient-to-r from-cyan-50 to-cyan-50/80 border border-cyan-200 shadow-sm"
                        : "text-gray-700 hover:bg-gray-50/80 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg transition-colors ${
                          isActive
                            ? "bg-cyan-100 text-cyan-600"
                            : "bg-gray-100 text-gray-600 group-hover:bg-cyan-100/50 group-hover:text-cyan-600"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span
                        className={`font-medium ${
                          isActive ? "text-cyan-700" : "text-gray-700"
                        }`}
                      >
                        {item.name}
                      </span>
                    </div>
                    {item.badge && item.badge > 0 && (
                      <span
                        className={`px-2 py-1 text-xs font-bold rounded-full min-w-6 text-center ${
                          isActive
                            ? "bg-cyan-500 text-white"
                            : "bg-pink-500 text-white shadow-sm"
                        }`}
                      >
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
        className={`fixed inset-0 z-40 md:hidden transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />

        <aside className="relative w-80 bg-white/95 backdrop-blur-sm h-full border-r border-gray-100 flex flex-col shadow-2xl">
          <div className="p-6 border-b border-gray-100/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-cyan-600">Messagerie</h2>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="p-4 border-b border-gray-100/60">
            <button
              onClick={() => {
                setIsComposeOpen(true);
                setSidebarOpen(false);
              }}
              className="flex items-center gap-3 w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <PenSquare className="w-5 h-5" />
              <span className="font-semibold">Nouveau message</span>
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1.5">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                        isActive
                          ? "bg-cyan-50 text-cyan-600 border border-cyan-200"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            isActive ? "bg-cyan-100" : "bg-gray-100"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="font-medium">{item.name}</span>
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
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between bg-white/80 backdrop-blur-sm border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-gray-900">
                {menuItems.find((item) => item.href === pathname)?.name ||
                  "Messagerie"}
              </h1>
            </div>
          </div>

          {/* Menu utilisateur */}
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
                  <User className="w-4 h-4 text-white" />
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
        </header>

        {/* Contenu principal */}
        <main className="flex-1 min-h-0 bg-gradient-to-br from-slate-50/50 via-cyan-50/10 to-blue-50/20 p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
       
            <Outlet />
          </div>
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
