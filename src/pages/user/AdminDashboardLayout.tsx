
import { useState } from "react";
import { Users, LogOut, Menu, X, Home } from "lucide-react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import AddUserModal from "./AddUser";
import { useAuth } from "../../context/useAuth";

const initialMenuItems = [
  { name: "Utilisateurs", href: "/admin/users", icon: Users },
];

export default function AdminDashboardLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-64 lg:w-72 bg-white border-r border-gray-100 flex-col">
        <div className="h-20 flex items-center px-8 border-b border-gray-50">
          <h2 className="text-xl lg:text-2xl font-extrabold bg-gradient-to-r from-cyan-600 to-cyan-400 bg-clip-text text-transparent truncate">
            {user?.type === "admin" ? "AdminPro" : "DirecteurPro"}
          </h2>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4">
          <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
            Menu Principal
          </p>
          <ul className="space-y-1">
            {initialMenuItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={`group flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-cyan-50 text-cyan-600 shadow-sm shadow-cyan-100"
                        : "text-gray-500 hover:bg-gray-50 hover:text-cyan-600"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 transition-colors ${isActive ? "text-cyan-600" : "text-gray-400 group-hover:text-cyan-500"}`}
                    />
                    <span className="ml-3 font-semibold text-sm">
                      {item.name}
                    </span>
                    {isActive && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-500" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-20 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 md:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-2.5 rounded-xl bg-gray-50 text-gray-600 hover:bg-cyan-50 hover:text-cyan-600 transition-all"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden md:block">
              <h1 className="text-sm text-gray-400 font-medium">Bienvenue,</h1>
              <p className="text-lg font-bold text-gray-900">Tableau de Bord</p>
            </div>
          </div>

        
          {/* Menu utilisateur */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="w-10 h-10 flex items-center justify-center 
               rounded-full bg-pink-600 hover:bg-pink-700 
               transition-colors duration-300 overflow-hidden" 
            >
              {user?.photo ? (
                <img
                  src={`${import.meta.env.VITE_API_URL}${user.photo}`} 
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Si l'image ne charge pas (404), on affiche les initiales
                    e.currentTarget.style.display = "none";
                    e.currentTarget.parentElement!.innerHTML = `<span class="text-white font-bold text-lg">${(user?.prenom?.[0] || "").toUpperCase()}${(user?.nom?.[0] || "").toUpperCase()}</span>`;
                  }}
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

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Sidebar Mobile (Améliorée) */}
      <div
        className={`fixed inset-0 z-[60] md:hidden ${sidebarOpen ? "visible" : "invisible"}`}
      >
        <div
          className={`absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity duration-300 ${sidebarOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setSidebarOpen(false)}
        />
        <aside
          className={`absolute left-0 top-0 w-[280px] bg-white h-full shadow-2xl transition-transform duration-300 ease-out transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="p-6 h-20 flex items-center justify-between border-b border-gray-50">
            <h2 className="text-xl font-black text-cyan-600">EduLinker</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg bg-gray-50"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <nav className="p-4">
            <ul className="space-y-2">
              {initialMenuItems.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={`flex items-center px-4 py-3.5 rounded-xl font-bold text-sm ${pathname === item.href ? "bg-cyan-50 text-cyan-600" : "text-gray-500"}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      </div>

      <AddUserModal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
      />
    </div>
  );
}
