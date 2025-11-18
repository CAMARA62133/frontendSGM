"use client";

import { useState } from "react";
import {
  Mail,
  UserPlus,
  Users,
  LogOut,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import AddUserModal from "./AddUser";
import { useAuth } from "../../context/useAuth";

// ======================================
// Menu initial avec icônes et routes
// ======================================
const initialMenuItems = [
  { name: "Utilisateurs", href: "/admin/users", icon: Users },
  { name: "Messages", href: "/admin/messages", icon: Mail },
 
];

// ======================================
// Composant principal : Admin Dashboard
// ======================================
export default function AdminDashboardLayout() {
  // ----------------------------------
  // Auth & navigation
  // ----------------------------------
  const { logout, user } = useAuth(); // Gestion de l'utilisateur connecté
  const navigate = useNavigate(); // Pour redirection
  const location = useLocation(); // Pour savoir quelle route est active
  const pathname = location.pathname;

  // ----------------------------------
  // États locaux
  // ----------------------------------
  const [sidebarOpen, setSidebarOpen] = useState(false); // Sidebar mobile
  const [userMenuOpen, setUserMenuOpen] = useState(false); // Menu utilisateur
  const [isAddUserOpen, setIsAddUserOpen] = useState(false); // Modal ajout utilisateur

  // ----------------------------------
  // Handler : Déconnexion
  // ----------------------------------
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // ----------------------------------
  // Menu items (actifs ou non)
  // ----------------------------------
  const menuItems = initialMenuItems.map((item) => ({ ...item }));

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* ===================== */}
      {/* Sidebar Desktop */}
      {/* ===================== */}
      <aside className="hidden md:flex w-72 bg-white border-r border-gray-200 flex-col shadow-sm">
        {/* Logo / titre */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-cyan-600">
            <span>
              {user?.type === "admin"
                ? "Admin Dashboard"
                : user?.type === "directeur"
                ? "Directeur Dashboard"
                : ""}
            </span>
          </h2>
        </div>

        {/* Menu navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-cyan-50 text-cyan-600 border-r-2 border-cyan-500"
                        : "text-gray-700 hover:bg-gray-50 hover:text-cyan-600"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        isActive ? "text-cyan-600" : "text-gray-500"
                      }`}
                    />
                    <span className="ml-3 font-medium">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* ===================== */}
      {/* Sidebar Mobile */}
      {/* ===================== */}
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

        <aside className="relative w-72 bg-white h-full border-r border-gray-200 flex flex-col shadow-xl">
          {/* Header mobile */}
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-cyan-600">
              Admin Dashboard
            </h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Menu mobile */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {/* Bouton ajouter utilisateur */}
              <li>
                <button
                  onClick={() => {
                    setIsAddUserOpen(true);
                    setSidebarOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all duration-200 text-cyan-600 hover:bg-cyan-50 border border-cyan-200"
                >
                  <UserPlus className="w-5 h-5" />
                  <span className="font-medium">Ajouter un utilisateur</span>
                </button>
              </li>

              {/* Liens menu */}
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive
                          ? "bg-cyan-50 text-cyan-600 border-r-2 border-cyan-500"
                          : "text-gray-700 hover:bg-gray-50 hover:text-cyan-600"
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon
                        className={`w-5 h-5 ${
                          isActive ? "text-cyan-600" : "text-gray-500"
                        }`}
                      />
                      <span className="ml-3 font-medium">{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>
      </div>

      {/* ===================== */}
      {/* Contenu principal */}
      {/* ===================== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            {/* Bouton mobile pour ouvrir sidebar */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900 hidden sm:block">
              Tableau de Bord
            </h1>
          </div>

          {/* Menu utilisateur */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-cyan-50 transition-all duration-200 border border-transparent hover:border-cyan-200"
            >
              {/* Avatar */}
              <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center shadow-sm overflow-hidden">
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

              {/* Nom utilisateur */}
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900">
                  {user?.prenom} {user?.nom}
                </p>
                <p className="text-xs text-gray-500">{user?.type}</p>
              </div>

              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                  userMenuOpen ? "rotate-180 text-cyan-600" : ""
                }`}
              />
            </button>

            {/* Dropdown utilisateur */}
            {userMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setUserMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.prenom} {user?.nom}
                    </p>
                    <p className="text-sm text-gray-600 truncate mt-1">
                      {user?.email}
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

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>

      {/* ===================== */}
      {/* Modal Ajouter Utilisateur */}
      {/* ===================== */}
      <AddUserModal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
      />
    </div>
  );
}
